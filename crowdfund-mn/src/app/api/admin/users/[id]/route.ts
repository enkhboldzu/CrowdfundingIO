import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getSession } from "@/lib/api-auth";

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Prevent admins from demoting themselves
  if (params.id === admin.userId) {
    return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
  }

  const body = await req.json() as {
    role?:       "USER" | "ADMIN";
    isVerified?: boolean;
  };

  const data: Record<string, unknown> = {};
  if (body.role       !== undefined) data.role       = body.role;
  if (body.isVerified !== undefined) data.isVerified = body.isVerified;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, role: true, isVerified: true },
  });

  return NextResponse.json({ user: updated });
}
