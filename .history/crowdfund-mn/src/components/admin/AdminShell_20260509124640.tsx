"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard, Clock, FolderKanban, Users,
  LogOut, ChevronLeft, ChevronRight, ExternalLink,
  ShieldCheck, Menu, X, Bell, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

/* ── Nav items ─────────────────────────────────────────────────── */

const NAV = [
  {
    href:   "/admin/dashboard",
    tab:    null,
    label:  "Обзор",
    icon:   LayoutDashboard,
    badge:  false,
  },
  {
    href:   "/admin/dashboard",
    tab:    "queue",
    label:  "Хүлээгдэж байна",
    icon:   Clock,
    badge:  true,
  },
  {
    href:   "/admin/dashboard",
    tab:    "all",
    label:  "Бүх төсөл",
    icon:   FolderKanban,
    badge:  false,
  },
  {
    href:   "/admin/dashboard",
    tab:    "users",
    label:  "Хэрэглэгчид",
    icon:   Users,
    badge:  false,
  },
] as const;

/* ── AdminHeader ────────────────────────────────────────────────── */

function AdminHeader({
  sidebarOpen,
  onToggleSidebar,
  pendingCount,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  pendingCount: number;
}) {
  const { user, logout } = useAuth();
  const router           = useRouter();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef                 = useRef<HTMLDivElement>(null);

  /* Close user dropdown on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    if (dropOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropOpen]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white border-b border-slate-200 flex items-center px-4 gap-4">

      {/* ── Sidebar toggle ──────────────────────────────── */}
      <button
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Sidebar хаах" : "Sidebar нээх"}
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        {sidebarOpen
          ? <X className="w-5 h-5" strokeWidth={2} />
          : <Menu className="w-5 h-5" strokeWidth={2} />
        }
      </button>

      {/* ── Logo + Admin badge ───────────────────────────── */}
      <Link href="/admin/dashboard" className="flex items-center gap-2.5 flex-shrink-0 mr-auto">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm font-display">CF</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-base text-blue-800 hidden sm:block">
            crowdfund<span className="text-blue-400">.mn</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide">
            <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
            ADMIN
          </span>
        </div>
      </Link>

      {/* ── Pending count shortcut (visible on desktop) ─── */}
      {pendingCount > 0 && (
        <Link
          href="/admin/dashboard?tab=queue"
          className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors flex-shrink-0"
        >
          <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          <span>{pendingCount} хүлээгдэж байна</span>
        </Link>
      )}

      {/* ── View site ───────────────────────────────────── */}
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0"
      >
        <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
        Сайтыг харах
      </Link>

      {/* ── User dropdown ────────────────────────────────── */}
      <div ref={dropRef} className="relative flex-shrink-0">
        <button
          onClick={() => setDropOpen(v => !v)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name ?? "Admin"}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Системийн Администратор</p>
          </div>
          <ChevronDown
            className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block", dropOpen && "rotate-180")}
            strokeWidth={2}
          />
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 overflow-hidden z-[60]">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-bold text-slate-900">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-slate-400 mt-0.5">Системийн Администратор</p>
            </div>
            <div className="p-1.5">
              <Link
                href="/"
                target="_blank"
                onClick={() => setDropOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors md:hidden"
              >
                <ExternalLink className="w-4 h-4" strokeWidth={2} />
                Сайтыг харах
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                Системээс гарах
              </button>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}

/* ── AdminSidebar ───────────────────────────────────────────────── */

function AdminSidebar({
  open,
  pendingCount,
  onClose,
}: {
  open: boolean;
  pendingCount: number;
  onClose: () => void;
}) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const currentTab   = searchParams.get("tab");

  function isActive(item: typeof NAV[number]) {
    if (!pathname.startsWith("/admin/dashboard")) return false;
    if (item.tab === null) return currentTab === null;
    return currentTab === item.tab;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[39] bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-64px)] bg-slate-900 flex flex-col",
          "transition-all duration-300 ease-in-out",
          // Desktop: always visible, width controlled by open state
          "hidden md:flex",
          open ? "w-60" : "w-16",
        )}
      >
        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV.map(item => {
            const Icon    = item.icon;
            const active  = isActive(item);
            const count   = item.badge ? pendingCount : 0;
            const href    = item.tab ? `${item.href}?tab=${item.tab}` : item.href;

            return (
              <Link
                key={href}
                href={href}
                title={!open ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-150 group relative",
                  open ? "gap-3 px-3 py-2.5" : "justify-center px-0 py-2.5",
                  active
                    ? "bg-blue-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon
                  className={cn("flex-shrink-0 w-5 h-5", active ? "text-white" : "text-slate-400 group-hover:text-white")}
                  strokeWidth={active ? 2.5 : 2}
                />

                {/* Label — hidden when collapsed */}
                {open && (
                  <span className="text-sm font-semibold truncate flex-1">{item.label}</span>
                )}

                {/* Badge */}
                {count > 0 && (
                  <span
                    className={cn(
                      "flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold rounded-full px-1.5",
                      active ? "bg-white/20 text-white" : "bg-red-500 text-white"
                    )}
                  >
                    {count > 99 ? "99+" : count}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {!open && (
                  <div className="pointer-events-none absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg">
                    {item.label}
                    {count > 0 && (
                      <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: collapse toggle */}
        <div className="px-2 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            title={open ? "Sidebar хаах" : "Sidebar нээх"}
            className="flex items-center w-full rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors group"
            style={{ justifyContent: open ? "flex-start" : "center", padding: "10px 12px" }}
          >
            {open
              ? <ChevronLeft className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              : <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
            }
            {open && <span className="text-sm font-semibold ml-3">Хураах</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar — full-width drawer */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-40 h-[calc(100vh-64px)] w-72 bg-slate-900 flex flex-col",
          "transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const Icon   = item.icon;
            const active = isActive(item);
            const count  = item.badge ? pendingCount : 0;
            const href   = item.tab ? `${item.href}?tab=${item.tab}` : item.href;

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150",
                  active
                    ? "bg-blue-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={active ? 2.5 : 2} />
                <span className="text-sm font-semibold flex-1">{item.label}</span>
                {count > 0 && (
                  <span className={cn(
                    "min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold rounded-full px-1.5",
                    active ? "bg-white/20 text-white" : "bg-red-500 text-white"
                  )}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-semibold">Хаах</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── AdminShell (root export) ───────────────────────────────────── */

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingCount, setPending]    = useState(0);
  const pathname                      = usePathname();

  // Fetch pending count — refresh on route change
  useEffect(() => {
    if (role !== "admin") return;
    fetch("/api/admin/stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setPending(d.pendingCount ?? 0))
      .catch(() => {});
  }, [role, pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed header */}
      <AdminHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        pendingCount={pendingCount}
      />

      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        pendingCount={pendingCount}
        onClose={() => setSidebarOpen(v => !v)}
      />

      {/* Main content — offset for header and sidebar */}
      <main
        className={cn(
          "transition-all duration-300 pt-16 min-h-screen",
          // On desktop: push right by sidebar width
          sidebarOpen ? "md:pl-60" : "md:pl-16"
        )}
      >
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
