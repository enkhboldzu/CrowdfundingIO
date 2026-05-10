import { NextRequest } from "next/server";
import { verifyToken, type SessionPayload } from "@/lib/session";

// cfmn_session  = httpOnly JWT (set by loginUser server action)
// cfmn_auth     = plain role string "user"|"admin" (client-only, UI state)
const SESSION_COOKIE = "cfmn_session";

export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAdmin(req: NextRequest): Promise<SessionPayload | null> {
  const session = await getSession(req);
  if (!session || session.role !== "admin") return null;
  return session;
}
