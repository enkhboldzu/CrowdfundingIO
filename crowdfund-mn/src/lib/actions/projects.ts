"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import { projectCreatorInclude } from "@/lib/db/queries";
import { normalizeImageList, normalizeImageSrc } from "@/lib/image-src";
import { normalizeDocumentList } from "@/lib/document-src";

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
  return normalizeImageSrc(image);
}

function toStoredImages(images?: string[]): string[] {
  return normalizeImageList(images).slice(0, 3);
}

function toStoredDocuments(documents?: string[]): string[] {
  return normalizeDocumentList(documents).slice(0, 5);
}

function toStoredVideoUrl(videoUrl?: string): string | null {
  const value = videoUrl?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;

    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.toLowerCase();
    const isHostedVideo =
      host === "youtu.be" ||
      host.endsWith("youtube.com") ||
      host.endsWith("vimeo.com");
    const isDirectVideo = /\.(mp4|webm|mov|m4v)$/.test(path);

    return isHostedVideo || isDirectVideo ? url.toString() : null;
  } catch {
    return null;
  }
}

const OWNER_EDITABLE_STATUSES = new Set(["PENDING", "REJECTED", "ACTIVE"]);

function createProjectErrorMessage(err: unknown) {
  console.error("[createProject]", err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2003") {
      return "Нэвтрэлтийн хэрэглэгч database дээр олдсонгүй. Гараад дахин нэвтэрнэ үү.";
    }

    if (err.code === "P2002") {
      return "Ижил мэдээлэлтэй төсөл бүртгэгдсэн байна. Гарчгаа бага зэрэг өөрчлөөд дахин оролдоно уу.";
    }

    if (err.code === "P2022") {
      return "Database schema хуучин байна. Server дээр Prisma generate/db push эсвэл migrate ажиллуулна уу.";
    }
  }

  return "Төсөл хадгалахад алдаа гарлаа. Дахин оролдоно уу.";
}

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
  purpose: string;
  fundingUsage: string;
  teamInfo: string;
  risks: string;
  coverImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  documents?: string[];
  rewards: Array<{ title: string; amount: number; description: string; image?: string }>;
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
    const videoUrl = toStoredVideoUrl(data.videoUrl);
    const documents = toStoredDocuments(data.documents);

    const project = await prisma.project.create({
      data: {
        title:           data.title.trim(),
        slug:            makeSlug(data.title),
        description:     data.blurb.trim(),
        story:           data.story.trim(),
        purpose:         data.purpose.trim(),
        fundingUsage:    data.fundingUsage.trim(),
        teamInfo:        data.teamInfo.trim(),
        risks:           data.risks.trim(),
        category:        data.category,
        coverImage,
        galleryImages:   galleryImages.length ? galleryImages : coverImage ? [coverImage] : [],
        videoUrl,
        documents,
        goal:            data.goal,
        location:        data.location.trim(),
        bankName:        data.bankName,
        bankAccount:     data.bankAccount.replace(/\s/g, ""),
        bankAccountName: data.bankAccountName.trim(),
        endsAt,
        status:          "PENDING",
        isVerified:      false,
        tags:            [],
        creatorId:       session.userId,
        rewards: {
          create: data.rewards.map((r) => ({
            title:             r.title.trim(),
            amount:            r.amount,
            description:       r.description.trim(),
            image:             toStoredImage(r.image),
            estimatedDelivery: deliveryMonth,
            isLimited:         false,
          })),
        },
      },
      select: { slug: true },
    });

    revalidatePath("/profile");

    return { success: true, slug: project.slug };
  } catch (err) {
    return { success: false, error: createProjectErrorMessage(err) };
  }
}

export async function updateOwnProject(data: {
  projectId: string;
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
  purpose: string;
  fundingUsage: string;
  teamInfo: string;
  risks: string;
  coverImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  documents?: string[];
  rewards: Array<{ title: string; amount: number; description: string; image?: string }>;
}): Promise<{ success: boolean; error?: string; slug?: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Нэвтрэх шаардлагатай." };
  }

  try {
    const existing = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: {
        id: true,
        slug: true,
        creatorId: true,
        status: true,
        isDeleted: true,
      },
    });

    if (!existing || existing.isDeleted || existing.creatorId !== session.userId) {
      return { success: false, error: "Төсөл олдсонгүй." };
    }

    if (!OWNER_EDITABLE_STATUSES.has(existing.status)) {
      return {
        success: false,
        error: "Зөвхөн хянагдаж буй, татгалзсан эсвэл нийтлэгдсэн төслийг засварлаж болно.",
      };
    }

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + data.duration);
    const deliveryMonth = endsAt.toISOString().slice(0, 7);
    const galleryImages = toStoredImages(data.galleryImages);
    const coverImage = toStoredImage(data.coverImage) ?? galleryImages[0] ?? null;
    const videoUrl = toStoredVideoUrl(data.videoUrl);
    const documents = toStoredDocuments(data.documents);

    const project = await prisma.project.update({
      where: { id: existing.id },
      data: {
        title:           data.title.trim(),
        description:     data.blurb.trim(),
        story:           data.story.trim(),
        purpose:         data.purpose.trim(),
        fundingUsage:    data.fundingUsage.trim(),
        teamInfo:        data.teamInfo.trim(),
        risks:           data.risks.trim(),
        category:        data.category,
        coverImage,
        galleryImages:   galleryImages.length ? galleryImages : coverImage ? [coverImage] : [],
        videoUrl,
        documents,
        goal:            data.goal,
        location:        data.location.trim(),
        bankName:        data.bankName,
        bankAccount:     data.bankAccount.replace(/\s/g, ""),
        bankAccountName: data.bankAccountName.trim(),
        endsAt,
        status:          "PENDING",
        publishedAt:     null,
        rejectionReason: null,
        isVerified:      false,
        rewards: {
          deleteMany: {},
          create: data.rewards.map((r) => ({
            title:             r.title.trim(),
            amount:            r.amount,
            description:       r.description.trim(),
            image:             toStoredImage(r.image),
            estimatedDelivery: deliveryMonth,
            isLimited:         false,
          })),
        },
      },
      select: { slug: true },
    });

    revalidatePath("/profile");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/categories");
    revalidatePath(`/projects/${existing.slug}`);

    return { success: true, slug: project.slug };
  } catch (err) {
    return { success: false, error: createProjectErrorMessage(err) };
  }
}

export async function getProjectsByCategory(
  category: string,
  limit = 20
): Promise<{ success: boolean; projects?: ReturnType<typeof formatProject>[]; error?: string }> {
  try {
    const rows = await prisma.project.findMany({
      where: { category, status: "ACTIVE" },
      include: { creator: { include: projectCreatorInclude } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return { success: true, projects: rows.map(formatProject) };
  } catch {
    return { success: false, error: "Мэдээлэл авахад алдаа гарлаа." };
  }
}

function formatProject(p: {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  coverImage: string | null;
  galleryImages: string[];
  videoUrl?: string | null;
  goal: number;
  raised: number;
  backers: number;
  endsAt: Date;
  isVerified: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  tags: string[];
  creator: {
    id: string;
    name: string;
    avatar: string | null;
    isVerified: boolean;
    _count?: { projects: number };
  };
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
    coverImage: normalizeImageSrc(p.coverImage) ?? "",
    galleryImages: normalizeImageList(p.galleryImages),
    videoUrl: p.videoUrl?.trim() || null,
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
      avatar: normalizeImageSrc(p.creator.avatar) ?? `https://i.pravatar.cc/48?u=${p.creator.id}`,
      isVerified: p.creator.isVerified,
      projectCount: p.creator._count?.projects ?? 0,
    },
  };
}
