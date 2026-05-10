"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clock, Users, ShieldCheck, ExternalLink, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface Stats { pendingCount: number }

const ADMIN_LINKS = [
  { href: "/admin/dashboard",          label: "Обзор",            icon: LayoutDashboard },
  { href: "/admin/dashboard?tab=queue",label: "Хүлээгдэж байна",  icon: Clock,  badge: true },
  { href: "/admin/dashboard?tab=all",  label: "Бүх төсөл",        icon: ShieldCheck },
  { href: "/admin/dashboard?tab=users",label: "Хэрэглэгчид",      icon: Users },
];

export function AdminBar() {
  const { role, user } = useAuth();
  const pathname        = usePathname();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (role !== "admin") return;
    fetch("/api/admin/stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setStats({ pendingCount: d.pendingCount }))
      .catch(() => {});
  }, [role, pathname]); // re-fetch on route change to keep badge fresh

  if (role !== "admin") return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-slate-900 border-b border-slate-800">
      <div className="container-page">
        <div className="flex items-center justify-between h-9 gap-4">

          {/* ── Left: brand + mode badge ─────────────────── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" strokeWidth={2.5} />
              <span className="text-xs font-bold text-white tracking-wide hidden sm:block">
                ADMIN MODE
              </span>
            </div>
            {user?.name && (
              <span className="text-[11px] text-slate-400 hidden md:block">
                {user.name}
              </span>
            )}
          </div>

          {/* ── Center: nav links ─────────────────────────── */}
          <nav className="flex items-center gap-0.5 flex-1 justify-center overflow-x-auto scrollbar-none">
            {ADMIN_LINKS.map(link => {
              const Icon    = link.icon;
              const isActive = pathname.startsWith("/admin");
              const pending  = link.badge ? (stats?.pendingCount ?? 0) : 0;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap",
                    pathname === link.href || (link.href.includes("?tab=") && pathname === "/admin/dashboard")
                      ? "bg-blue-700 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  )}
                >
                  <Icon className="w-3 h-3 flex-shrink-0" strokeWidth={2} />
                  {link.label}
                  {pending > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1">
                      {pending > 99 ? "99+" : pending}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Right: back to site ──────────────────────── */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" strokeWidth={2} />
            <span className="hidden sm:block">Сайтыг харах</span>
          </Link>

        </div>
      </div>
    </div>
  );
}
