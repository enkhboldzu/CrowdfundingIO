import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/db/queries";
import { toProject, toRewardTier, toFundingUpdate } from "@/lib/db/transform";
import { ProjectDetailClient } from "./ProjectDetailClient";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProjectBySlug(params.slug);
  if (!p) return { title: "Төсөл олдсонгүй — Crowdfund.mn" };
  return {
    title:       `${p.title} — Crowdfund.mn`,
    description: p.description,
    openGraph:   { images: p.coverImage ? [p.coverImage] : [] },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const p = await getProjectBySlug(params.slug);
  if (!p) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const project = toProject(p as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rewards = (p as any).rewards?.map(toRewardTier) ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates = (p as any).updates?.map(toFundingUpdate) ?? [];

  return (
    <ProjectDetailClient
      project={project}
      rewards={rewards}
      updates={updates}
    />
  );
}
