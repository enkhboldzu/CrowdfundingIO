import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/session";
import { normalizeImageSrc } from "@/lib/image-src";
import {
  appBaseUrl,
  isOAuthProvider,
  OAUTH_FROM_COOKIE,
  OAUTH_PROVIDERS,
  OAUTH_STATE_COOKIE,
  oauthRedirectUri,
  redirectWithOAuthError,
  safeReturnPath,
  type OAuthProvider,
} from "@/lib/oauth";

interface Params {
  params: { provider: string };
}

interface OAuthProfile {
  email: string;
  name: string;
  avatar: string | null;
}

const SESSION_COOKIE = "cfmn_session";
const AUTH_COOKIE = "cfmn_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24;

export async function GET(req: NextRequest, { params }: Params) {
  if (!isOAuthProvider(params.provider)) {
    return redirectWithOAuthError(req, "provider");
  }

  const error = req.nextUrl.searchParams.get("error");
  if (error) return redirectWithOAuthError(req, "cancelled");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || expectedState !== `${params.provider}:${state}`) {
    return redirectWithOAuthError(req, "state");
  }

  try {
    const profile = await fetchOAuthProfile(req, params.provider, code);
    const user = await findOrCreateOAuthUser(profile);
    const role = user.role === "ADMIN" ? "admin" : "user";
    const token = await createToken({ userId: user.id, role, name: user.name });

    const from = safeReturnPath(req.cookies.get(OAUTH_FROM_COOKIE)?.value);
    const res = NextResponse.redirect(new URL(from, appBaseUrl(req)));
    const secure = process.env.NODE_ENV === "production";

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    res.cookies.set(AUTH_COOKIE, role, {
      sameSite: "lax",
      secure,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    res.cookies.delete(OAUTH_STATE_COOKIE);
    res.cookies.delete(OAUTH_FROM_COOKIE);

    return res;
  } catch (err) {
    console.error("[oauth callback]", err instanceof Error ? err.message : err);
    return redirectWithOAuthError(req, "failed");
  }
}

async function fetchOAuthProfile(
  req: NextRequest,
  providerName: OAuthProvider,
  code: string
): Promise<OAuthProfile> {
  const provider = OAUTH_PROVIDERS[providerName];
  if (!provider.clientId || !provider.clientSecret) {
    throw new Error("OAuth provider is not configured");
  }

  return fetchGoogleProfile(req, code);
}

async function fetchGoogleProfile(req: NextRequest, code: string): Promise<OAuthProfile> {
  const provider = OAUTH_PROVIDERS.google;
  const tokenRes = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     provider.clientId!,
      client_secret: provider.clientSecret!,
      redirect_uri:  oauthRedirectUri(req, "google"),
      grant_type:    "authorization_code",
    }),
  });

  if (!tokenRes.ok) throw new Error("Google token exchange failed");
  const tokenJson = await tokenRes.json() as { access_token?: string };
  if (!tokenJson.access_token) throw new Error("Google access token missing");

  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` },
  });

  if (!profileRes.ok) throw new Error("Google profile fetch failed");
  const profile = await profileRes.json() as {
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  if (!profile.email || profile.email_verified === false) {
    throw new Error("Google email is missing or unverified");
  }

  return {
    email:  profile.email.toLowerCase(),
    name:   profile.name?.trim() || profile.email.split("@")[0],
    avatar: normalizeImageSrc(profile.picture),
  };
}

async function findOrCreateOAuthUser(profile: OAuthProfile) {
  const existing = await prisma.user.findUnique({ where: { email: profile.email } });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        avatar:     profile.avatar ?? existing.avatar,
        isVerified: true,
      },
    });
  }

  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 12);

  return prisma.user.create({
    data: {
      name: profile.name,
      email: profile.email,
      passwordHash,
      avatar: profile.avatar,
      isVerified: true,
    },
  });
}
