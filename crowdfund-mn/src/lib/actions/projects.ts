"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";

/* ── Slug generator ────────────────────────────────────────────────── */

function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 60);
  return `${base || "project"}-${Date.now()}`;
}

function toStoredImage(image?: string): string | null {
  if (!image) return null;
  return /^(https?:\/\/|\/)/.test(image) ? image : null;
}

function toStoredImages(images?: string[]): string[] {
  if (!images?.length) return [];
  return Array.from(
    new Set(images.map(toStoredImage).filter((image): image is string => Boolean(image)))
  ).slice(0, 3);
}

/* ── Create Project ────────────────────────────────────────────────── */

export async function createProject(data: {
  title: string;
  blurb: string;
  category: string;
  location: string;
  goal: number;
  duration: number;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  story: string;
  coverImage?: string;
  galleryImages?: string[];
  rewards: Array<{ title: string; amount: number; description: string }>;
}): Promise<{ success: boolean; error?: string; slug?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Нэвтрэх шаардлагатай." };
  }

  try {
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + data.duration);
    const deliveryMonth = endsAt.toISOString().slice(0, 7);
    const galleryImages = toStoredImages(data.galleryImages);
    const coverImage = toStoredImage(data.coverImage) ?? galleryImages[0] ?? null;

    const project = await prisma.project.create({
      data: {
        title:           data.title,
        slug:            makeSlug(data.title),
        description:     data.blurb,
        story:           data.story,
        category:        data.category,
        coverImage,
        galleryImages:   galleryImages.length ? galleryImages : coverImage ? [coverImage] : [],
        goal:            data.goal,
        location:        data.location,
        bankName:        data.bankName,
        bankAccount:     data.bankAccount,
        bankAccountName: data.bankAccountName,
        endsAt,
        // Always PENDING — admin must approve before the project goes live
        status:      "PENDING",
        isVerified:  false,
        creatorId:   session.userId,
        rewards: {
          create: data.rewards.map((r) => ({
            title:             r.title,
            amount:            r.amount,
            description:       r.description,
            estimatedDelivery: deliveryMonth,
            isLimited:         false,
          })),
        },
      },
      select: { slug: true },
    });

    // Only revalidate the creator's profile — explore/home stay unchanged
    // because the project isn't public until admin approves it.
    revalidatePath("/profile");

    return { success: true, slug: project.slug };
  } catch {
    return { success: false, error: "Төсөл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }
}

/* ── Get Projects by Category ──────────────────────────────────────── */

export async function getProjectsByCategory(
  category: string,
  limit = 20
): Promise<{ success: boolean; projects?: ReturnType<typeof formatProject>[]; error?: string }> {
  try {
    const rows = await prisma.project.findMany({
      where: { category, status: "ACTIVE" },
      include: { creator: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { success: true, projects: rows.map(formatProject) };
  } catch {
    return { success: false, error: "Мэдээлэл авахад алдаа гарлаа." };
  }
}

/* ── Shared formatter ──────────────────────────────────────────────── */

function formatProject(p: {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  coverImage: string | null;
  galleryImages: string[];
  goal: number;
  raised: number;
  backers: number;
  endsAt: Date;
  isVerified: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  tags: string[];
  creator: { id: string; name: string; avatar: string | null; isVerified: boolean };
}) {
  const daysLeft = Math.max(
    0,
    Math.ceil((p.endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    category: p.category,
    coverImage: p.coverImage ?? "",
    galleryImages: p.galleryImages ?? [],
    goal: p.goal,
    raised: p.raised,
    backers: p.backers,
    daysLeft,
    isVerified: p.isVerified,
    isTrending: p.isTrending,
    isFeatured: p.isFeatured,
    tags: p.tags,
    creator: {
      id: p.creator.id,
      name: p.creator.name,
      avatar: p.creator.avatar ?? `https://i.pravatar.cc/48?u=${p.creator.id}`,
      isVerified: p.creator.isVerified,
      projectCount: 0,
    },
  };
}
