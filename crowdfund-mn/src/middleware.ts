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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Admin routes require role === "admin" -- verify the JWT here so we
  // never rely solely on client-side role checks.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    try {
      const session = await verifyToken(token);
      if (session.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Regular auth: presence of cfmn_auth cookie is sufficient.
  if (!request.cookies.get(AUTH_COOKIE)?.value) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
