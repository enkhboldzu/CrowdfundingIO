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

    const userIds = users.map(user => user.id);
    const [donationStats, recentDonationGroups] = userIds.length > 0
      ? await Promise.all([
          prisma.donation.groupBy({
            by: ["userId"],
            where: {
              userId: { in: userIds },
              status: "COMPLETED",
            },
            _count: { _all: true },
            _sum: { amount: true },
          }),
          Promise.all(
            userIds.map(userId =>
              prisma.donation.findMany({
                where: { userId, status: "COMPLETED" },
                orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
                take: 3,
                select: {
                  id: true,
                  amount: true,
                  paymentMethod: true,
                  qpayPaymentId: true,
                  createdAt: true,
                  paidAt: true,
                  userId: true,
                  project: { select: { id: true, title: true, slug: true } },
                  rewardTier: { select: { title: true } },
                },
              })
            )
          ),
        ])
      : [[], []];

    const statsByUser = new Map(
      donationStats
        .filter(stat => stat.userId)
        .map(stat => [
          stat.userId as string,
          {
            count: stat._count._all,
            total: Number(stat._sum.amount ?? 0),
          },
        ])
    );

    const recentByUser = new Map(
      recentDonationGroups.map((donations, index) => [userIds[index], donations])
    );

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        avatar: normalizeImageSrc(user.avatar),
        donationTotal: statsByUser.get(user.id)?.total ?? 0,
        recentDonations: recentByUser.get(user.id) ?? [],
        _count: {
          ...user._count,
          donations: statsByUser.get(user.id)?.count ?? 0,
        },
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
