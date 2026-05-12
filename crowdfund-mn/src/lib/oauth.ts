import { NextRequest, NextResponse } from "next/server";

export type OAuthProvider = "google";

export const OAUTH_STATE_COOKIE = "cfmn_oauth_state";
export const OAUTH_FROM_COOKIE = "cfmn_oauth_from";

export const OAUTH_PROVIDERS: Record<OAuthProvider, {
  clientId?: string;
  clientSecret?: string;
  authUrl: string;
  tokenUrl: string;
  scope: string;
}> = {
  google: {
    clientId:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authUrl:      "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl:     "https://oauth2.googleapis.com/token",
    scope:        "openid email profile",
  },
};

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google";
}

export function appBaseUrl(req: NextRequest): string {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    req.nextUrl.origin
  ).replace(/\/$/, "");
}

export function oauthRedirectUri(req: NextRequest, provider: OAuthProvider): string {
  return `${appBaseUrl(req)}/api/auth/oauth/${provider}/callback`;
}

export function safeReturnPath(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) return "/";
  return value;
}

export function redirectWithOAuthError(req: NextRequest, code: string) {
  const url = new URL("/login", appBaseUrl(req));
  url.searchParams.set("oauth_error", code);
  return NextResponse.redirect(url);
}
