import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  isOAuthProvider,
  OAUTH_FROM_COOKIE,
  OAUTH_PROVIDERS,
  OAUTH_STATE_COOKIE,
  oauthRedirectUri,
  redirectWithOAuthError,
  safeReturnPath,
} from "@/lib/oauth";

interface Params {
  params: { provider: string };
}

const OAUTH_COOKIE_MAX_AGE = 10 * 60;

export async function GET(req: NextRequest, { params }: Params) {
  if (!isOAuthProvider(params.provider)) {
    return redirectWithOAuthError(req, "provider");
  }

  const provider = OAUTH_PROVIDERS[params.provider];
  if (!provider.clientId || !provider.clientSecret) {
    return redirectWithOAuthError(req, "config");
  }

  const state = randomBytes(32).toString("base64url");
  const returnPath = safeReturnPath(req.nextUrl.searchParams.get("from"));

  const authUrl = new URL(provider.authUrl);
  authUrl.searchParams.set("client_id", provider.clientId);
  authUrl.searchParams.set("redirect_uri", oauthRedirectUri(req, params.provider));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", provider.scope);
  authUrl.searchParams.set("state", state);

  if (params.provider === "google") {
    authUrl.searchParams.set("prompt", "select_account");
  }

  const res = NextResponse.redirect(authUrl);
  const secure = process.env.NODE_ENV === "production";

  res.cookies.set(OAUTH_STATE_COOKIE, `${params.provider}:${state}`, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: OAUTH_COOKIE_MAX_AGE,
    path: "/",
  });
  res.cookies.set(OAUTH_FROM_COOKIE, returnPath, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: OAUTH_COOKIE_MAX_AGE,
    path: "/",
  });

  return res;
}
