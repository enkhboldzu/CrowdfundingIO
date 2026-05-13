import { prisma } from "@/lib/prisma";

export const projectCreatorInclude = {
  _count: { select: { projects: true } },
} as const;

/* ── Category project counts (for server components) ───────────────── */

export async function getProjectCountsByCategory(): Promise<Record<string, number>> {
  try {
    const rows = await prisma.project.groupBy({
      by: ["category"],
      where: { status: "ACTIVE", isDeleted: false },
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

/* ── Landing page projects: all active + admin-curated showcase ─────── */

export async function getLandingProjects(limit = 20) {
  try {
    const [projects, featured, trending, verified] = await Promise.all([
      // All approved (ACTIVE) projects, newest first.
      prisma.project.findMany({
        where: { status: "ACTIVE", isDeleted: false },
        include: { creator: { include: projectCreatorInclude } },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      // Admin-picked featured project.
      prisma.project.findMany({
        where: { status: "ACTIVE", isDeleted: false, isFeatured: true },
        include: { creator: { include: projectCreatorInclude } },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 1,
      }),
      // Admin-picked trending projects.
      prisma.project.findMany({
        where: {
          status: "ACTIVE",
          isDeleted: false,
          isTrending: true,
        },
        include: { creator: { include: projectCreatorInclude } },
        orderBy: [{ updatedAt: "desc" }, { raised: "desc" }, { createdAt: "desc" }],
        take: 6,
      }),
      // Verified projects also qualify for the section when more curated slots are needed.
      prisma.project.findMany({
        where: {
          status: "ACTIVE",
          isDeleted: false,
          isVerified: true,
        },
        include: { creator: { include: projectCreatorInclude } },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 6,
      }),
    ]);

    const curated = [
      ...trending,
      ...verified,
    ].filter((project, index, all) =>
      all.findIndex((candidate) => candidate.id === project.id) === index
    );

    return { projects, featured, trending: curated };
  } catch {
    return { projects: [], featured: [], trending: [] };
  }
}

/* ── Trending / Featured projects (for server components) ──────────── */

export async function getTrendingProjects(limit = 6) {
  try {
    return await prisma.project.findMany({
      where: { status: "ACTIVE", isTrending: true, isDeleted: false },
      include: { creator: { include: projectCreatorInclude } },
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
        creator: { include: projectCreatorInclude },
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
        isDeleted: false,
        ...(options?.category ? { category: options.category } : {}),
      },
      include: { creator: { include: projectCreatorInclude } },
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    });
  } catch {
    return [];
  }
}
