"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, Check, Users, ShieldCheck, RefreshCw, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ──────────────────────────────────────────────────────── */

type NotifType = "PROJECT_APPROVED" | "PROJECT_REJECTED" | "NEW_BACKER" | "FUNDING_UPDATE" | "GOAL_REACHED";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedProjectId: string | null;
}

/* ── Icon / style map ───────────────────────────────────────────── */

const TYPE_CONFIG: Record<NotifType, {
  icon: React.ElementType;
  bg: string;
  iconColor: string;
}> = {
  PROJECT_APPROVED: { icon: ShieldCheck, bg: "bg-emerald-100", iconColor: "text-emerald-700" },
  PROJECT_REJECTED: { icon: XCircle,     bg: "bg-red-100",     iconColor: "text-red-700"     },
  NEW_BACKER:       { icon: Users,       bg: "bg-blue-100",    iconColor: "text-blue-700"    },
  FUNDING_UPDATE:   { icon: RefreshCw,   bg: "bg-amber-100",   iconColor: "text-amber-700"   },
  GOAL_REACHED:     { icon: ShieldCheck, bg: "bg-emerald-100", iconColor: "text-emerald-700" },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "Дэнглэж байна";
  if (m < 60) return `${m} минутын өмнө`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} цагийн өмнө`;
  return `${Math.floor(h / 24)} өдрийн өмнө`;
}

/* ── Component ──────────────────────────────────────────────────── */

export function NotificationDropdown({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const containerRef        = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json() as { notifications: Notification[] };
      setNotifs(data.notifications);
    } catch {
      // silently ignore — user might not be logged in
    }
  }, []);

  // Load on mount and poll every 60 s while open
  useEffect(() => {
    const id = window.setTimeout(() => { void fetchNotifs(); }, 0);
    return () => window.clearTimeout(id);
  }, [fetchNotifs]);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(id);
  }, [open, fetchNotifs]);

  /* Close on outside click */
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await fetch("/api/notifications/all", { method: "PUT" });
    } catch {
      fetchNotifs();
    }
  }

  async function markOneRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    } catch {
      fetchNotifs();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* ── Bell button ─────────────────────────────── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Мэдэгдэл"
        aria-expanded={open}
        className={cn(
          "relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
          scrolled
            ? "text-slate-600 hover:text-blue-800 hover:bg-blue-50"
            : "text-white/80 hover:text-white hover:bg-white/10",
          open && (scrolled ? "bg-blue-50 text-blue-800" : "bg-white/10 text-white")
        )}
      >
        <Bell className="w-5 h-5" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ────────────────────────────────── */}
      {open && (
        <div
          className={cn(
            "fixed inset-x-3 top-20 z-[70] w-auto max-h-[calc(100vh-6rem)]",
            "sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+12px)] sm:z-[60] sm:w-[400px] sm:max-h-none",
            "bg-white rounded-2xl border border-slate-100",
            "shadow-xl shadow-slate-200/60",
            "animate-fade-up overflow-hidden"
          )}
          role="dialog"
          aria-label="Мэдэгдлүүд"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-slate-900 text-base">Мэдэгдэл</h2>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] bg-blue-800 text-white text-[11px] font-bold rounded-full px-1.5">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 min-w-0">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                  Бүгдийг уншсан болгох
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1"
                aria-label="Хаах"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[calc(100vh-14rem)] sm:max-h-[360px] overflow-y-auto overscroll-contain divide-y divide-slate-50">
            {notifs.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Мэдэгдэл байхгүй байна</p>
              </div>
            ) : (
              notifs.map(notif => {
                const cfg  = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.FUNDING_UPDATE;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markOneRead(notif.id)}
                    className={cn(
                      "flex items-start gap-3.5 px-5 py-4 cursor-pointer transition-colors duration-150",
                      notif.isRead ? "bg-white hover:bg-slate-50" : "bg-blue-50/40 hover:bg-blue-50/70"
                    )}
                  >
                    <div className={cn("flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5", cfg.bg)}>
                      <Icon className={cn("w-4 h-4", cfg.iconColor)} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug mb-0.5", notif.isRead ? "font-medium text-slate-700" : "font-bold text-slate-900")}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-1.5">
                        {notif.message}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        {relativeTime(notif.createdAt)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-2">
                      {!notif.isRead
                        ? <span className="block w-2 h-2 rounded-full bg-blue-600 shadow-sm" />
                        : <span className="block w-2 h-2" />
                      }
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full text-sm font-semibold text-blue-800 hover:text-blue-900 py-2 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Бүх мэдэгдлийг харах
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
