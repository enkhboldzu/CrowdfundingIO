"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLandingData } from "@/hooks/useLandingData";

/* ── Category definitions ───────────────────────────────────────── */

const CATEGORIES = [
  {
    id: "technology",
    label: "Технологи",
    emoji: "💻",
    description: "AI, апп, төхөөрөмж, цахим шийдэл",
    className: "col-span-2 row-span-2 bg-blue-950 text-white",
    emojiSize: "text-5xl",
    titleSize: "text-xl",
  },
  {
    id: "health",
    label: "Эрүүл Мэнд",
    emoji: "❤️",
    description: "Эрүүл амьдрал, эмчилгээ, спорт",
    className: "col-span-2 bg-gray-950 text-white",
    emojiSize: "text-3xl",
    titleSize: "text-base",
  },
  {
    id: "food",
    label: "Хоол & Ундаа",
    emoji: "🍜",
    description: "Кафе, брэнд, нутгийн амт",
    className: "col-span-1 bg-white border border-gray-200 text-gray-900",
    emojiSize: "text-3xl",
    titleSize: "text-sm",
  },
  {
    id: "arts",
    label: "Урлаг",
    emoji: "🎨",
    description: "Кино, хөгжим, дизайн",
    className: "col-span-1 bg-white border border-gray-200 text-gray-900",
    emojiSize: "text-3xl",
    titleSize: "text-sm",
  },
  {
    id: "environment",
    label: "Нийгмийн Нөлөө",
    emoji: "🌍",
    description: "Байгаль, нийгэм, сайн үйл",
    className: "col-span-1 bg-white border border-gray-200 text-gray-900",
    emojiSize: "text-3xl",
    titleSize: "text-sm",
  },
  {
    id: "education",
    label: "Боловсрол",
    emoji: "📚",
    description: "Сургалт, ном, мэдлэг",
    className: "col-span-1 bg-white border border-gray-200 text-gray-900",
    emojiSize: "text-3xl",
    titleSize: "text-sm",
  },
];

/* ── Bento skeleton ─────────────────────────────────────────────── */

function BentoSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[160px] gap-4 mb-8 animate-pulse">
      <div className="col-span-2 row-span-2 rounded-3xl bg-gray-200" />
      <div className="col-span-2 rounded-3xl bg-gray-100" />
      <div className="rounded-3xl bg-gray-100" />
      <div className="rounded-3xl bg-gray-100" />
      <div className="rounded-3xl bg-gray-100" />
      <div className="rounded-3xl bg-gray-100" />
    </div>
  );
}

/* ── Animation variants ─────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionHeader = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cell = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

/* ── Component ──────────────────────────────────────────────────── */

export function Categories() {
  const { data, loading } = useLandingData();
  const counts = data?.categoryCounts ?? {};

  function getCount(id: string): number {
    return counts[id] ?? 0;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-page">

        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionHeader}
        >
          <p className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-2">
            Ангилал
          </p>
          <h2 className="section-heading mb-3">Ямар санааг дэмжих вэ?</h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Сонирхолтой чиглэлээ сонгоод өөрт ойр санагдах төслөө хурдан олоорой.
          </p>
        </motion.div>

        {/* Bento grid */}
        {loading ? (
          <BentoSkeleton />
        ) : (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[160px] gap-4 mb-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={grid}
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.id} variants={cell} className={cat.className + " rounded-3xl"}>
                <Link
                  href={`/explore?category=${cat.id}`}
                  className={[
                    "group relative flex flex-col justify-between h-full w-full p-5 rounded-3xl",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    "hover:opacity-90 transition-opacity duration-200",
                  ].join(" ")}
                >
                  <span className={cat.emojiSize} role="img" aria-label={cat.label}>
                    {cat.emoji}
                  </span>

                  <div>
                    <h3 className={`font-bold leading-tight mb-0.5 ${cat.titleSize}`}>
                      {cat.label}
                    </h3>
                    <p className={[
                      "text-xs leading-snug hidden sm:block",
                      cat.className.includes("text-white") ? "opacity-60" : "text-gray-500",
                    ].join(" ")}>
                      {cat.description}
                    </p>
                    <p className={[
                      "text-xs font-semibold mt-1",
                      cat.className.includes("text-white") ? "opacity-50" : "text-gray-400",
                    ].join(" ")}>
                      {getCount(cat.id).toLocaleString()} төсөл
                    </p>
                  </div>

                  {/* Arrow hint */}
                  <span
                    aria-hidden
                    className={[
                      "absolute bottom-4 right-4 text-sm font-bold",
                      "opacity-0 translate-x-1 group-hover:opacity-60 group-hover:translate-x-0",
                      "transition-all duration-200",
                    ].join(" ")}
                  >
                    →
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* "See all" footer link */}
        <div className="text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-gray-600 font-semibold text-sm hover:text-gray-950 transition-colors group"
          >
            Бүх ангиллыг үзэх
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
