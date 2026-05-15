import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { normalizeDocumentList } from "@/lib/document-src";
import { normalizeImageList, normalizeImageSrc } from "@/lib/image-src";
import {
  CreateProjectClient,
  type EditableProjectSeed,
} from "@/app/create-project/CreateProjectClient";

interface Props {
  params: { slug: string };
}

const VALID_DURATIONS = new Set([7, 14, 21, 30, 45, 60]);
const OWNER_EDITABLE_STATUSES = new Set(["PENDING", "REJECTED", "ACTIVE"]);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Төсөл засах — Crowdfund.mn",
  description: "Өөрийн төслийн мэдээллийг шинэчлээд дахин хянуулахаар илгээх.",
};

function editableDuration(createdAt: Date, endsAt: Date): number {
  const days = Math.max(
    1,
    Math.round((endsAt.getTime() - createdAt.getTime()) / 86_400_000)
  );

  return VALID_DURATIONS.has(days) ? days : 30;
}

export default async function EditProjectPage({ params }: Props) {
  const session = await getSession();
  if (!session) {
    redirect(`/login?from=/projects/${params.slug}/edit`);
  }

  const project = await prisma.project.findUnique({
    where: { slug: params.slug, isDeleted: false },
    include: {
      rewards: { orderBy: { amount: "asc" } },
    },
  });

  if (
    !project ||
    project.creatorId !== session.userId ||
    !OWNER_EDITABLE_STATUSES.has(project.status)
  ) {
    notFound();
  }

  const images = normalizeImageList(project.galleryImages).slice(0, 3);
  const coverImage = normalizeImageSrc(project.coverImage);
  const seed: EditableProjectSeed = {
    id:              project.id,
    slug:            project.slug,
    title:           project.title,
    blurb:           project.description,
    category:        project.category,
    location:        project.location,
    goal:            project.goal,
    duration:        editableDuration(project.createdAt, project.endsAt),
    bankName:        project.bankName,
    bankAccount:     project.bankAccount,
    bankAccountName: project.bankAccountName,
    story:           project.story,
    purpose:         project.purpose ?? "",
    fundingUsage:    project.fundingUsage ?? "",
    teamInfo:        project.teamInfo ?? "",
    risks:           project.risks ?? "",
    videoUrl:        project.videoUrl ?? "",
    images:          images.length > 0 ? images : coverImage ? [coverImage] : [],
    documents:       normalizeDocumentList(project.documents).slice(0, 5),
    rewards:         project.rewards.map((reward) => ({
      id:          reward.id,
      title:       reward.title,
      amount:      reward.amount,
      description: reward.description,
    })),
  };

  return <CreateProjectClient initialProject={seed} />;
}
