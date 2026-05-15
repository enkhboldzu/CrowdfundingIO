"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, animate, type Variants } from "framer-motion";
import { GuardedLink } from "@/components/ui/GuardedLink";
import type { PublicStats } from "@/lib/db/stats";
import { formatMNT, formatCount, formatPercent } from "@/lib/formatters";
import { ArrowRight, Users } from "lucide-react";

/* ── Animated counter ─────────────────────────────────────────── */

interface AnimatedStatProps {
  target: number;
  format: (n: number) => string;
  className?: string;
}

function AnimatedStat({ target, format, className }: AnimatedStatProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (target === 0) { el.textContent = format(0); return; }

    const controls = animate(0, target, {
      duration: 2.0,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) { el.textContent = format(Math.round(v)); },
    });
    return () => controls.stop();
  }, [target, format]);

  return <span ref={ref} className={className}>{format(0)}</span>;
}

/* ── Animation variants ───────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { duration: 0.75, ease: EASE, delay: 0.2 } },
};

const statRow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const statItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/* ── Decorative floating project card ─────────────────────────── */

function FloatingCard() {
  return (
    <div className="relative px-4 py-10 lg:py-0">
      {/* Ambient blob behind the card */}
      <div
        aria-hidden
        className="absolute inset-x-0 -inset-y-8 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 rounded-[2.5rem] opacity-90"
      />

      {/* Floating stat pill — top right */}
      <motion.div
        className="absolute top-4 right-0 lg:-top-5 lg:-right-6 z-20 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-4 py-3"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none mb-1">Нийт санхүүжилт</p>
        <p className="text-xl font-black text-gray-950 leading-none">₮2.4Т+</p>
      </motion.div>

      {/* Floating backer pill — bottom left */}
      <motion.div
        className="absolute bottom-4 left-0 lg:-bottom-5 lg:-left-6 z-20 bg-gray-950 border border-gray-800 rounded-2xl shadow-lg px-4 py-2.5"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden />
          <span className="text-white text-xs font-bold">1,200+ дэмжигч</span>
        </div>
      </motion.div>

      {/* Main card */}
      <div className="relative z-10 bg-white/80 backdrop-blur-2xl border border-gray-200/70 rounded-3xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.09)]">

        {/* Project image / hero area */}
        <div className="h-52 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 right-10 w-28 h-28 rounded-full border border-white/10" />
            <div className="absolute -bottom-10 -left-6 w-44 h-44 rounded-full bg-blue-600/20" />
            <div className="absolute top-14 left-20 w-14 h-14 rounded-2xl bg-white/10 rotate-12" />
            <div className="absolute top-5 left-5 w-8 h-8 rounded-full bg-white/5 border border-white/10" />
          </div>

          <div className="absolute top-4 right-4 z-[2]">
            <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
              Технологи
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 z-[2]">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
              🔥 Онцлох төсөл
            </span>
            <h3 className="text-white font-black text-lg leading-tight">
              Ухаалаг Хог Менежментийн Систем
            </h3>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 bg-white/90">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-black text-gray-950">₮12.4М</span>
              <span className="text-xs text-gray-400 font-medium">₮20М зорилго</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-900 to-blue-600" style={{ width: "62%" }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">62% санхүүжсэн</span>
              <span className="text-[10px] text-gray-400">14 хоног үлдсэн</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-3 h-3 text-blue-700" strokeWidth={2.5} />
              </div>
              <span className="text-xs text-gray-500 font-medium">248 дэмжигч</span>
            </div>
            <button
              type="button"
              className="bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1"
            >
              Дэмжих <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────────── */

interface HeroProps {
  stats?: PublicStats;
}

export function Hero({ stats }: HeroProps) {
  const s = stats ?? {
    totalSuccessfulProjects: 0,
    totalFundingRaised:      0,
    totalBackers:            0,
    successRate:             0,
  };

  const TRUST_STATS = [
    { target: s.totalSuccessfulProjects, format: formatCount,   label: "Амжилттай төсөл" },
    { target: s.totalFundingRaised,      format: formatMNT,     label: "Нийт санхүүжилт"  },
    { target: s.totalBackers,            format: formatCount,   label: "Нийт дэмжигч"     },
    { target: s.successRate,             format: formatPercent, label: "Амжилтын хувь"     },
  ];

  return (
    <>
      {/* ── Main hero ─────────────────────────────────────────── */}
      <section className="relative bg-white overflow-hidden min-h-[100svh] flex items-center pt-[72px]">

        {/* Subtle dot-grid */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Soft ambient glow */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-[55vw] h-[75vh] pointer-events-none opacity-[0.055]"
          style={{ background: "radial-gradient(ellipse at top right, #1e3a8a 0%, transparent 65%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 w-[35vw] h-[40vh] pointer-events-none opacity-[0.035]"
          style={{ background: "radial-gradient(ellipse at bottom left, #3b82f6 0%, transparent 70%)" }}
        />

        <div className="container-page relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-6 items-center">

            {/* ── Left: Copy ── */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="max-w-xl"
            >
              {/* Live eyebrow badge */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 border border-gray-200 bg-white/80 rounded-full px-3.5 py-1.5 mb-8 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden />
                <span className="text-gray-500 text-xs font-semibold tracking-wide">
                  Монголын #1 краудфандинг платформ
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="font-display font-black text-[2.6rem] sm:text-6xl lg:text-[4.25rem] text-gray-950 leading-[1.05] tracking-tight mb-6"
              >
                Ирээдүйг<br />
                <span className="text-blue-800">санхүүжүүл</span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                variants={fadeUp}
                className="text-gray-400 text-lg leading-relaxed mb-10"
              >
                Санаагаа хамтын дэмжлэгээр бодит болго. Монголын шинэ бизнесүүдийг
                дэмжих хамгийн итгэмжтэй орон зай.
              </motion.p>

              {/* CTA pair */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/explore"
                  className="inline-flex items-center justify-center gap-2 bg-gray-950 hover:bg-gray-800 text-white font-bold text-[15px] px-6 py-3.5 rounded-2xl transition-colors duration-200"
                >
                  Төсөл судлах
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
                <GuardedLink
                  href="/create-project"
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-950 font-bold text-[15px] px-6 py-3.5 rounded-2xl transition-colors duration-200"
                >
                  Төсөл эхлэх
                </GuardedLink>
              </motion.div>
            </motion.div>

            {/* ── Right: Floating card (desktop only) ── */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="hidden lg:block"
            >
              <FloatingCard />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Live Trust Bar ─────────────────────────────────────── */}
      <div className="border-y border-gray-100 bg-gray-50/60 py-10">
        <div className="container-page">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-0 sm:divide-x sm:divide-gray-200"
            variants={statRow}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {TRUST_STATS.map(({ target, format, label }) => (
              <motion.div
                key={label}
                variants={statItem}
                className="text-center sm:text-left sm:px-10 first:sm:pl-0 last:sm:pr-0"
              >
                <div className="font-display font-black text-3xl sm:text-4xl text-gray-950 mb-1 tabular-nums">
                  <AnimatedStat target={target} format={format} />
                </div>
                <div className="text-sm text-gray-400 font-medium">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
