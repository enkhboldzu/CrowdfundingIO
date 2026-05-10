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

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: Category;
  coverImage: string;
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
