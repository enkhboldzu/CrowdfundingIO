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

function editableStoryBlocks(value: unknown): EditableProjectSeed["storyBlocks"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
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

function editableFaq(value: unknown): EditableProjectSeed["faq"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const question = typeof row.question === "string" ? row.question : "";
    const answer = typeof row.answer === "string" ? row.answer : "";
    const id = typeof row.id === "string" ? row.id : `faq-${index + 1}`;
    if (!question && !answer) return [];
    return [{ id, question, answer }];
  });
}

function editableTimeline(value: unknown): EditableProjectSeed["timeline"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title : "";
    const date = typeof row.date === "string" ? row.date : "";
    const description = typeof row.description === "string" ? row.description : "";
    const id = typeof row.id === "string" ? row.id : `timeline-${index + 1}`;
    if (!title) return [];
    return [{ id, title, date, description }];
  });
}

function editableSocialLinks(value: unknown): EditableProjectSeed["socialLinks"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const row = value as Record<string, unknown>;
  return {
    website: typeof row.website === "string" ? row.website : undefined,
    facebook: typeof row.facebook === "string" ? row.facebook : undefined,
    instagram: typeof row.instagram === "string" ? row.instagram : undefined,
    discord: typeof row.discord === "string" ? row.discord : undefined,
    twitter: typeof row.twitter === "string" ? row.twitter : undefined,
  };
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

  const images = normalizeImageList(project.galleryImages).slice(0, 8);
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
    videoUrl:        project.videoUrl ?? "",
    images:          images.length > 0 ? images : coverImage ? [coverImage] : [],
    documents:       normalizeDocumentList(project.documents).slice(0, 5),
    storyBlocks:     editableStoryBlocks(project.storyBlocks),
    faq:             editableFaq(project.faq),
    timeline:        editableTimeline(project.timeline),
    socialLinks:     editableSocialLinks(project.socialLinks),
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
