"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, animate, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { GuardedLink } from "@/components/ui/GuardedLink";
import type { PublicStats } from "@/lib/db/stats";
import { formatMNT, formatCount, formatPercent } from "@/lib/formatters";

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
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        el.textContent = format(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [target, format]);

  return <span ref={ref} className={className}>{format(0)}</span>;
}

/* ── Animation variants ───────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

const statItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5,  ease: EASE } },
};

/* ── Hero ─────────────────────────────────────────────────────── */

interface HeroProps {
  stats?: PublicStats;
}

export function Hero({ stats }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const glowTopY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const glowBottomY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const waveY = useTransform(scrollYProgress, [0, 1], [0, 28]);
  const s = stats ?? {
    totalSuccessfulProjects: 0,
    totalFundingRaised:      0,
    totalBackers:            0,
    successRate:             0,
  };

  const STATS = [
    { target: s.totalSuccessfulProjects, format: formatCount,   label: "Амжилттай төсөл"   },
    { target: s.totalFundingRaised,      format: formatMNT,     label: "Нийт санхүүжилт"   },
    { target: s.totalBackers,            format: formatCount,   label: "Дэмжигч хэрэглэгч" },
    { target: s.successRate,             format: formatPercent, label: "Амжилтын хувь"      },
  ];

  return (
    <section ref={sectionRef} className="relative overflow-hidden min-h-[100svh] sm:min-h-[92vh] flex items-center gradient-brand-hero">

      {/* Decorative blobs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          y: reduceMotion ? 0 : glowTopY,
          background: "radial-gradient(circle, #60A5FA, transparent 70%)",
        }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          y: reduceMotion ? 0 : glowBottomY,
          background: "radial-gradient(circle, #93C5FD, transparent 70%)",
        }}
      />

      {/* Grid pattern */}
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          y: reduceMotion ? 0 : gridY,
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        className="container-page relative z-10 pt-24 pb-20 sm:py-24 lg:py-32"
        style={{ y: reduceMotion ? 0 : contentY }}
      >
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >

          {/* Eyebrow badge */}
          <motion.div variants={fadeUp} className="inline-flex max-w-full items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/90 text-xs sm:text-sm font-medium truncate">
              Санаагаа хүмүүст хүргэх итгэлтэй орон зай
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-display font-bold text-[2rem] sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.18] sm:leading-tight tracking-tight mb-5 sm:mb-6 text-balance"
          >
            Санаагаа{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-blue-200">хамтын дэмжлэгээр</span>
              <span
                aria-hidden
                className="absolute bottom-1 left-0 right-0 h-3 bg-blue-500/30 rounded"
              />
            </span>
            {" "}бодит ажил болго
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={fadeUp}
            className="text-white/75 text-base sm:text-xl leading-7 sm:leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10 text-balance"
          >
            Төслөө тодорхой танилцуулж, дэмжигчдээсээ бодит санхүүжилт аваарай.
            Дэмжих хүн бүр хаана, юунд хувь нэмэр оруулж байгаагаа ойлгомжтой харна.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16"
          >
            <Link
              href="/explore"
              className={cn(buttonVariants({ size: "xl" }), "w-full sm:w-auto bg-white text-blue-800 hover:bg-blue-50 shadow-cta")}
            >
              Төсөл хайх
            </Link>
            <GuardedLink
              href="/create-project"
              className={cn(
                buttonVariants({ variant: "outline", size: "xl" }),
                "w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-800"
              )}
            >
              Төсөл эхлэх
            </GuardedLink>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={container}
            className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 sm:gap-8 max-w-3xl mx-auto"
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={statItem} className="text-center">
                <div className="font-display font-bold text-2xl sm:text-3xl text-white mb-1">
                  <AnimatedStat target={stat.target} format={stat.format} />
                </div>
                <div className="text-white/60 text-xs sm:text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </motion.div>

      {/* Bottom wave */}
      <motion.div className="absolute bottom-0 left-0 right-0" style={{ y: reduceMotion ? 0 : waveY }}>
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 64L480 20L960 48L1440 8V64H0Z" fill="white" fillOpacity="0.08" />
          <path d="M0 64L360 32L720 56L1080 24L1440 40V64H0Z" fill="white" />
        </svg>
      </motion.div>
    </section>
  );
}
