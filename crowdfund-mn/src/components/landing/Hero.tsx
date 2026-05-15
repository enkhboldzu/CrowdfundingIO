"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, animate, type Variants } from "framer-motion";
import { GuardedLink } from "@/components/ui/GuardedLink";
import { useLandingData } from "@/hooks/useLandingData";
import { formatMNT, formatCount, formatPercent } from "@/lib/formatters";
import { fundingPercent, daysLeftLabel } from "@/lib/utils";
import { imageSrcOrFallback } from "@/lib/image-src";
import { ArrowRight, Users } from "lucide-react";
import type { Project } from "@/types";

/* ── Count-up stat ────────────────────────────────────────────── */

function AnimatedStat({ target, format }: { target: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (target === 0) { el.textContent = format(0); return; }
    const ctrl = animate(0, target, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => { el.textContent = format(Math.round(v)); },
    });
    return () => ctrl.stop();
  }, [target, format]);

  return <span ref={ref} className="tabular-nums">{format(0)}</span>;
}

/* ── Skeleton bits ────────────────────────────────────────────── */

function TrustBarSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-0 sm:divide-x sm:divide-gray-200">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="sm:px-10 first:sm:pl-0 last:sm:pr-0">
          <div className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse mb-2" />
          <div className="h-3.5 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function FloatingCardSkeleton() {
  return (
    <div className="relative px-4 py-10 lg:py-0">
      <div aria-hidden className="absolute inset-x-0 -inset-y-8 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 rounded-[2.5rem] opacity-90" />
      <div className="relative z-10 bg-white/80 backdrop-blur-2xl border border-gray-200/70 rounded-3xl overflow-hidden animate-pulse">
        <div className="h-52 bg-gray-200" />
        <div className="p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full" />
          <div className="flex justify-between items-center pt-1">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-20 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Floating project card (real data) ───────────────────────── */

function FloatingCard({ project }: { project: Project | null }) {
  const [imgSrc, setImgSrc] = useState(imageSrcOrFallback(project?.coverImage ?? null));

  if (!project) {
    return (
      <div className="relative px-4 py-10 lg:py-0">
        <div aria-hidden className="absolute inset-x-0 -inset-y-8 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 rounded-[2.5rem] opacity-90" />
        <div className="relative z-10 bg-white/80 backdrop-blur-2xl border border-gray-200/70 rounded-3xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.09)]">
          <div className="h-52 bg-gray-50 flex flex-col items-center justify-center gap-3">
            <span className="text-4xl select-none">🌱</span>
            <p className="text-gray-400 text-sm font-medium text-center px-4">
              Анхны төсөл батлагдмагц энд харагдана
            </p>
          </div>
          <div className="p-5 bg-white/90">
            <p className="text-center text-gray-300 text-xs">Та хамгийн эхний дэмжигч болох уу?</p>
          </div>
        </div>
      </div>
    );
  }

  const percent = fundingPercent(project.raised, project.goal);

  const CATEGORY_LABELS: Record<string, string> = {
    technology: "Технологи", arts: "Урлаг",    film: "Кино",   environment: "Байгаль",
    games: "Тоглоом", health: "Эрүүл мэнд",   education: "Боловсрол",
    community: "Нийгэм", food: "Хоол & Ундаа", fashion: "Загвар", music: "Хөгжим",
  };

  return (
    <div className="relative px-4 py-10 lg:py-0">
      {/* Ambient blob */}
      <div aria-hidden className="absolute inset-x-0 -inset-y-8 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 rounded-[2.5rem] opacity-90" />

      {/* Funding pill — top right */}
      <motion.div
        className="absolute top-4 right-0 lg:-top-5 lg:-right-6 z-20 bg-white border border-gray-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-4 py-3"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none mb-1">Санхүүжилт</p>
        <p className="text-xl font-black text-gray-950 leading-none">{formatMNT(project.raised)}</p>
      </motion.div>

      {/* Backers pill — bottom left */}
      <motion.div
        className="absolute bottom-4 left-0 lg:-bottom-5 lg:-left-6 z-20 bg-gray-950 border border-gray-800 rounded-2xl shadow-lg px-4 py-2.5"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden />
          <span className="text-white text-xs font-bold">
            {project.backers.toLocaleString()}+ дэмжигч
          </span>
        </div>
      </motion.div>

      {/* Main card */}
      <div className="relative z-10 bg-white/80 backdrop-blur-2xl border border-gray-200/70 rounded-3xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.09)]">
        {/* Cover image */}
        <div className="h-52 relative overflow-hidden bg-gray-100">
          <Image
            src={imgSrc}
            alt={project.title}
            fill
            className="object-cover"
            sizes="45vw"
            onError={() => setImgSrc(imageSrcOrFallback(null))}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Category + trending badge */}
          <div className="absolute top-4 right-4 z-[2]">
            <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
              {CATEGORY_LABELS[project.category] ?? project.category}
            </span>
          </div>
          {project.isTrending && (
            <div className="absolute top-4 left-4 z-[2]">
              <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                🔥 Онцлох
              </span>
            </div>
          )}

          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 z-[2]">
            <h3 className="text-white font-black text-base leading-tight line-clamp-2">
              {project.title}
            </h3>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 bg-white/90">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-black text-gray-950">{formatMNT(project.raised)}</span>
              <span className="text-xs text-gray-400 font-medium">{formatMNT(project.goal)} зорилго</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-900 to-blue-500 transition-all duration-700"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-gray-400">{percent}% санхүүжсэн</span>
              <span className="text-[10px] text-gray-400">{daysLeftLabel(project.daysLeft)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-3 h-3 text-blue-700" strokeWidth={2.5} />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {project.backers.toLocaleString()} дэмжигч
              </span>
            </div>
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1 bg-gray-950 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Дэмжих <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
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

/* ── Hero ─────────────────────────────────────────────────────── */

export function Hero() {
  const { data, loading } = useLandingData();

  const s = data?.stats;
  const featuredProject = data?.featured[0] ?? data?.projects[0] ?? null;

  const TRUST_STATS = [
    { target: s?.totalSuccessfulProjects ?? 0, format: formatCount,   label: "Амжилттай төсөл" },
    { target: s?.totalFundingRaised      ?? 0, format: formatMNT,     label: "Нийт санхүүжилт"  },
    { target: s?.totalBackers            ?? 0, format: formatCount,   label: "Нийт дэмжигч"     },
    { target: s?.successRate             ?? 0, format: formatPercent, label: "Амжилтын хувь"     },
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
        {/* Ambient blue glow */}
        <div
          aria-hidden
          className="absolute top-0 right-0 w-[55vw] h-[75vh] pointer-events-none opacity-[0.055]"
          style={{ background: "radial-gradient(ellipse at top right, #1e3a8a 0%, transparent 65%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 w-[35vw] h-[40vh] pointer-events-none opacity-[0.03]"
          style={{ background: "radial-gradient(ellipse at bottom left, #3b82f6 0%, transparent 70%)" }}
        />

        <div className="container-page relative z-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-6 items-center">

            {/* ── Left: Copy ── */}
            <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
              {/* Live badge */}
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
                <span className="text-blue-800">хамтдаа бүтээе</span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p variants={fadeUp} className="text-gray-400 text-lg leading-relaxed mb-10">
                Санаагаа хамтын дэмжлэгээр бодит болго. Монголын шинэ бизнесүүдийг
                дэмжих хамгийн итгэмжтэй орон зай.
              </motion.p>

              {/* CTAs */}
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
              {loading ? <FloatingCardSkeleton /> : <FloatingCard project={featuredProject} />}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Live Trust Bar ─────────────────────────────────────── */}
      <div className="border-y border-gray-100 bg-gray-50/60 py-10">
        <div className="container-page">
          {loading ? (
            <TrustBarSkeleton />
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-0 sm:divide-x sm:divide-gray-200"
              variants={statRow}
              initial="hidden"
              animate="show"
            >
              {TRUST_STATS.map(({ target, format, label }) => (
                <motion.div
                  key={label}
                  variants={statItem}
                  className="text-center sm:text-left sm:px-10 first:sm:pl-0 last:sm:pr-0"
                >
                  <div className="font-display font-black text-3xl sm:text-4xl text-gray-950 mb-1">
                    <AnimatedStat target={target} format={format} />
                  </div>
                  <div className="text-sm text-gray-400 font-medium">{label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
