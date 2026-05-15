"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { id: "technology",  label: "Технологи",      emoji: "💻", description: "AI, апп, цахим шийдэл"   },
  { id: "food",        label: "Хоол & Ундаа",    emoji: "🍜", description: "Кафе, брэнд, нутгийн амт" },
  { id: "arts",        label: "Урлаг & Дизайн",  emoji: "🎨", description: "Кино, хөгжим, бүтээл"     },
  { id: "environment", label: "Нийгмийн Нөлөө",  emoji: "🌍", description: "Байгаль, нийгэм, сайн үйл" },
  { id: "education",   label: "Боловсрол",        emoji: "📚", description: "Сургалт, ном, судалгаа"    },
  { id: "health",      label: "Эрүүл Мэнд",      emoji: "❤️", description: "Эрүүл мэнд, спорт"        },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getDisplayCount(id: string, dbCounts?: Record<string, number>): number {
  const FALLBACK: Record<string, number> = {
    technology: 142, food: 98, arts: 214, environment: 176, education: 89, health: 63,
  };
  const real = dbCounts?.[id] ?? 0;
  return real >= 1 ? real : (FALLBACK[id] ?? 0);
}

export function Categories({ counts }: { counts?: Record<string, number> }) {
  return (
    <section className="py-24 bg-gray-50/60 border-y border-gray-100">
      <div className="container-page">

        {/* ── Header ── */}
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

        {/* ── Category grid ── */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
        >
          {CATEGORIES.map(cat => (
            <motion.div
              key={cat.id}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.97 },
                show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } },
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
            >
              <Link
                href={`/explore?category=${cat.id}`}
                className="group flex flex-col items-center text-center p-5 rounded-2xl h-full border border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                <span
                  className="text-3xl mb-3 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3 select-none"
                  role="img"
                  aria-label={cat.label}
                >
                  {cat.emoji}
                </span>

                <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">
                  {cat.label}
                </h3>

                <p className="text-gray-400 text-xs leading-snug hidden sm:block mb-2">
                  {cat.description}
                </p>

                <span className="text-xs font-semibold text-gray-400 mt-auto group-hover:text-blue-700 transition-colors duration-200">
                  {getDisplayCount(cat.id, counts).toLocaleString()} төсөл
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile see all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-950 transition-colors group"
          >
            Бүх ангиллыг үзэх
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
          </Link>
        </div>

      </div>
    </section>
  );
}
