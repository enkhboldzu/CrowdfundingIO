import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { normalizeImageSrc } from "@/lib/image-src";

const VALID_STATUSES = ["PENDING", "ACTIVE", "FUNDED", "FAILED", "CANCELLED", "REJECTED"] as const;
type Status = typeof VALID_STATUSES[number];

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const statusParam = (searchParams.get("status") ?? "pending").toUpperCase();
  const q           = searchParams.get("q") ?? "";
  const page        = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize    = 20;

  const statusFilter =
    statusParam === "ALL"
      ? undefined
      : VALID_STATUSES.includes(statusParam as Status)
        ? (statusParam as Status)
        : "PENDING";

  const where = {
    isDeleted: false,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(q
      ? {
          OR: [
            { title:       { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  try {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, email: true, phone: true, isVerified: true } },
          rewards: { select: { id: true, title: true, amount: true } },
          _count:  { select: { donations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects: projects.map(project => ({
        ...project,
        coverImage: normalizeImageSrc(project.coverImage),
      })),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("[/api/admin/projects]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
