import { prisma } from "@/lib/prisma";

export interface PublicStats {
  totalSuccessfulProjects: number;
  totalFundingRaised:      number;
  totalBackers:            number;
  successRate:             number;
}

export async function getPublicStats(): Promise<PublicStats> {
  const [successful, raisedAgg, resolvedCount] = await Promise.all([
    // Projects that fully reached their goal
    prisma.project.count({
      where: { status: "FUNDED", isDeleted: false },
    }),
    // Raised & backers — denormalized fields on Project, same source the
    // admin dashboard uses. Include both ACTIVE and FUNDED so the numbers
    // match exactly what the admin overview shows.
    prisma.project.aggregate({
      where: { status: { in: ["ACTIVE", "FUNDED"] }, isDeleted: false },
      _sum: { raised: true, backers: true },
    }),
    // Denominator for success rate: only resolved projects count
    prisma.project.count({
      where: {
        status: { in: ["FUNDED", "FAILED", "CANCELLED"] },
        isDeleted: false,
      },
    }),
  ]);

  const totalFundingRaised = raisedAgg._sum.raised  ?? 0;
  const totalBackers       = raisedAgg._sum.backers ?? 0;
  const successRate        = resolvedCount > 0
    ? Math.round((successful / resolvedCount) * 100)
    : 0;

  return { totalSuccessfulProjects: successful, totalFundingRaised, totalBackers, successRate };
}
