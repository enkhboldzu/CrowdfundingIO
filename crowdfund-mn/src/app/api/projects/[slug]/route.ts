import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectCreatorInclude } from "@/lib/db/queries";
import { toProject, toRewardTier, toFundingUpdate } from "@/lib/db/transform";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const p = await prisma.project.findUnique({
      where: { slug: params.slug, isDeleted: false },
      include: {
        creator: { include: projectCreatorInclude },
        rewards: { orderBy: { amount: "asc" } },
        updates: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!p || p.isDeleted || (p.status !== "ACTIVE" && p.status !== "FUNDED")) {
      return NextResponse.json({ error: "Төсөл олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json({
      project: toProject(p),
      rewards: p.rewards.map(toRewardTier),
      updates: p.updates.map(toFundingUpdate),
    });
  } catch (err) {
    console.error("[GET /api/projects/[slug]]", err);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
