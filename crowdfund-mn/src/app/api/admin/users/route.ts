import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { normalizeImageSrc } from "@/lib/image-src";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const q        = searchParams.get("q") ?? "";
  const page     = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 30;

  const where = q
    ? {
        OR: [
          { name:  { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id:         true,
          name:       true,
          email:      true,
          phone:      true,
          role:       true,
          avatar:     true,
          isVerified: true,
          createdAt:  true,
          _count: { select: { projects: true, donations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        avatar: normalizeImageSrc(user.avatar),
      })),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("[/api/admin/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
