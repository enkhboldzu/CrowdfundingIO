import { prisma } from "@/lib/prisma";

/* ── Category project counts (for server components) ───────────────── */

export async function getProjectCountsByCategory(): Promise<Record<string, number>> {
  try {
    const rows = await prisma.project.groupBy({
      by: ["category"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    });

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.category] = row._count._all;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

/* ── Trending / Featured projects (for server components) ──────────── */

export async function getTrendingProjects(limit = 6) {
  try {
    return await prisma.project.findMany({
      where: { status: "ACTIVE", isTrending: true },
      include: { creator: true },
      orderBy: { raised: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

/* ── Project by slug ───────────────────────────────────────────────── */

export async function getProjectBySlug(slug: string) {
  try {
    return await prisma.project.findUnique({
      where: { slug },
      include: {
        creator: true,
        rewards: { orderBy: { amount: "asc" } },
        updates: { orderBy: { createdAt: "desc" } },
      },
    });
  } catch {
    return null;
  }
}

/* ── All active projects (with optional category filter) ───────────── */

export async function getProjects(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    return await prisma.project.findMany({
      where: {
        status: "ACTIVE",
        ...(options?.category ? { category: options.category } : {}),
      },
      include: { creator: true },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    });
  } catch {
    return [];
  }
}
