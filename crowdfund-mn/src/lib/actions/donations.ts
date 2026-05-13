"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";

const MIN_DONATION_AMOUNT = 10;

type SupportPaymentMethod = "QPAY";

type SupportProjectResult =
  | {
      success: true;
      donationId: string;
      project: {
        raised: number;
        backers: number;
      };
      rewardTier?: {
        id: string;
        backerCount: number;
        remaining?: number;
      };
      goalReached: boolean;
    }
  | {
      success: false;
      error: string;
    };

class SupportProjectError extends Error {}

function normalizeAmount(value: number): number {
  return Math.trunc(Number(value));
}

export async function supportProject(data: {
  projectId: string;
  amount: number;
  paymentMethod: string;
  rewardTierId?: string | null;
}): Promise<SupportProjectResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Нэвтрэх шаардлагатай." };
  }

  const amount = normalizeAmount(data.amount);
  if (!Number.isFinite(amount) || amount < MIN_DONATION_AMOUNT) {
    return { success: false, error: `Дэмжлэгийн дүн хамгийн багадаа ${MIN_DONATION_AMOUNT}₮ байна.` };
  }

  if (data.paymentMethod !== "QPAY") {
    return { success: false, error: "Одоогоор зөвхөн QPay төлбөр дэмжигдэнэ." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.findUnique({
        where: { id: data.projectId },
        select: {
          id: true,
          title: true,
          slug: true,
          goal: true,
          raised: true,
          backers: true,
          status: true,
          isDeleted: true,
          endsAt: true,
          creatorId: true,
        },
      });

      if (!project || project.isDeleted) {
        throw new SupportProjectError("Төсөл олдсонгүй.");
      }

      if (project.status !== "ACTIVE") {
        throw new SupportProjectError("Зөвхөн нийтлэгдсэн төслийг дэмжих боломжтой.");
      }

      if (project.endsAt.getTime() < Date.now()) {
        throw new SupportProjectError("Энэ төслийн санхүүжилтийн хугацаа дууссан байна.");
      }

      const rewardTier = data.rewardTierId
        ? await tx.rewardTier.findFirst({
            where: {
              id: data.rewardTierId,
              projectId: project.id,
            },
            select: {
              id: true,
              title: true,
              amount: true,
              backerCount: true,
              isLimited: true,
              remaining: true,
            },
          })
        : null;

      if (data.rewardTierId && !rewardTier) {
        throw new SupportProjectError("Сонгосон урамшуулал олдсонгүй.");
      }

      if (rewardTier && amount < rewardTier.amount) {
        throw new SupportProjectError("Сонгосон урамшууллын дүнгээс бага дэмжих боломжгүй.");
      }

      if (rewardTier?.isLimited && rewardTier.remaining !== null && rewardTier.remaining <= 0) {
        throw new SupportProjectError("Энэ урамшуулал дууссан байна.");
      }

      const donation = await tx.donation.create({
        data: {
          amount,
          paymentMethod: "QPAY" satisfies SupportPaymentMethod,
          status: "COMPLETED",
          userId: session.userId,
          projectId: project.id,
          rewardTierId: rewardTier?.id,
        },
        select: { id: true },
      });

      const updatedProject = await tx.project.update({
        where: { id: project.id },
        data: {
          raised: { increment: amount },
          backers: { increment: 1 },
        },
        select: {
          raised: true,
          backers: true,
        },
      });

      const updatedRewardTier = rewardTier
        ? await tx.rewardTier.update({
            where: { id: rewardTier.id },
            data: {
              backerCount: { increment: 1 },
              ...(rewardTier.isLimited && rewardTier.remaining !== null
                ? { remaining: { decrement: 1 } }
                : {}),
            },
            select: {
              id: true,
              backerCount: true,
              remaining: true,
            },
          })
        : null;

      const backer = await tx.user.findUnique({
        where: { id: session.userId },
        select: { name: true },
      });

      if (project.creatorId !== session.userId) {
        await tx.notification.create({
          data: {
            type: "NEW_BACKER",
            title: "Шинэ дэмжигч нэмэгдлээ",
            message: `"${project.title}" төсөлд ${backer?.name ?? "Дэмжигч"} ${amount.toLocaleString("mn-MN")}₮ дэмжлээ.`,
            userId: project.creatorId,
            relatedProjectId: project.id,
          },
        });
      }

      const goalReached = project.raised < project.goal && updatedProject.raised >= project.goal;
      if (goalReached) {
        await tx.notification.create({
          data: {
            type: "GOAL_REACHED",
            title: "Зорилго биеллээ",
            message: `"${project.title}" төсөл санхүүжилтийн зорилгодоо хүрлээ.`,
            userId: project.creatorId,
            relatedProjectId: project.id,
          },
        });
      }

      return {
        donationId: donation.id,
        slug: project.slug,
        project: updatedProject,
        rewardTier: updatedRewardTier
          ? {
              id: updatedRewardTier.id,
              backerCount: updatedRewardTier.backerCount,
              remaining: updatedRewardTier.remaining ?? undefined,
            }
          : undefined,
        goalReached,
      };
    });

    revalidatePath(`/projects/${result.slug}`);
    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/categories");
    revalidatePath("/profile");
    revalidatePath("/notifications");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/projects");

    return {
      success: true,
      donationId: result.donationId,
      project: result.project,
      rewardTier: result.rewardTier,
      goalReached: result.goalReached,
    };
  } catch (err) {
    console.error("[supportProject]", err);

    if (err instanceof SupportProjectError) {
      return { success: false, error: err.message };
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return { success: false, error: "Дэмжлэг бүртгэхэд холбоотой мэдээлэл олдсонгүй." };
    }

    return { success: false, error: "Дэмжлэг бүртгэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }
}
