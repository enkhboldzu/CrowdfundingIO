import { NextResponse } from "next/server";
import { getPublicStats } from "@/lib/db/stats";
import { getLandingProjects, getProjectCountsByCategory } from "@/lib/db/queries";
import { toProject } from "@/lib/db/transform";

/* Re-validate at most once per minute — fast enough for live stats */
export const revalidate = 60;

export async function GET() {
  try {
    const [stats, { projects: rawProjects, featured: rawFeatured, trending: rawTrending }, categoryCounts] =
      await Promise.all([
        getPublicStats(),
        getLandingProjects(20),
        getProjectCountsByCategory(),
      ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = rawProjects.map((p) => toProject(p as any));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const featured = rawFeatured.map((p) => toProject(p as any));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trending = rawTrending.map((p) => toProject(p as any));

    return NextResponse.json({ stats, projects, featured, trending, categoryCounts });
  } catch (err) {
    console.error("[GET /api/landing]", err);
    return NextResponse.json({
      stats:          { totalSuccessfulProjects: 0, totalFundingRaised: 0, totalBackers: 0, successRate: 0 },
      projects:       [],
      featured:       [],
      trending:       [],
      categoryCounts: {},
    });
  }
}
