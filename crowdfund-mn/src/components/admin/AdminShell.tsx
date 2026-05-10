"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import {
  Clock,
  LogOut, ExternalLink, ShieldCheck, ChevronDown, X, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { AdminStatsProvider, useAdminStats } from "@/context/AdminStatsContext";

/* ── Nav config ─────────────────────────────────────────────────── */

const NAV = [
  { href: "/admin/dashboard", tab: null,    label: "Обзор",            badge: false },
  { href: "/admin/dashboard", tab: "queue", label: "Хүлээгдэж байна", badge: true  },
  { href: "/admin/dashboard", tab: "all",   label: "Бүх төсөл",        badge: false },
  { href: "/admin/dashboard", tab: "users", label: "Хэрэглэгчид",      badge: false },
] as const;

/* ── Helpers ────────────────────────────────────────────────────── */

function useActiveTab() {
  const pathname   = usePathname();
  const searchParams = useSearchParams();
  const currentTab   = searchParams.get("tab");

  return (item: typeof NAV[number]) => {
    if (!pathname.startsWith("/admin/dashboard")) return false;
    return item.tab === null ? currentTab === null : currentTab === item.tab;
  };
}

function navHref(item: typeof NAV[number]) {
  return item.tab ? `${item.href}?tab=${item.tab}` : item.href;
}

/* ── Desktop nav link — text-only, matches landing NavLink exactly ── */

function DesktopNavLink({
  item,
  active,
  count,
}: {
  item: typeof NAV[number];
  active: boolean;
  count: number;
}) {
  return (
    <Link
      href={navHref(item)}
      className={cn(
        "group relative flex items-center gap-2 pt-2 pb-2.5 text-sm font-semibold",
        "transition-colors duration-200",
        active ? "text-blue-800" : "text-slate-500 hover:text-blue-700"
      )}
    >
      {item.label}

      {/* Pending count badge — superscript style */}
      {count > 0 && (
        <span className={cn(
          "flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
          "flex items-center justify-center -mt-2",
          active
            ? "bg-blue-100 text-blue-700"
            : "bg-amber-100 text-amber-700"
        )}>
          {count > 99 ? "99+" : count}
        </span>
      )}

      {/* Active spring-animated underline — identical to landing page */}
      {active && (
        <motion.span
          layoutId="admin-nav-underline"
          className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-blue-600"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}

      {/* Ghost underline on hover for inactive links */}
      {!active && (
        <span
          aria-hidden
          className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-blue-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"
        />
      )}
    </Link>
  );
}

/* ── Mobile nav link ────────────────────────────────────────────── */

function MobileNavLink({
  item,
  active,
  count,
  onClose,
}: {
  item: typeof NAV[number];
  active: boolean;
  count: number;
  onClose: () => void;
}) {
  return (
    <Link
      href={navHref(item)}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150",
        active
          ? "bg-blue-50 text-blue-800 border border-blue-100"
          : "text-slate-700 hover:text-blue-800 hover:bg-blue-50"
      )}
    >
      {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />}
      <span className="flex-1">{item.label}</span>
      {count > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

/* ── AdminHeader ────────────────────────────────────────────────── */

function AdminHeader() {
  const { pendingCount }          = useAdminStats();
  const { user, logout }          = useAuth();
  const router                    = useRouter();
  const isActive                  = useActiveTab();
  const [dropOpen,  setDropOpen]  = useState(false);
  const [mobileOpen, setMobile]   = useState(false);
  const dropRef                   = useRef<HTMLDivElement>(null);
  const pathname                  = usePathname();

  /* Close dropdown on outside click */
  useEffect(() => {
    function close(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    }
    if (dropOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropOpen]);

  /* Close mobile menu on route change */
  useEffect(() => { setMobile(false); }, [pathname]);

  function handleLogout() { logout(); router.push("/login"); }

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const headerBg = [
    "bg-white/95",
    "backdrop-blur-md",
    "border-b border-slate-100",
    "shadow-sm",
  ].join(" ");

  return (
    <>
      <header className={cn("fixed top-0 left-0 right-0 h-16 z-50 flex items-center px-4 lg:px-6 gap-4", headerBg)}>

        {/* Subtle top highlight */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent pointer-events-none" />

        {/* ── Col 1: Logo ─────────────────────────────── */}
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm font-display">CF</span>
          </div>
          <span className="font-display font-bold text-lg text-blue-800 hidden sm:block">
            crowdfund<span className="text-blue-300">.mn</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wide flex-shrink-0">
            <ShieldCheck className="w-3 h-3 text-blue-600" strokeWidth={2.5} />
            ADMIN
          </span>
        </Link>

        {/* ── Col 2: Desktop nav ── centred ───────────── */}
        <div className="flex-1 hidden md:flex justify-center">
          <LayoutGroup>
            <nav className="flex items-center gap-8">
              {NAV.map(item => (
                <DesktopNavLink
                  key={item.tab ?? "overview"}
                  item={item}
                  active={isActive(item)}
                  count={item.badge ? pendingCount : 0}
                />
              ))}
            </nav>
          </LayoutGroup>
        </div>

        {/* ── Col 3: Right cluster ─────────────────────── */}
        <div className="ml-auto md:ml-0 flex items-center gap-2 flex-shrink-0">

          {/* Pending pill (desktop) — extra visibility */}
          {pendingCount > 0 && (
            <Link
              href="/admin/dashboard?tab=queue"
              className="hidden lg:flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{pendingCount}</span>
              <span className="relative w-2 h-2 flex-shrink-0">
                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                <span className="relative block w-2 h-2 rounded-full bg-red-500" />
              </span>
            </Link>
          )}

          {/* View site */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-700 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all duration-150"
          >
            <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden lg:block">Сайтыг харах</span>
          </Link>

          {/* User dropdown */}
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setDropOpen(v => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-md">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-semibold text-slate-900 leading-none">{user?.name ?? "Admin"}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Администратор</p>
              </div>
              <ChevronDown
                className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block", dropOpen && "rotate-180")}
                strokeWidth={2}
              />
            </button>

            {dropOpen && (
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-52 rounded-2xl overflow-hidden z-[60] bg-white border border-slate-100 shadow-xl shadow-slate-200/60"
              >
                <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-none">{user?.name ?? "Admin"}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Системийн Администратор</p>
                  </div>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/" target="_blank"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors md:hidden"
                  >
                    <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
                    Сайтыг харах
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.75} />
                    Системээс гарах
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobile(v => !v)}
            aria-label="Цэс нээх"
            aria-expanded={mobileOpen}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
          </button>
        </div>
      </header>

      {/* ── Mobile slide-down nav ──────────────────────────── */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white border-b border-slate-100 shadow-lg">
          <div className="relative px-4 py-3 space-y-0.5">
            {NAV.map(item => (
              <MobileNavLink
                key={item.tab ?? "overview"}
                item={item}
                active={isActive(item)}
                count={item.badge ? pendingCount : 0}
                onClose={() => setMobile(false)}
              />
            ))}
          </div>
          <div className="relative px-4 pt-1 pb-4 border-t border-slate-100">
            <Link
              href="/" target="_blank"
              onClick={() => setMobile(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
              Сайтыг харах
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ── AdminShellInner ─────────────────────────────────────────────── */

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { role }           = useAuth();
  const { refreshPending } = useAdminStats();
  const pathname           = usePathname();

  useEffect(() => {
    if (role === "admin") refreshPending();
  }, [role, pathname, refreshPending]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />
      {/* Full-width content — no sidebar offset */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

/* ── Root export ─────────────────────────────────────────────────── */

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminStatsProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminStatsProvider>
  );
}
