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
const STORY_MEDIA_SECTIONS = new Set(["story", "problem", "solution", "funding", "team", "risks"]);

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

function editableStoryMedia(value: unknown): EditableProjectSeed["storyMedia"] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const row = item as Record<string, unknown>;
    const section = typeof row.section === "string" ? row.section : "";
    if (!STORY_MEDIA_SECTIONS.has(section)) return [];

    return [{
      section: section as NonNullable<EditableProjectSeed["storyMedia"]>[number]["section"],
      image: typeof row.image === "string" ? normalizeImageSrc(row.image) : null,
      label: typeof row.label === "string" ? row.label : null,
      caption: typeof row.caption === "string" ? row.caption : null,
    }];
  });
}

function editableStoryBlocks(value: unknown): EditableProjectSeed["storyBlocks"] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 10).flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];

    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title : "";
    const body = typeof row.body === "string" ? row.body : "";
    const image = typeof row.image === "string" ? normalizeImageSrc(row.image) : null;
    const caption = typeof row.caption === "string" ? row.caption : null;
    const id = typeof row.id === "string" ? row.id : `story-block-${index + 1}`;

    if (!title && !body && !image) return [];

    return [{ id, title, body, image, caption }];
  });
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
    storyMedia:      editableStoryMedia(project.storyMedia),
    storyBlocks:     editableStoryBlocks(project.storyBlocks),
    rewards:         project.rewards.map((reward) => ({
      id:          reward.id,
      title:       reward.title,
      amount:      reward.amount,
      description: reward.description,
      image:       normalizeImageSrc(reward.image),
    })),
  };

  return <CreateProjectClient initialProject={seed} />;
}
