"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, animate, type Variants } from "framer-motion";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { GuardedLink } from "@/components/ui/GuardedLink";
import { useLandingData } from "@/hooks/useLandingData";
import { formatMNT, formatCount, formatPercent } from "@/lib/formatters";
import type { Project } from "@/types";

/* ── Animated counter ─────────────────────────────────────────── */

function AnimatedStat({
  target,
  format,
  className,
}: {
  target: number;
  format: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (target === 0) { el.textContent = format(0); return; }
    const controls = animate(0, target, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) { el.textContent = format(Math.round(v)); },
    });
    return () => controls.stop();
  }, [target, format]);

  return <span ref={ref} className={className}>{format(0)}</span>;
}

/* ── Skeleton pieces ──────────────────────────────────────────── */

function FloatingCardSkeleton() {
  return (
    <div className="w-full max-w-[340px] rounded-3xl bg-white border border-gray-200 p-5 shadow-xl animate-pulse">
      <div className="rounded-2xl bg-gray-200 h-40 w-full mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
      <div className="h-2 bg-gray-200 rounded-full w-full mb-2" />
      <div className="flex justify-between mt-3">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
  );
}

function TrustBarSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 max-w-3xl mx-auto animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="text-center">
          <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-2" />
          <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  );
}

/* ── Floating project card ────────────────────────────────────── */

function FloatingCard({ project }: { project: Project | null }) {
  if (!project) {
    return (
      <div className="w-full max-w-[340px] rounded-3xl bg-white border border-dashed border-gray-300 p-8 text-center shadow-lg">
        <span className="text-4xl mb-3 block">🌱</span>
        <p className="text-gray-500 text-sm leading-relaxed">
          Анхны төсөл батлагдмагц энд харагдана
        </p>
      </div>
    );
  }

  const pct = project.goal > 0 ? Math.min((project.raised / project.goal) * 100, 100) : 0;

  return (
    <motion.div
      className="w-full max-w-[340px] rounded-3xl bg-white border border-gray-200 overflow-hidden shadow-xl"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Cover image */}
      <div className="relative h-40 bg-gray-100">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover"
            sizes="340px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <span className="text-5xl opacity-40">📋</span>
          </div>
        )}
        {/* Live badge */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Идэвхтэй
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {project.title}
        </h3>
        <p className="text-gray-500 text-xs mb-3 truncate">{project.location ?? "Монгол"}</p>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full bg-gray-900 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-900">{Math.round(pct)}%</span>
          <span className="text-gray-500">{formatCount(project.backers)} дэмжигч</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Animation variants ───────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

const statItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/* ── Hero ─────────────────────────────────────────────────────── */

export function Hero() {
  const { data, loading } = useLandingData();

  const s = data?.stats ?? {
    totalSuccessfulProjects: 0,
    totalFundingRaised: 0,
    totalBackers: 0,
    successRate: 0,
  };

  const featuredProject = data?.featured[0] ?? data?.projects[0] ?? null;

  const STATS = [
    { target: s.totalSuccessfulProjects, format: formatCount,   label: "Амжилттай төсөл"   },
    { target: s.totalFundingRaised,      format: formatMNT,     label: "Нийт санхүүжилт"   },
    { target: s.totalBackers,            format: formatCount,   label: "Дэмжигч хэрэглэгч" },
    { target: s.successRate,             format: formatPercent, label: "Амжилтын хувь"      },
  ];

  return (
    <section className="relative overflow-hidden min-h-[100svh] sm:min-h-screen flex items-center bg-white">

      {/* Dot-grid background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Subtle top-right glow */}
      <div
        aria-hidden
        className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)" }}
      />

      <div className="container-page relative z-10 pt-28 pb-20 sm:py-32 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left column ───────────────────────────────── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-full px-4 py-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-gray-600 text-xs sm:text-sm font-medium">
                Монголын краудфандинг платформ
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display font-black text-[2.4rem] sm:text-5xl lg:text-6xl xl:text-[4rem] text-gray-950 leading-[1.1] tracking-tight mb-5 text-balance"
            >
              Ирээдүйг<br />
              <span className="text-blue-600">хамтдаа</span>{" "}
              бүтээе
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={fadeUp}
              className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg mb-8 text-balance"
            >
              Төслөө тодорхой танилцуулж, дэмжигчдээсээ бодит санхүүжилт аваарай.
              Дэмжих хүн бүр хаана, юунд хувь нэмэр оруулж байгаагаа ойлгомжтой харна.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-14 sm:mb-16"
            >
              <GuardedLink
                href="/create-project"
                className={cn(
                  buttonVariants({ size: "xl" }),
                  "bg-gray-950 hover:bg-gray-800 text-white w-full sm:w-auto"
                )}
              >
                Төсөл эхлэх
              </GuardedLink>
              <Link
                href="/explore"
                className={cn(
                  buttonVariants({ variant: "outline", size: "xl" }),
                  "border-gray-300 text-gray-700 hover:border-gray-950 hover:text-gray-950 w-full sm:w-auto"
                )}
              >
                Төслүүд харах
              </Link>
            </motion.div>

            {/* Trust bar */}
            {loading ? (
              <TrustBarSkeleton />
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5 max-w-lg"
              >
                {STATS.map((stat) => (
                  <motion.div key={stat.label} variants={statItem} className="text-left">
                    <div className="font-display font-black text-2xl sm:text-3xl text-gray-950 mb-0.5">
                      <AnimatedStat target={stat.target} format={stat.format} />
                    </div>
                    <div className="text-gray-400 text-xs">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* ── Right column: floating card ──────────────── */}
          <div className="hidden lg:flex justify-center lg:justify-end">
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute -inset-6 rounded-[2.5rem] border border-dashed border-gray-200 pointer-events-none" />

              {loading ? (
                <FloatingCardSkeleton />
              ) : (
                <FloatingCard project={featuredProject} />
              )}

              {/* Floating badge — "Verified" */}
              {!loading && featuredProject && (
                <motion.div
                  className="absolute -bottom-4 -left-6 bg-gray-950 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
                >
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Баталгаажсан
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
