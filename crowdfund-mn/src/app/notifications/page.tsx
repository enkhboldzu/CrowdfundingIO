import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { getSession } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { NotificationsClient } from "./NotificationsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Мэдэгдэл — Crowdfund.mn",
  description: "Таны бүх мэдэгдэл.",
};

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login?from=/notifications");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const projectIds = Array.from(new Set(
    notifications
      .map((notification) => notification.relatedProjectId)
      .filter((id): id is string => Boolean(id))
  ));

  const relatedProjects = projectIds.length > 0
    ? await prisma.project.findMany({
        where: { id: { in: projectIds }, isDeleted: false },
        select: { id: true, slug: true, title: true },
      })
    : [];

  const projectMap = new Map(relatedProjects.map((project) => [project.id, project]));

  return (
    <>
      <NotificationsClient
        initialNotifications={notifications.map((notification) => {
          const relatedProject = notification.relatedProjectId
            ? projectMap.get(notification.relatedProjectId)
            : null;

          return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            isRead: notification.isRead,
            createdAt: notification.createdAt.toISOString(),
            relatedProjectId: notification.relatedProjectId,
            relatedProject: relatedProject
              ? {
                  id: relatedProject.id,
                  slug: relatedProject.slug,
                  title: relatedProject.title,
                }
              : null,
          };
        })}
      />
      <Footer />
    </>
  );
}
