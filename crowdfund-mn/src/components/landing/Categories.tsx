"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLandingData } from "@/hooks/useLandingData";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Category {
  id:          string;
  label:       string;
  emoji:       string;
  description: string;
  /** Tailwind class for the large-block accent background */
  accentBg:    string;
  accentText:  string;
  large?:      boolean;
}

const CATEGORIES: Category[] = [
  {
    id: "technology",
    label: "Технологи",
    emoji: "💻",
    description: "AI, апп, цахим шийдэл",
    accentBg: "bg-blue-950",
    accentText: "text-white",
    large: true,
  },
  {
    id: "food",
    label: "Хоол & Ундаа",
    emoji: "🍜",
    description: "Кафе, брэнд, нутгийн амт",
    accentBg: "bg-white",
    accentText: "text-gray-950",
  },
  {
    id: "arts",
    label: "Урлаг & Дизайн",
    emoji: "🎨",
    description: "Кино, хөгжим, бүтээл",
    accentBg: "bg-white",
    accentText: "text-gray-950",
  },
  {
    id: "environment",
    label: "Нийгмийн Нөлөө",
    emoji: "🌍",
    description: "Байгаль, нийгэм, сайн үйл",
    accentBg: "bg-white",
    accentText: "text-gray-950",
  },
  {
    id: "education",
    label: "Боловсрол",
    emoji: "📚",
    description: "Сургалт, ном, судалгаа",
    accentBg: "bg-white",
    accentText: "text-gray-950",
  },
  {
    id: "health",
    label: "Эрүүл Мэнд",
    emoji: "❤️",
    description: "Эрүүл мэнд, спорт",
    accentBg: "bg-gray-950",
    accentText: "text-white",
    large: true,
  },
];

const FALLBACK: Record<string, number> = {
  technology: 142, food: 98, arts: 214,
  environment: 176, education: 89, health: 63,
};

function getCount(id: string, counts?: Record<string, number>): number {
  const real = counts?.[id] ?? 0;
  return real >= 1 ? real : (FALLBACK[id] ?? 0);
}

/* ── Skeleton cells ──────────────────────────────────────────── */

function BentoSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[160px]">
      {/* Large top-left */}
      <div className="col-span-2 row-span-2 rounded-3xl bg-gray-100 animate-pulse" />
      {/* 2 normal cells */}
      <div className="col-span-1 rounded-3xl bg-gray-100 animate-pulse" />
      <div className="col-span-1 rounded-3xl bg-gray-100 animate-pulse" />
      {/* 2 normal cells */}
      <div className="col-span-1 rounded-3xl bg-gray-100 animate-pulse" />
      <div className="col-span-1 rounded-3xl bg-gray-100 animate-pulse" />
      {/* Large bottom-right */}
      <div className="col-span-2 rounded-3xl bg-gray-100 animate-pulse" />
    </div>
  );
}

/* ── Bento cell ──────────────────────────────────────────────── */

function BentoCell({ cat, count, large }: { cat: Category; count: number; large?: boolean }) {
  const isLight = cat.accentBg === "bg-white";

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.96, y: 16 },
        show:   { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      }}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={large ? "col-span-2 row-span-2" : "col-span-1 row-span-1"}
    >
      <Link
        href={`/explore?category=${cat.id}`}
        className={[
          "group flex flex-col justify-between h-full rounded-3xl border transition-all duration-300 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
          cat.accentBg,
          isLight
            ? "border-gray-200 hover:border-blue-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            : "border-transparent hover:opacity-90",
        ].join(" ")}
      >
        {/* Emoji */}
        <span
          className={["text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 select-none", large ? "text-5xl" : ""].join(" ")}
          role="img"
          aria-label={cat.label}
        >
          {cat.emoji}
        </span>

        {/* Label row */}
        <div>
          <h3 className={["font-display font-black leading-tight mb-1", large ? "text-xl" : "text-sm", cat.accentText].join(" ")}>
            {cat.label}
          </h3>
          {large && (
            <p className={["text-sm leading-snug mb-3 opacity-70", cat.accentText].join(" ")}>
              {cat.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className={["text-xs font-semibold opacity-60", cat.accentText].join(" ")}>
              {count.toLocaleString()} төсөл
            </span>
            <ArrowRight
              className={["w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-all duration-200 group-hover:translate-x-1", cat.accentText].join(" ")}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Main component ──────────────────────────────────────────── */

export function Categories() {
  const { data, loading } = useLandingData();
  const counts = data?.categoryCounts;

  return (
    <section className="py-24 bg-gray-50/60 border-y border-gray-100">
      <div className="container-page">

        {/* Section header */}
        <motion.div
          className="flex items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
              Ангилал
            </p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
              Ямар санааг<br className="sm:hidden" /> <span className="text-blue-800">дэмжих вэ?</span>
            </h2>
          </div>

          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-950 transition-colors group"
          >
            Бүгдийг харах
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
          </Link>
        </motion.div>

        {/* Skeleton */}
        {loading && <BentoSkeleton />}

        {/* Bento grid */}
        {!loading && (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[160px]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
          >
            {CATEGORIES.map(cat => (
              <BentoCell
                key={cat.id}
                cat={cat}
                count={getCount(cat.id, counts)}
                large={cat.large}
              />
            ))}
          </motion.div>
        )}

        {/* Mobile see all */}
        {!loading && (
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-950 transition-colors group"
            >
              Бүх ангиллыг үзэх
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
