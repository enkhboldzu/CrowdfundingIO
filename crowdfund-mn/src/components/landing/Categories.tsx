"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ── Category definitions ───────────────────────────────────────── */
const CATEGORIES = [
  {
    id: "technology",
    label: "Технологи",
    emoji: "💻",
    description: "AI, апп, хардвар, цахим шийдэл",
    color: "from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400 hover:shadow-blue-100",
    textColor: "text-blue-800",
    ring: "ring-blue-300",
  },
  {
    id: "startups",
    label: "Стартап",
    emoji: "🚀",
    description: "Бизнесийн шинэ санаа, оролдлого",
    color: "from-violet-50 to-violet-100 border-violet-200 hover:border-violet-400 hover:shadow-violet-100",
    textColor: "text-violet-800",
    ring: "ring-violet-300",
  },
  {
    id: "arts",
    label: "Урлаг",
    emoji: "🎨",
    description: "Уран зураг, хөгжим, кино, дизайн",
    color: "from-pink-50 to-pink-100 border-pink-200 hover:border-pink-400 hover:shadow-pink-100",
    textColor: "text-pink-800",
    ring: "ring-pink-300",
  },
  {
    id: "environment",
    label: "Нийгмийн Нөлөө",
    emoji: "🌍",
    description: "Байгаль, нийгэм, хүмүүнлэг",
    color: "from-green-50 to-green-100 border-green-200 hover:border-green-400 hover:shadow-green-100",
    textColor: "text-green-800",
    ring: "ring-green-300",
  },
  {
    id: "education",
    label: "Боловсрол",
    emoji: "📚",
    description: "Сургалт, ном, курс, судалгаа",
    color: "from-amber-50 to-amber-100 border-amber-200 hover:border-amber-400 hover:shadow-amber-100",
    textColor: "text-amber-800",
    ring: "ring-amber-300",
  },
  {
    id: "health",
    label: "Эрүүл Мэнд",
    emoji: "❤️",
    description: "Эмнэлэг, эм, сувилгаа, спорт",
    color: "from-red-50 to-red-100 border-red-200 hover:border-red-400 hover:shadow-red-100",
    textColor: "text-red-800",
    ring: "ring-red-300",
  },
];

const DISPLAY_FALLBACK: Record<string, number> = {
  technology:  142,
  startups:    98,
  arts:        214,
  environment: 176,
  education:   89,
  health:      63,
};

function getDisplayCount(id: string, dbCounts?: Record<string, number>): number {
  const real = dbCounts?.[id] ?? 0;
  return real >= 1 ? real : (DISPLAY_FALLBACK[id] ?? 0);
}

/* ── Animation variants ─────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sectionHeader = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: EASE },
  },
};

/* ── Component ──────────────────────────────────────────────────── */
export function Categories({ counts }: { counts?: Record<string, number> }) {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container-page">

        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={sectionHeader}
        >
          <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-2">
            Ангилал
          </p>
          <h2 className="section-heading mb-3">Ямар чиглэлд дэмжих вэ?</h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Технологиос урлаг хүртэл — таны сонирхолтой чиглэлийн төслүүдийг олоорой.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={grid}
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              variants={card}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              <Link
                href={`/explore?category=${cat.id}`}
                className={[
                  "group relative flex flex-col items-center text-center p-5 rounded-2xl h-full",
                  "bg-gradient-to-br border transition-shadow duration-200",
                  "hover:shadow-lg focus-visible:outline-none",
                  `focus-visible:ring-2 ${cat.ring}`,
                  cat.color,
                ].join(" ")}
              >
                {/* Emoji — scale on group-hover */}
                <span
                  className="text-3xl mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3"
                  role="img"
                  aria-label={cat.label}
                >
                  {cat.emoji}
                </span>

                <h3 className={`font-bold text-sm leading-tight mb-1 ${cat.textColor}`}>
                  {cat.label}
                </h3>

                <p className="text-slate-500 text-xs leading-snug hidden sm:block mb-2">
                  {cat.description}
                </p>

                <span className={`text-xs font-semibold mt-auto ${cat.textColor} opacity-70`}>
                  {getDisplayCount(cat.id, counts).toLocaleString()} төсөл
                </span>

                {/* Subtle "→" hint */}
                <span
                  aria-hidden
                  className={[
                    "absolute bottom-2 right-3 text-xs font-bold opacity-0",
                    "translate-x-1 transition-all duration-200",
                    "group-hover:opacity-60 group-hover:translate-x-0",
                    cat.textColor,
                  ].join(" ")}
                >
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* "See all" footer link */}
        <div className="text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm hover:text-blue-900 transition-colors group"
          >
            Бүх ангиллын төслүүдийг харах
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
