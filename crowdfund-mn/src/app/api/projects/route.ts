import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectCreatorInclude } from "@/lib/db/queries";
import { toProject } from "@/lib/db/transform";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const q        = searchParams.get("q");
  const sort     = searchParams.get("sort") ?? "trending";

  try {
    // Only show projects that are ACTIVE (admin-approved).
    const where = {
      status: "ACTIVE" as const,
      isDeleted: false,
      ...(category && category !== "all" ? { category } : {}),
      ...(q
        ? {
            OR: [
              { title:       { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const orderBy =
      sort === "ending_soon"  ? { endsAt:     "asc"  as const } :
      sort === "most_funded"  ? { raised:     "desc" as const } :
      sort === "newest"       ? { createdAt:  "desc" as const } :
                                { raised:     "desc" as const }; // trending

    const [projects, total, agg] = await Promise.all([
      prisma.project.findMany({
        where,
        include: { creator: { include: projectCreatorInclude } },
        orderBy,
        take: 60,
      }),
      prisma.project.count({ where }),
      prisma.project.aggregate({
        where,
        _sum: { raised: true, backers: true },
      }),
    ]);

    return NextResponse.json({
      projects:     projects.map(toProject),
      total,
      totalRaised:  agg._sum.raised  ?? 0,
      totalBackers: agg._sum.backers ?? 0,
    });
  } catch (err) {
    console.error("[GET /api/projects]", err);
    return NextResponse.json(
      { projects: [], total: 0, totalRaised: 0, totalBackers: 0 },
      { status: 200 }
    );
  }
}
