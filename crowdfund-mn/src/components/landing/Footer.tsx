"use client";

import Link from "next/link";
import { GuardedLink } from "@/components/ui/GuardedLink";
import { useToast }    from "@/context/ToastContext";

/* ── Social links ───────────────────────────────────────────────── */
const SOCIAL = [
  { label: "Facebook",  icon: "f",  href: "https://facebook.com/crowdfundmn" },
  { label: "Twitter",   icon: "𝕏",  href: "https://x.com/crowdfundmn" },
  { label: "Instagram", icon: "▣",  href: "https://instagram.com/crowdfundmn" },
  { label: "LinkedIn",  icon: "in", href: "https://linkedin.com/company/crowdfundmn" },
];

/* ── Link definitions ───────────────────────────────────────────── */
type FooterLink =
  | { label: string; href: string; type: "link" }
  | { label: string; type: "guarded" }
  | { label: string; type: "soon" };

const PLATFORM_LINKS: FooterLink[] = [
  { label: "Хэрхэн ажилладаг", href: "/how-it-works",    type: "link"    },
  { label: "Төсөл олох",        href: "/explore",          type: "link"    },
  { label: "Төсөл эхлэх",      type: "guarded"                            },
  { label: "Мобайл апп",       type: "soon"                               },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "Бидний тухай",     href: "/about", type: "link" },
  { label: "Блог",             href: "/blog",  type: "link" },
  { label: "Хэвлэл мэдээлэл",                 type: "soon" },
  { label: "Карьер",                           type: "soon" },
];

const SUPPORT_LINKS: FooterLink[] = [
  { label: "Тусламж",             href: "/help",    type: "link" },
  { label: "Холбоо барих",                          type: "soon" },
  { label: "Нийгэмлэг",                            type: "soon" },
  { label: "Мэдээлэл хамгаалал", href: "/privacy", type: "link" },
];

const LINK_CLASS = "text-slate-400 hover:text-white text-sm transition-colors duration-200";

export function Footer() {
  const { show } = useToast();

  function comingSoon() {
    show("Тун удахгүй нэмэгдэнэ! 🚀", "info");
  }

  function renderLinks(links: FooterLink[]) {
    return links.map((l) => {
      if (l.type === "link") {
        return (
          <li key={l.label}>
            <Link href={l.href} className={LINK_CLASS}>
              {l.label}
            </Link>
          </li>
        );
      }
      if (l.type === "guarded") {
        return (
          <li key={l.label}>
            <GuardedLink href="/create-project" className={LINK_CLASS}>
              {l.label}
            </GuardedLink>
          </li>
        );
      }
      /* type === "soon" */
      return (
        <li key={l.label}>
          <button onClick={comingSoon} className={LINK_CLASS}>
            {l.label}
          </button>
        </li>
      );
    });
  }

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container-page py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow">
                <span className="text-white font-bold text-sm font-display">CF</span>
              </div>
              <span className="font-display font-bold text-lg">
                crowdfund<span className="text-blue-400">.mn</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Монголын нийгэмд үнэ цэнтэй бүтээл туурвих хамгийн итгэмжтэй краудфандинг платформ.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-700 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold transition-colors duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Платформ
            </h4>
            <ul className="space-y-2.5">
              {renderLinks(PLATFORM_LINKS)}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Компани
            </h4>
            <ul className="space-y-2.5">
              {renderLinks(COMPANY_LINKS)}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Дэмжлэг
            </h4>
            <ul className="space-y-2.5">
              {renderLinks(SUPPORT_LINKS)}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © 2026 Crowdfund.mn. Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-slate-500 hover:text-white text-xs transition-colors duration-200">
              Үйлчилгээний нөхцөл
            </Link>
            <Link href="/privacy" className="text-slate-500 hover:text-white text-xs transition-colors duration-200">
              Нууцлалын бодлого
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
