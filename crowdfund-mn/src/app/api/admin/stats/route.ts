import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [
      totalProjects,
      pendingCount,
      activeCount,
      rejectedCount,
      totalUsers,
      raisedAgg,
    ] = await Promise.all([
      prisma.project.count({ where: { isDeleted: false } }),
      prisma.project.count({ where: { status: "PENDING",  isDeleted: false } }),
      prisma.project.count({ where: { status: "ACTIVE",   isDeleted: false } }),
      prisma.project.count({ where: { status: "REJECTED", isDeleted: false } }),
      prisma.user.count(),
      prisma.project.aggregate({
        where: { status: { in: ["ACTIVE", "FUNDED"] }, isDeleted: false },
        _sum: { raised: true, backers: true },
      }),
    ]);

    return NextResponse.json({
      totalProjects:  totalProjects  ?? 0,
      pendingCount:   pendingCount   ?? 0,
      activeCount:    activeCount    ?? 0,
      rejectedCount:  rejectedCount  ?? 0,
      totalUsers:     totalUsers     ?? 0,
      totalRaised:    Number(raisedAgg._sum.raised  ?? 0),
      totalBackers:   Number(raisedAgg._sum.backers ?? 0),
    });
  } catch (err) {
    console.error("[/api/admin/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
