import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/session";

// cfmn_session = httpOnly JWT, used to verify identity server-side
// cfmn_auth    = plain role string ("user"|"admin"), client-only presence check
const SESSION_COOKIE = "cfmn_session";
const AUTH_COOKIE    = "cfmn_auth";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/admin/signup",
]);

const PUBLIC_PREFIXES = [
  "/public-api",
  "/api/projects",
  "/api/stats/public-summary",
  "/api/categories/counts",
];

function redirectToLogin(request: NextRequest, pathname: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("from", pathname);
  const response = NextResponse.redirect(url);
  response.cookies.delete(AUTH_COOKIE);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // Admin routes require role === "admin" -- verify the JWT here so we
  // never rely solely on client-side role checks.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return redirectToLogin(request, pathname);
    }
    try {
      const session = await verifyToken(token);
      if (session.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return redirectToLogin(request, pathname);
    }
    return NextResponse.next();
  }

  // Let API route handlers return JSON auth errors instead of redirecting
  // multipart/form-data POST bodies to the login page.
  if (pathname.startsWith("/api/") || pathname === "/upload-api") {
    return NextResponse.next();
  }

  // Regular auth: verify the server session cookie, not only the UI cookie.
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return redirectToLogin(request, pathname);
  }

  try {
    await verifyToken(token);
  } catch {
    return redirectToLogin(request, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
