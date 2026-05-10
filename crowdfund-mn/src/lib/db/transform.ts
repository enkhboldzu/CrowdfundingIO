import type { Project, RewardTier, FundingUpdate, ProjectStatus } from "@/types";

interface DBUser {
  id: string;
  name: string;
  avatar: string | null;
  isVerified: boolean;
}

interface DBProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  coverImage: string | null;
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

interface DBRewardTier {
  id: string;
  title: string;
  amount: number;
  description: string;
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

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80";

function sanitizeImage(src: string | null | undefined): string {
  if (!src) return DEFAULT_COVER;
  if (/^(https?:\/\/|\/)/.test(src)) return src;
  return DEFAULT_COVER;
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
    category:        p.category as Project["category"],
    coverImage:      sanitizeImage(p.coverImage),
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
      avatar:       sanitizeImage(p.creator.avatar) !== DEFAULT_COVER
                      ? sanitizeImage(p.creator.avatar)
                      : `https://i.pravatar.cc/48?u=${p.creator.id}`,
      isVerified:   p.creator.isVerified,
      projectCount: 0,
    },
  };
}

export function toRewardTier(r: DBRewardTier): RewardTier {
  return {
    id:                r.id,
    title:             r.title,
    amount:            r.amount,
    description:       r.description,
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
