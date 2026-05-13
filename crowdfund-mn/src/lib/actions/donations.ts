"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/auth";
import {
  appBaseUrl,
  checkQpayInvoicePayment,
  createQpayInvoice,
  type QpayBankUrl,
} from "@/lib/qpay";

const MIN_DONATION_AMOUNT = 10;

export type CompletedSupportSummary = {
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
};

type CreateQpayInvoiceResult =
  | {
      success: true;
      donationId: string;
      invoiceId: string;
      amount: number;
      qrText: string;
      qrImage: string;
      shortUrl?: string;
      urls: QpayBankUrl[];
    }
  | {
      success: false;
      error: string;
    };

type CheckQpayPaymentResult =
  | ({ success: true; paid: true } & CompletedSupportSummary)
  | { success: true; paid: false; message?: string }
  | { success: false; error: string };

class SupportProjectError extends Error {}

function normalizeAmount(value: number): number {
  return Math.trunc(Number(value));
}

function qpayErrorMessage(err: unknown) {
  if (err instanceof Error && err.message.includes("QPay")) return err.message;
  return "QPay нэхэмжлэх үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.";
}

function donationCallbackUrl(donationId: string) {
  return `${appBaseUrl()}/api/qpay/callback?donationId=${encodeURIComponent(donationId)}`;
}

function revalidateDonationViews(slug: string) {
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/categories");
  revalidatePath("/profile");
  revalidatePath("/notifications");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/projects");
}

async function validateDonationInput(tx: Prisma.TransactionClient, input: {
  projectId: string;
  amount: number;
  rewardTierId?: string | null;
}) {
  const project = await tx.project.findUnique({
    where: { id: input.projectId },
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

  const rewardTier = input.rewardTierId
    ? await tx.rewardTier.findFirst({
        where: {
          id: input.rewardTierId,
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

  if (input.rewardTierId && !rewardTier) {
    throw new SupportProjectError("Сонгосон урамшуулал олдсонгүй.");
  }

  if (rewardTier && input.amount < rewardTier.amount) {
    throw new SupportProjectError("Сонгосон урамшууллын дүнгээс бага дэмжих боломжгүй.");
  }

  if (rewardTier?.isLimited && rewardTier.remaining !== null && rewardTier.remaining <= 0) {
    throw new SupportProjectError("Энэ урамшуулал дууссан байна.");
  }

  return { project, rewardTier };
}

export async function createQpayDonationInvoice(data: {
  projectId: string;
  amount: number;
  rewardTierId?: string | null;
}): Promise<CreateQpayInvoiceResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Нэвтрэх шаардлагатай." };
  }

  const amount = normalizeAmount(data.amount);
  if (!Number.isFinite(amount) || amount < MIN_DONATION_AMOUNT) {
    return { success: false, error: `Дэмжлэгийн дүн хамгийн багадаа ${MIN_DONATION_AMOUNT}₮ байна.` };
  }

  let pendingDonationId: string | undefined;

  try {
    const pending = await prisma.$transaction(async (tx) => {
      const { project, rewardTier } = await validateDonationInput(tx, {
        projectId: data.projectId,
        amount,
        rewardTierId: data.rewardTierId,
      });

      const donation = await tx.donation.create({
        data: {
          amount,
          paymentMethod: "QPAY",
          status: "PENDING",
          userId: session.userId,
          projectId: project.id,
          rewardTierId: rewardTier?.id,
        },
        select: { id: true },
      });

      return {
        donationId: donation.id,
        projectTitle: project.title,
        userId: session.userId,
      };
    });
    pendingDonationId = pending.donationId;

    const invoice = await createQpayInvoice({
      senderInvoiceNo: pending.donationId,
      receiverCode: pending.userId,
      description: `Crowdfund.mn - ${pending.projectTitle}`,
      amount,
      callbackUrl: donationCallbackUrl(pending.donationId),
    });

    await prisma.donation.update({
      where: { id: pending.donationId },
      data: {
        qpayInvoiceId: invoice.invoiceId,
        qpayQrText: invoice.qrText,
        qpayQrImage: invoice.qrImage,
        qpayShortUrl: invoice.shortUrl,
        qpayUrls: invoice.urls as unknown as Prisma.JsonArray,
      },
    });

    return {
      success: true,
      donationId: pending.donationId,
      invoiceId: invoice.invoiceId,
      amount,
      qrText: invoice.qrText,
      qrImage: invoice.qrImage,
      shortUrl: invoice.shortUrl,
      urls: invoice.urls,
    };
  } catch (err) {
    console.error("[createQpayDonationInvoice]", err);

    if (pendingDonationId) {
      try {
        await prisma.donation.updateMany({
          where: { id: pendingDonationId, status: "PENDING" },
          data: { status: "FAILED" },
        });
      } catch {
        // Keep the original QPay error visible to the user.
      }
    }

    if (err instanceof SupportProjectError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: qpayErrorMessage(err) };
  }
}

function completedRewardSummary(rewardTier: {
  id: string;
  backerCount: number;
  remaining: number | null;
} | null | undefined) {
  return rewardTier
    ? {
        id: rewardTier.id,
        backerCount: rewardTier.backerCount,
        remaining: rewardTier.remaining ?? undefined,
      }
    : undefined;
}

export async function completeDonationIfQpayPaid(
  donationId: string,
  expectedUserId?: string
): Promise<CheckQpayPaymentResult> {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: {
      id: true,
      amount: true,
      status: true,
      qpayInvoiceId: true,
      userId: true,
      rewardTierId: true,
      project: {
        select: {
          id: true,
          title: true,
          slug: true,
          goal: true,
          raised: true,
          backers: true,
          creatorId: true,
        },
      },
      rewardTier: {
        select: {
          id: true,
          backerCount: true,
          isLimited: true,
          remaining: true,
        },
      },
    },
  });

  if (!donation) {
    return { success: false, error: "Дэмжлэгийн нэхэмжлэх олдсонгүй." };
  }

  if (expectedUserId && donation.userId !== expectedUserId) {
    return { success: false, error: "Энэ нэхэмжлэхийг шалгах эрхгүй байна." };
  }

  if (donation.status === "COMPLETED") {
    return {
      success: true,
      paid: true,
      donationId: donation.id,
      project: {
        raised: donation.project.raised,
        backers: donation.project.backers,
      },
      rewardTier: completedRewardSummary(donation.rewardTier),
      goalReached: donation.project.raised >= donation.project.goal,
    };
  }

  if (!donation.qpayInvoiceId) {
    return { success: false, error: "QPay invoice холбогдоогүй байна." };
  }

  const payment = await checkQpayInvoicePayment(donation.qpayInvoiceId);
  if (!payment.paid || payment.paidAmount < donation.amount) {
    return { success: true, paid: false, message: "Төлбөр хараахан баталгаажаагүй байна." };
  }

  const completed = await prisma.$transaction(async (tx) => {
    const marked = await tx.donation.updateMany({
      where: {
        id: donation.id,
        status: "PENDING",
      },
      data: {
        status: "COMPLETED",
        qpayPaymentId: payment.paymentId,
        paidAt: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
      },
    });

    if (marked.count === 0) {
      const current = await tx.donation.findUnique({
        where: { id: donation.id },
        select: {
          project: { select: { raised: true, backers: true, goal: true } },
          rewardTier: { select: { id: true, backerCount: true, remaining: true } },
        },
      });

      return {
        project: current?.project ?? {
          raised: donation.project.raised,
          backers: donation.project.backers,
          goal: donation.project.goal,
        },
        rewardTier: completedRewardSummary(current?.rewardTier),
        goalReached: (current?.project.raised ?? donation.project.raised) >= (current?.project.goal ?? donation.project.goal),
      };
    }

    const updatedProject = await tx.project.update({
      where: { id: donation.project.id },
      data: {
        raised: { increment: donation.amount },
        backers: { increment: 1 },
      },
      select: {
        raised: true,
        backers: true,
        goal: true,
      },
    });

    const updatedRewardTier = donation.rewardTierId
      ? await tx.rewardTier.update({
          where: { id: donation.rewardTierId },
          data: {
            backerCount: { increment: 1 },
            ...(donation.rewardTier?.isLimited && donation.rewardTier.remaining !== null
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

    const backer = donation.userId
      ? await tx.user.findUnique({
          where: { id: donation.userId },
          select: { name: true },
        })
      : null;

    if (donation.project.creatorId !== donation.userId) {
      await tx.notification.create({
        data: {
          type: "NEW_BACKER",
          title: "Шинэ дэмжигч нэмэгдлээ",
          message: `"${donation.project.title}" төсөлд ${backer?.name ?? "Дэмжигч"} ${donation.amount.toLocaleString("mn-MN")}₮ дэмжлээ.`,
          userId: donation.project.creatorId,
          relatedProjectId: donation.project.id,
        },
      });
    }

    const goalReached = donation.project.raised < donation.project.goal && updatedProject.raised >= donation.project.goal;
    if (goalReached) {
      await tx.notification.create({
        data: {
          type: "GOAL_REACHED",
          title: "Зорилго биеллээ",
          message: `"${donation.project.title}" төсөл санхүүжилтийн зорилгодоо хүрлээ.`,
          userId: donation.project.creatorId,
          relatedProjectId: donation.project.id,
        },
      });
    }

    return {
      project: updatedProject,
      rewardTier: completedRewardSummary(updatedRewardTier),
      goalReached,
    };
  });

  revalidateDonationViews(donation.project.slug);

  return {
    success: true,
    paid: true,
    donationId: donation.id,
    project: {
      raised: completed.project.raised,
      backers: completed.project.backers,
    },
    rewardTier: completed.rewardTier,
    goalReached: completed.goalReached,
  };
}

export async function checkQpayDonationPayment(donationId: string): Promise<CheckQpayPaymentResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Нэвтрэх шаардлагатай." };
  }

  try {
    return await completeDonationIfQpayPaid(donationId, session.userId);
  } catch (err) {
    console.error("[checkQpayDonationPayment]", err);

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return { success: false, error: "Дэмжлэгийн нэхэмжлэх олдсонгүй." };
    }

    if (err instanceof Error && err.message.includes("QPay")) {
      return { success: false, error: err.message };
    }

    return { success: false, error: "Төлбөр шалгахад алдаа гарлаа. Дахин оролдоно уу." };
  }
}
