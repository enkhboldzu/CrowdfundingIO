"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { LogOut, User, Settings, ShieldCheck } from "lucide-react";
import { buttonVariants }       from "@/lib/button-variants";
import { cn }                   from "@/lib/utils";
import { useAuth }              from "@/context/AuthContext";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { UserDropdown }         from "@/components/ui/UserDropdown";
import { GuardedLink }          from "@/components/ui/GuardedLink";

const NAV_LINKS = [
  { label: "Нүүр",            href: "/" },
  { label: "Хайх",            href: "/explore" },
  { label: "Ангилал",         href: "/categories" },
  { label: "Ажиллах зарчим",  href: "/how-it-works" },
];

/* Shared vertical divider */
function Divider() {
  return <div aria-hidden className="w-px h-5 flex-shrink-0 bg-slate-200" />;
}

/* Desktop nav link with animated underline */
function NavLink({ href, label, scrolled }: { href: string; label: string; scrolled: boolean }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center pt-2 pb-2.5 text-[15px] font-semibold transition-colors duration-200",
        isActive ? "text-blue-800" : "text-slate-600 hover:text-blue-700"
      )}
    >
      {label}

      {/* Sliding underline for the active link */}
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-blue-600"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}

      {/* Ghost underline on hover for inactive links */}
      {!isActive && (
        <span
          aria-hidden
          className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-blue-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center"
        />
      )}
    </Link>
  );
}

/* Mobile nav link */
function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors text-sm",
        isActive ? "bg-blue-50 text-blue-800" : "text-slate-700 hover:bg-blue-50 hover:text-blue-800"
      )}
    >
      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" aria-hidden />}
      {label}
    </Link>
  );
}

export function Navbar() {
  const { isLoggedIn, role, user, logout } = useAuth();
  const pathname               = usePathname();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    const id = window.setTimeout(() => setMobileOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  const closeMobile = () => setMobileOpen(false);

  /* Frosted glass on scroll; transparent at top (hero is white so text stays dark) */
  const hasBg = scrolled || pathname !== "/";

  const ghostLink = cn(
    "text-[15px] font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200",
    "text-slate-700 hover:text-blue-800 hover:bg-blue-50"
  );

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || pathname !== "/"
          ? "bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm"
          : "bg-white/0"
      )}
    >
      <div className="container-page">
        <nav className="flex items-center justify-between h-16 sm:h-[72px]">

          {/* ── Col 1: Logo ──────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-950 flex items-center justify-center shadow-sm flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-[15px] font-display">CF</span>
            </div>
            <span className="font-display font-bold text-lg sm:text-xl text-blue-800">
              crowdfund<span className="text-blue-400">.mn</span>
            </span>
          </Link>

          {/* ── Col 2: Centred nav links ──────────────── */}
          <LayoutGroup>
            <div className="hidden md:flex flex-1 justify-center items-center gap-12">
              {NAV_LINKS.map(link => (
                <NavLink key={link.href} href={link.href} label={link.label} scrolled={hasBg} />
              ))}
            </div>
          </LayoutGroup>

          {/* ── Col 3: Desktop right cluster ─────────── */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {isLoggedIn ? (
              <div key="auth" className="flex items-center gap-3 animate-fade-up">
                {role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors bg-slate-900 text-white hover:bg-slate-700"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                    Admin
                  </Link>
                )}
                {user?.name && (
                  <span className="hidden xl:block text-sm font-semibold text-slate-700 truncate max-w-[120px]">
                    {user.name}
                  </span>
                )}
                <NotificationDropdown scrolled={true} />
                <UserDropdown scrolled={true} />
                <Divider />
                <Link
                  href="/create-project"
                  className={cn(buttonVariants({ size: "md" }), "px-5 py-2.5 text-[15px] font-bold")}
                >
                  Төсөл эхлэх
                </Link>
              </div>
            ) : (
              <div key="guest" className="flex items-center gap-3 animate-fade-up">
                <Link href="/login" className={ghostLink}>
                  Нэвтрэх
                </Link>
                <GuardedLink
                  href="/create-project"
                  className={cn(buttonVariants({ size: "md" }), "px-5 py-2.5 text-[15px] font-bold")}
                >
                  Төсөл эхлэх
                </GuardedLink>
              </div>
            )}
          </div>

          {/* ── Mobile right cluster ──────────────────── */}
          <div className="md:hidden flex items-center gap-0.5 flex-shrink-0">
            {isLoggedIn && (
              <div className="flex items-center gap-0.5">
                <NotificationDropdown scrolled={true} />
                <UserDropdown scrolled={true} />
              </div>
            )}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              aria-label="Цэс нээх"
              aria-expanded={mobileOpen}
              className="p-2 rounded-lg transition-colors duration-200 text-slate-700 hover:bg-slate-100"
            >
              <span className={cn("block w-5 h-0.5 bg-current mb-1 transition-all duration-200 origin-center", mobileOpen && "rotate-45 translate-y-1.5")} />
              <span className={cn("block w-5 h-0.5 bg-current mb-1 transition-all duration-200",                mobileOpen && "opacity-0 scale-x-0")} />
              <span className={cn("block w-3.5 h-0.5 bg-current transition-all duration-200 origin-center",     mobileOpen && "-rotate-45 -translate-y-1.5 !w-5")} />
            </button>
          </div>

        </nav>
      </div>

      {/* ── Mobile slide-down menu ─────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg animate-fade-up">
          <div className="container-page py-3">

            <div className="space-y-0.5 mb-2">
              {NAV_LINKS.map(link => (
                <MobileNavLink key={link.href} href={link.href} label={link.label} onClick={closeMobile} />
              ))}
            </div>

            {isLoggedIn && (
              <div className="border-t border-slate-100 pt-2 space-y-0.5 mb-2">
                {role === "admin" && (
                  <Link href="/admin/dashboard" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold transition-colors text-sm">
                    <span className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                    </span>
                    Admin Dashboard
                  </Link>
                )}
                <Link href="/profile" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-800 font-medium transition-colors text-sm group">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-700 transition-colors" strokeWidth={2} />
                  </span>
                  Миний профайл
                </Link>
                <Link href="/profile?tab=settings" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-800 font-medium transition-colors text-sm group">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-700 transition-colors" strokeWidth={2} />
                  </span>
                  Тохиргоо
                </Link>
                <MobileLogoutButton onClose={closeMobile} logout={logout} />
              </div>
            )}

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              {!isLoggedIn && (
                <Link href="/login" onClick={closeMobile} className="block w-full px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-800 font-semibold text-center text-sm transition-colors">
                  Нэвтрэх
                </Link>
              )}
              <GuardedLink href="/create-project" onNavigate={closeMobile} className={buttonVariants({ size: "lg", fullWidth: true })}>
                Төсөл эхлэх
              </GuardedLink>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}

/* ── Mobile logout ── */
function MobileLogoutButton({ onClose, logout }: { onClose: () => void; logout: () => void }) {
  function handle() {
    onClose();
    logout();
    window.location.href = "/";
  }
  return (
    <button onClick={handle} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-700 hover:bg-red-50 hover:text-red-600 font-medium transition-colors text-sm group">
      <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
        <LogOut className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" strokeWidth={2} />
      </span>
      Гарах
    </button>
  );
}
