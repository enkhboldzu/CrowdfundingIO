import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { normalizeImageSrc } from "@/lib/image-src";

export async function GET(req: NextRequest) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, avatar: true },
  });

  return NextResponse.json(
    {
      authenticated: true,
      role: session.role,
      user: {
        name: user?.name ?? session.name,
        email: user?.email ?? null,
        avatar: normalizeImageSrc(user?.avatar),
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
