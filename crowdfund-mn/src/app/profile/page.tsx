import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { toProject } from "@/lib/db/transform";
import { normalizeImageSrc } from "@/lib/image-src";
import { ProfileClient } from "./ProfileClient";

export const metadata: Metadata = {
  title: "Миний профайл — Crowdfund.mn",
  description: "Таны дэмжсэн төслүүд, үүсгэсэн төслүүд болон тохиргоо.",
};

type ProfileTab = "backed" | "projects" | "settings";
const VALID_TABS: ProfileTab[] = ["backed", "projects", "settings"];

interface Props {
  searchParams: { tab?: string };
}

export default async function ProfilePage({ searchParams }: Props) {
  const initialTab: ProfileTab = VALID_TABS.includes(searchParams.tab as ProfileTab)
    ? (searchParams.tab as ProfileTab)
    : "backed";

  const session = await getSession();
  if (!session) redirect("/login?from=/profile");

  const [user, donationAgg, backedRaw, createdRaw] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, isVerified: true, createdAt: true,
      },
    }),
    prisma.donation.aggregate({
      where: { userId: session.userId },
      _sum:   { amount: true },
      _count: { id: true },
    }),
    prisma.donation.findMany({
      where:    { userId: session.userId },
      orderBy:  { createdAt: "desc" },
      take:     20,
      include:  { project: { include: { creator: true } } },
    }),
    prisma.project.findMany({
      where:   { creatorId: session.userId },
      include: { creator: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login?from=/profile");

  return (
    <ProfileClient
      user={{
        id:         user.id,
        name:       user.name,
        email:      user.email,
        phone:      user.phone,
        avatar:     normalizeImageSrc(user.avatar),
        isVerified: user.isVerified,
        createdAt:  user.createdAt.toISOString(),
      }}
      donationStats={{
        totalAmount: donationAgg._sum.amount ?? 0,
        count:       donationAgg._count.id,
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      backedDonations={backedRaw.map(d => ({
        id:        d.id,
        amount:    d.amount,
        createdAt: d.createdAt.toISOString(),
        project:   toProject(d.project as any),
      }))}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdProjects={createdRaw.map(p => toProject(p as any))}
      initialTab={initialTab}
    />
  );
}
