"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn }         from "@/lib/utils";
import { useAuth }    from "@/context/AuthContext";
import { logoutUser } from "@/lib/actions/auth";

/* ── Helpers ────────────────────────────────────────────────────────── */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function displayName(name?: string | null, email?: string | null): string {
  if (name?.trim()) return name.trim();
  if (email) return email;
  return "Хэрэглэгч";
}

/* ── Avatar ─────────────────────────────────────────────────────────── */

interface AvatarProps {
  name?: string | null;
  avatar?: string | null;
  size?: "sm" | "md";
  className?: string;
}

function Avatar({ name, avatar, size = "sm", className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const dim    = size === "sm" ? "w-8 h-8" : "w-9 h-9";
  const textSz = size === "sm" ? "text-xs"  : "text-sm";

  if (avatar && !imgError) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={avatar}
        alt={name ?? "Avatar"}
        onError={() => setImgError(true)}
        className={cn(dim, "rounded-full object-cover flex-shrink-0", className)}
      />
    );
  }

  if (name?.trim()) {
    return (
      <span
        aria-hidden
        className={cn(
          dim, "rounded-full flex items-center justify-center font-bold flex-shrink-0",
          "bg-blue-100 text-blue-700",
          textSz,
          className
        )}
      >
        {getInitials(name)}
      </span>
    );
  }

  // Generic icon fallback
  return (
    <span
      className={cn(
        dim, "rounded-full flex items-center justify-center flex-shrink-0",
        "bg-slate-100 text-slate-400",
        className
      )}
    >
      <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
    </span>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────── */

function AvatarSkeleton({ scrolled }: { scrolled: boolean }) {
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full animate-pulse",
        scrolled ? "bg-slate-200" : "bg-white/25"
      )}
    />
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

interface Props { scrolled: boolean; }

export function UserDropdown({ scrolled }: Props) {
  const { user, isLoading, logout } = useAuth();
  const router                      = useRouter();
  const [open, setOpen]             = useState(false);
  const ref                         = useRef<HTMLDivElement>(null);

  async function handleLogout() {
    setOpen(false);
    await logoutUser(); // clears the httpOnly cfmn_session JWT cookie
    logout();           // clears cfmn_auth cookie + localStorage + React state
    router.push("/");
  }

  /* Close on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const name  = user?.name  ?? null;
  const email = user?.email ?? null;
  const label = displayName(name, email);

  return (
    <div ref={ref} className="relative">

      {/* ── Avatar trigger button ───────────────────────────────────── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Хэрэглэгчийн цэс"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-full transition-all duration-200 ring-2 p-0.5",
          scrolled
            ? ["ring-slate-200 hover:ring-blue-300", open && "ring-blue-400"]
            : ["ring-white/25 hover:ring-white/55", open && "ring-white/65"]
        )}
      >
        {isLoading ? (
          <AvatarSkeleton scrolled={scrolled} />
        ) : (
          <Avatar
            name={name}
            avatar={user?.avatar}
            className={cn(
              "transition-colors duration-200",
              !user?.avatar && !name && (
                scrolled
                  ? [open ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50 hover:text-blue-700 bg-slate-100 text-slate-500"]
                  : ["bg-white/15 text-white", open ? "bg-white/30" : "hover:bg-white/25"]
              )
            )}
          />
        )}

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "hidden sm:block w-3 h-3 transition-all duration-200 mr-1",
            scrolled ? "text-slate-400" : "text-white/60",
            open && "rotate-180"
          )}
          strokeWidth={2.5}
        />
      </button>

      {/* ── Dropdown panel ──────────────────────────────────────────── */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-[calc(100%+10px)] z-[60]",
            "w-60",
            "bg-white rounded-2xl border border-slate-100",
            "shadow-xl shadow-slate-200/60",
            "animate-fade-down overflow-hidden"
          )}
          role="menu"
          aria-label="Хэрэглэгчийн цэс"
        >

          {/* ── Profile header ── */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-50/70 border-b border-slate-100">
            <Avatar
              name={name}
              avatar={user?.avatar}
              size="md"
              className="ring-2 ring-blue-100"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                {isLoading ? (
                  <span className="inline-block w-28 h-3.5 rounded bg-slate-200 animate-pulse" />
                ) : label}
              </p>
              {(email || isLoading) && (
                <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                  {isLoading ? (
                    <span className="inline-block w-36 h-3 rounded bg-slate-200 animate-pulse" />
                  ) : email}
                </p>
              )}
            </div>
          </div>

          {/* ── Menu items ── */}
          <div className="py-1.5" role="none">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors flex-shrink-0">
                <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-700 transition-colors" strokeWidth={2} />
              </div>
              Миний профайл
            </Link>

            <Link
              href="/profile?tab=settings"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-800 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors flex-shrink-0">
                <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-700 transition-colors" strokeWidth={2} />
              </div>
              Тохиргоо
            </Link>
          </div>

          {/* ── Logout ── */}
          <div className="border-t border-slate-100 py-1.5" role="none">
            <button
              onClick={handleLogout}
              role="menuitem"
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0">
                <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" strokeWidth={2} />
              </div>
              Гарах
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
