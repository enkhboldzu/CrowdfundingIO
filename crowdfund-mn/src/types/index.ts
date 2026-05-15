export type Category =
  | "technology"
  | "arts"
  | "film"
  | "environment"
  | "games"
  | "health"
  | "education"
  | "community"
  | "food"
  | "fashion"
  | "music"
  | "publishing"
  | "social"
  | "startups";

export type ProjectStatus = "PENDING" | "ACTIVE" | "FUNDED" | "FAILED" | "CANCELLED" | "REJECTED";

export type ProjectStorySectionKey = "story" | "problem" | "solution" | "funding" | "team" | "risks";

export interface ProjectStoryMedia {
  section: ProjectStorySectionKey;
  image?: string | null;
  label?: string | null;
  caption?: string | null;
}

export interface ProjectStoryBlock {
  id: string;
  title: string;
  body: string;
  image: string;
  caption?: string | null;
}

export interface ProjectFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ProjectTimelineItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

export interface ProjectSocialLinks {
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  discord?: string | null;
  twitter?: string | null;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  story?: string | null;
  purpose?: string | null;
  fundingUsage?: string | null;
  teamInfo?: string | null;
  risks?: string | null;
  category: Category;
  coverImage: string;
  galleryImages?: string[];
  videoUrl?: string | null;
  documents?: string[];
  storyMedia?: ProjectStoryMedia[];
  storyBlocks?: ProjectStoryBlock[];
  faq?: ProjectFaqItem[];
  timeline?: ProjectTimelineItem[];
  socialLinks?: ProjectSocialLinks;
  creator: Creator;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  isVerified: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  tags: string[];
  // Admin-visible fields
  status?: ProjectStatus;
  isDeleted?: boolean;
  publishedAt?: string | null;
  rejectionReason?: string | null;
  location?: string;
  endsAt?: string;
  createdAt?: string;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  projectCount: number;
}

export interface RewardTier {
  id: string;
  title: string;
  amount: number;
  description: string;
  image?: string | null;
  backerCount: number;
  estimatedDelivery: string;
  isLimited: boolean;
  remaining?: number;
}

export interface FundingUpdate {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  projectId: string;
}

export type PaymentMethod = "qpay" | "socialpay" | "card" | "apple_pay";
