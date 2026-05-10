import type { Metadata } from "next";
import { getSession } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { toProject } from "@/lib/db/transform";
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
  const createdProjects = session
    ? await prisma.project.findMany({
        where: { creatorId: session.userId },
        include: { creator: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <ProfileClient
      initialTab={initialTab}
      createdProjects={createdProjects.map(toProject)}
      userName={session?.name}
    />
  );
}
