"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Settings } from "lucide-react";
import { buttonVariants }       from "@/lib/button-variants";
import { cn }                   from "@/lib/utils";
import { useAuth }              from "@/context/AuthContext";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { UserDropdown }         from "@/components/ui/UserDropdown";

const NAV_LINKS = [
  { label: "Нүүр",     href: "/" },
  { label: "Хайх",     href: "/explore" },
  { label: "Ангилал", href: "/categories" },
  { label: "Н",  href: "/how-it-works" },
];

/* Shared divider */
function Divider({ scrolled }: { scrolled: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-px h-5 flex-shrink-0 transition-colors duration-300",
        scrolled ? "bg-slate-200" : "bg-white/20"
      )}
    />
  );
}

export function Navbar() {
  const { isLoggedIn, login, logout } = useAuth();
  const [scrolled,   setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  /* ── shared link class ─────────────────────────────────────── */
  const ghostLink = cn(
    "text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200",
    scrolled
      ? "text-slate-700 hover:text-blue-800 hover:bg-blue-50"
      : "text-white/90 hover:text-white hover:bg-white/10"
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-page">
        <nav className="flex items-center h-16 gap-4">

          {/* ── Logo ──────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm font-display">CF</span>
            </div>
            <span className={cn(
              "font-display font-bold text-lg transition-colors duration-300",
              scrolled ? "text-blue-800" : "text-white"
            )}>
              crowdfund<span className="text-blue-300">.mn</span>
            </span>
          </Link>

          {/* ── Centre nav (fills space) ──────────────── */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                  scrolled
                    ? "text-slate-600 hover:text-blue-800 hover:bg-blue-50"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ── Desktop right cluster ─────────────────── */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {isLoggedIn ? (
              /* ── LOGGED IN ── fade in on mount */
              <div key="auth" className="flex items-center gap-2 animate-fade-up">
                <NotificationDropdown scrolled={scrolled} />
                <Divider scrolled={scrolled} />
                <UserDropdown scrolled={scrolled} />
                <Divider scrolled={scrolled} />
                <Link
                  href="/start-project"
                  className={cn(
                    buttonVariants({ size: "md" }),
                    !scrolled && "bg-white text-blue-800 hover:bg-blue-50 shadow-cta"
                  )}
                >
                  Төсөл эхлэх
                </Link>
              </div>
            ) : (
              /* ── GUEST ── fade in on mount */
              <div key="guest" className="flex items-center gap-2 animate-fade-up">
                <button
                  onClick={login}
                  className={ghostLink}
                >
                  Нэвтрэх
                </button>
                <Link
                  href="/start-project"
                  className={cn(
                    buttonVariants({ size: "md" }),
                    !scrolled && "bg-white text-blue-800 hover:bg-blue-50 shadow-cta"
                  )}
                >
                  Төсөл эхлэх
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile right cluster ──────────────────── */}
          <div className="md:hidden flex items-center gap-1 ml-auto flex-shrink-0">
            {isLoggedIn && (
              <div className="flex items-center gap-1 animate-fade-up">
                <NotificationDropdown scrolled={scrolled} />
                <UserDropdown scrolled={scrolled} />
              </div>
            )}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label="Цэс нээх"
              aria-expanded={mobileOpen}
              className={cn(
                "p-2 rounded-lg transition-colors duration-200",
                scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
              )}
            >
              <span className={cn("block w-5 h-0.5 bg-current mb-1 transition-all duration-200 origin-center",  mobileOpen && "rotate-45 translate-y-1.5")} />
              <span className={cn("block w-5 h-0.5 bg-current mb-1 transition-all duration-200",                 mobileOpen && "opacity-0 scale-x-0")} />
              <span className={cn("block w-3.5 h-0.5 bg-current transition-all duration-200 origin-center",      mobileOpen && "-rotate-45 -translate-y-1.5 !w-5")} />
            </button>
          </div>

        </nav>
      </div>

      {/* ── Mobile slide-down menu ─────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-fade-up">
          <div className="container-page py-3">

            {/* Nav links */}
            <div className="space-y-0.5 mb-2">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className="block px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-800 font-medium transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User section — logged in only */}
            {isLoggedIn && (
              <div className="border-t border-slate-100 pt-2 space-y-0.5 mb-2">
                <Link
                  href="/profile"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-800 font-medium transition-colors text-sm group"
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-700 transition-colors" strokeWidth={2} />
                  </span>
                  Миний профайл
                </Link>
                <Link
                  href="/profile?tab=settings"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-800 font-medium transition-colors text-sm group"
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-700 transition-colors" strokeWidth={2} />
                  </span>
                  Тохиргоо
                </Link>
                <MobileLogoutButton onClose={closeMobile} logout={logout} />
              </div>
            )}

            {/* CTA row */}
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              {!isLoggedIn && (
                <button
                  onClick={() => { login(); closeMobile(); }}
                  className="block w-full px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-800 font-semibold text-center text-sm transition-colors"
                >
                  Нэвтрэх
                </button>
              )}
              <Link
                href="/start-project"
                onClick={closeMobile}
                className={buttonVariants({ size: "lg", fullWidth: true })}
              >
                Төсөл эхлэх
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}

/* ── Mobile logout (needs logout prop to avoid re-calling useAuth) ── */
function MobileLogoutButton({
  onClose,
  logout,
}: {
  onClose: () => void;
  logout:  () => void;
}) {
  function handle() {
    onClose();
    logout();
    window.location.href = "/";
  }

  return (
    <button
      onClick={handle}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-700 hover:bg-red-50 hover:text-red-600 font-medium transition-colors text-sm group"
    >
      <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
        <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" strokeWidth={2} />
      </span>
      Гарах
    </button>
  );
}
