"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUserRound, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { cn }       from "@/lib/utils";
import { useAuth }  from "@/context/AuthContext";

const MOCK_USER = {
  name:   "Б. Анарэрдэнэ",
  email:  "baterdeneanarerdene09@gmail.com",
  avatar: null as string | null, // set to image URL when real auth is ready
};

interface Props { scrolled: boolean; }

export function UserDropdown({ scrolled }: Props) {
  const { logout }      = useAuth();
  const router          = useRouter();
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  function handleLogout() {
    setOpen(false);
    logout();
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

  return (
    <div ref={ref} className="relative">

      {/* ── Avatar button ──────────────────────────── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Хэрэглэгчийн цэс"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-full transition-all duration-200 ring-2 p-0.5",
          scrolled
            ? [
                "ring-slate-200 hover:ring-blue-300",
                open && "ring-blue-400",
              ]
            : [
                "ring-white/25 hover:ring-white/55",
                open && "ring-white/65",
              ]
        )}
      >
        {/* Avatar circle */}
        <div className={cn(
          "relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden transition-colors duration-200",
          scrolled
            ? [
                "bg-slate-100 text-slate-500",
                open ? "bg-blue-100 text-blue-700" : "hover:bg-blue-50 hover:text-blue-700",
              ]
            : [
                "bg-white/15 text-white",
                open ? "bg-white/30" : "hover:bg-white/25",
              ]
        )}>
          {MOCK_USER.avatar ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="w-full h-full object-cover" />
          ) : (
            <CircleUserRound className="w-[22px] h-[22px]" strokeWidth={1.5} />
          )}
        </div>

        {/* Chevron — desktop only */}
        <ChevronDown
          className={cn(
            "hidden sm:block w-3 h-3 transition-all duration-200 mr-1",
            scrolled ? "text-slate-400" : "text-white/60",
            open && "rotate-180"
          )}
          strokeWidth={2.5}
        />
      </button>

      {/* ── Dropdown panel ─────────────────────────── */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-[calc(100%+10px)] z-[60]",
            "w-56",
            "bg-white rounded-2xl border border-slate-100",
            "shadow-xl shadow-slate-200/60",
            "animate-fade-up overflow-hidden"
          )}
          role="menu"
          aria-label="Хэрэглэгчийн цэс"
        >

          {/* Mini profile header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-50/70 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-200">
              <CircleUserRound className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                {MOCK_USER.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                {MOCK_USER.email}
              </p>
            </div>
          </div>

          {/* Menu items */}
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

          {/* Divider + Logout */}
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
