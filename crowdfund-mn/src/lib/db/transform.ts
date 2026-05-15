import type {
  Project,
  RewardTier,
  FundingUpdate,
  ProjectStatus,
  ProjectStoryMedia,
  ProjectStorySectionKey,
  ProjectStoryBlock,
} from "@/types";
import {
  imageSrcOrFallback,
  normalizeImageList,
  normalizeImageSrc,
} from "@/lib/image-src";

interface DBUser {
  id: string;
  name: string;
  avatar: string | null;
  isVerified: boolean;
  _count?: { projects: number };
}

interface DBProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  story?: string | null;
  purpose?: string | null;
  fundingUsage?: string | null;
  teamInfo?: string | null;
  risks?: string | null;
  category: string;
  coverImage: string | null;
  galleryImages?: string[];
  videoUrl?: string | null;
  storyMedia?: unknown;
  storyBlocks?: unknown;
  goal: number;
  raised: number;
  backers: number;
  endsAt: Date;
  isVerified: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  tags: string[];
  status?: string;
  isDeleted?: boolean;
  publishedAt?: Date | null;
  rejectionReason?: string | null;
  location?: string;
  createdAt?: Date;
  creator: DBUser;
}

const STORY_MEDIA_SECTIONS = new Set<ProjectStorySectionKey>([
  "story",
  "problem",
  "solution",
  "funding",
  "team",
  "risks",
]);

function normalizeStoryMedia(value: unknown): ProjectStoryMedia[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): ProjectStoryMedia[] => {
    if (!item || typeof item !== "object") return [];

    const row = item as Record<string, unknown>;
    const section = typeof row.section === "string" ? row.section : "";
    if (!STORY_MEDIA_SECTIONS.has(section as ProjectStorySectionKey)) return [];

    const image = normalizeImageSrc(typeof row.image === "string" ? row.image : null);
    const label = typeof row.label === "string" ? row.label.trim() : "";
    const caption = typeof row.caption === "string" ? row.caption.trim() : "";

    if (!image && !label && !caption) return [];

    return [{
      section: section as ProjectStorySectionKey,
      image,
      label: label || null,
      caption: caption || null,
    }];
  });
}

function normalizeStoryBlocks(value: unknown): ProjectStoryBlock[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 10).flatMap((item, index): ProjectStoryBlock[] => {
    if (!item || typeof item !== "object") return [];

    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const body = typeof row.body === "string" ? row.body.trim() : "";
    const image = normalizeImageSrc(typeof row.image === "string" ? row.image : null);
    const caption = typeof row.caption === "string" ? row.caption.trim() : "";
    const id = typeof row.id === "string" && row.id.trim()
      ? row.id.trim()
      : `story-block-${index + 1}`;

    if (!title || !body || !image) return [];

    return [{
      id,
      title,
      body,
      image,
      caption: caption || null,
    }];
  });
}

interface DBRewardTier {
  id: string;
  title: string;
  amount: number;
  description: string;
  image: string | null;
  backerCount: number;
  estimatedDelivery: string;
  isLimited: boolean;
  remaining: number | null;
}

interface DBFundingUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  projectId: string;
}

export function toProject(p: DBProject): Project {
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(p.endsAt).getTime() - Date.now()) / 86_400_000)
  );

  return {
    id:              p.id,
    title:           p.title,
    slug:            p.slug,
    description:     p.description,
    story:           p.story ?? null,
    purpose:         p.purpose ?? null,
    fundingUsage:    p.fundingUsage ?? null,
    teamInfo:        p.teamInfo ?? null,
    risks:           p.risks ?? null,
    category:        p.category as Project["category"],
    coverImage:      imageSrcOrFallback(p.coverImage),
    galleryImages:   normalizeImageList(p.galleryImages).slice(0, 3),
    videoUrl:        p.videoUrl?.trim() || null,
    storyMedia:      normalizeStoryMedia(p.storyMedia),
    storyBlocks:     normalizeStoryBlocks(p.storyBlocks),
    goal:            p.goal,
    raised:          p.raised,
    backers:         p.backers,
    daysLeft,
    isVerified:      p.isVerified,
    isTrending:      p.isTrending,
    isFeatured:      p.isFeatured,
    tags:            p.tags,
    status:          p.status as ProjectStatus | undefined,
    isDeleted:       p.isDeleted,
    publishedAt:     p.publishedAt?.toISOString() ?? null,
    rejectionReason: p.rejectionReason ?? null,
    location:        p.location,
    endsAt:          p.endsAt.toISOString(),
    createdAt:       p.createdAt?.toISOString(),
    creator: {
      id:           p.creator.id,
      name:         p.creator.name,
      avatar:       normalizeImageSrc(p.creator.avatar)
                      ?? `https://i.pravatar.cc/48?u=${p.creator.id}`,
      isVerified:   p.creator.isVerified,
      projectCount: p.creator._count?.projects ?? 0,
    },
  };
}

export function toRewardTier(r: DBRewardTier): RewardTier {
  return {
    id:                r.id,
    title:             r.title,
    amount:            r.amount,
    description:       r.description,
    image:             normalizeImageSrc(r.image),
    backerCount:       r.backerCount,
    estimatedDelivery: r.estimatedDelivery,
    isLimited:         r.isLimited,
    remaining:         r.remaining ?? undefined,
  };
}

export function toFundingUpdate(u: DBFundingUpdate): FundingUpdate {
  return {
    id:        u.id,
    title:     u.title,
    content:   u.content,
    createdAt: u.createdAt.toISOString(),
    projectId: u.projectId,
  };
}
