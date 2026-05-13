"use client";

import { useMemo, useState } from "react";
import type { ElementType } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotifType = "PROJECT_APPROVED" | "PROJECT_REJECTED" | "NEW_BACKER" | "FUNDING_UPDATE" | "GOAL_REACHED";
type Filter = "all" | "unread";

export interface NotificationItem {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedProjectId: string | null;
  relatedProject: {
    id: string;
    slug: string;
    title: string;
  } | null;
}

const TYPE_CONFIG: Record<NotifType, {
  icon: ElementType;
  bg: string;
  iconColor: string;
  badge: string;
}> = {
  PROJECT_APPROVED: { icon: ShieldCheck, bg: "bg-emerald-100", iconColor: "text-emerald-700", badge: "Батлагдсан" },
  PROJECT_REJECTED: { icon: XCircle,     bg: "bg-red-100",     iconColor: "text-red-700",     badge: "Татгалзсан" },
  NEW_BACKER:       { icon: Users,       bg: "bg-blue-100",    iconColor: "text-blue-700",    badge: "Дэмжлэг" },
  FUNDING_UPDATE:   { icon: RefreshCw,   bg: "bg-amber-100",   iconColor: "text-amber-700",   badge: "Шинэчлэл" },
  GOAL_REACHED:     { icon: ShieldCheck, bg: "bg-emerald-100", iconColor: "text-emerald-700", badge: "Зорилго" },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Дөнгөж сая";
  if (m < 60) return `${m} минутын өмнө`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} цагийн өмнө`;
  return `${Math.floor(h / 24)} өдрийн өмнө`;
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationsClient({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<Filter>("all");

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const visibleNotifications = useMemo(
    () => filter === "unread"
      ? notifications.filter((notification) => !notification.isRead)
      : notifications,
    [filter, notifications]
  );

  async function markAllRead() {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    try {
      const res = await fetch("/api/notifications/all", { method: "PUT" });
      if (!res.ok) throw new Error("Failed to mark all notifications read");
    } catch {
      setNotifications(initialNotifications);
    }
  }

  async function markOneRead(id: string) {
    setNotifications((prev) => prev.map((notification) =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to mark notification read");
    } catch {
      setNotifications(initialNotifications);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container-page max-w-4xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-800 transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Нүүр хуудас
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-2">
                Мэдэгдэл
              </p>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
                Бүх мэдэгдэл
              </h1>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Бүгдийг уншсан болгох
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          {([
            { id: "all", label: "Бүгд", count: notifications.length },
            { id: "unread", label: "Уншаагүй", count: unreadCount },
          ] as const).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border transition-colors",
                filter === item.id
                  ? "bg-blue-800 border-blue-800 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-800"
              )}
            >
              {item.label}
              <span className={cn(
                "min-w-[22px] rounded-full px-1.5 py-0.5 text-[11px] leading-none",
                filter === item.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {visibleNotifications.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-card py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-display font-bold text-slate-800 mb-1">
              Мэдэгдэл байхгүй байна
            </p>
            <p className="text-sm text-slate-400">
              Шинэ мэдэгдэл ирэхээр энд харагдана.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleNotifications.map((notification) => {
              const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.FUNDING_UPDATE;
              const Icon = cfg.icon;
              const projectHref = notification.relatedProject
                ? `/projects/${notification.relatedProject.slug}`
                : null;

              return (
                <article
                  key={notification.id}
                  className={cn(
                    "bg-white border rounded-2xl shadow-card px-5 py-4 transition-colors",
                    notification.isRead ? "border-slate-100" : "border-blue-200 bg-blue-50/35"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("w-5 h-5", cfg.iconColor)} strokeWidth={2} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
                          notification.isRead ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-800"
                        )}>
                          {cfg.badge}
                        </span>
                        {!notification.isRead && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            Шинэ
                          </span>
                        )}
                      </div>

                      <h2 className={cn(
                        "text-base leading-snug mb-1",
                        notification.isRead ? "font-semibold text-slate-800" : "font-bold text-slate-950"
                      )}>
                        {notification.title}
                      </h2>
                      <p className="text-sm text-slate-600 leading-relaxed mb-3">
                        {notification.message}
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <time
                          dateTime={notification.createdAt}
                          title={fullDate(notification.createdAt)}
                          className="text-xs font-medium text-slate-400"
                        >
                          {relativeTime(notification.createdAt)}
                        </time>

                        <div className="flex items-center gap-2 flex-wrap">
                          {projectHref && (
                            <Link
                              href={projectHref}
                              onClick={() => markOneRead(notification.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Төсөл харах
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}

                          {!notification.isRead && (
                            <button
                              onClick={() => markOneRead(notification.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Check className="w-3 h-3" strokeWidth={2.5} />
                              Уншсан
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
