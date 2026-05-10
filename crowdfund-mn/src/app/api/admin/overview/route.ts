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
    recentProjects,
    recentUsers,
    recentPendingProjects,
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
    // Last 5 projects by any status for the progress table
    prisma.project.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, title: true, slug: true, category: true,
        goal: true, raised: true, status: true,
        coverImage: true, createdAt: true, endsAt: true,
        creator: { select: { name: true } },
      },
    }),
    // Last 6 users for activity feed
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, createdAt: true, role: true },
    }),
    // Last 4 pending project submissions for activity feed
    prisma.project.findMany({
      where: { status: "PENDING", isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, title: true, createdAt: true },
    }),
  ]);

  // Merge and sort activity items by date, take top 8
  const activity = [
    ...recentUsers.map(u => ({
      type:    "user_signup" as const,
      id:      u.id,
      label:   u.name,
      detail:  u.role === "ADMIN" ? "Admin бүртгүүллээ" : "Шинэ хэрэглэгч бүртгүүллээ",
      time:    u.createdAt.toISOString(),
    })),
    ...recentPendingProjects.map(p => ({
      type:    "project_pending" as const,
      id:      p.id,
      label:   p.title,
      detail:  "Шинэ төсөл илгээгдлээ — батлах шаардлагатай",
      time:    p.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  return NextResponse.json({
    stats: {
      totalProjects:  totalProjects  ?? 0,
      pendingCount:   pendingCount   ?? 0,
      activeCount:    activeCount    ?? 0,
      rejectedCount:  rejectedCount  ?? 0,
      totalUsers:     totalUsers     ?? 0,
      totalRaised:    Number(raisedAgg._sum.raised  ?? 0),
      totalBackers:   Number(raisedAgg._sum.backers ?? 0),
    },
    recentProjects: recentProjects ?? [],
    activity:       activity       ?? [],
  });
  } catch (err) {
    console.error("[/api/admin/overview]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
