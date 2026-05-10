import Link from "next/link";
import { MOCK_PROJECTS } from "@/lib/mock-data";

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

/* ── Compute per-category project counts from live data ─────────── */
const COUNTS = MOCK_PROJECTS.reduce<Record<string, number>>((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});

/*
  Fallback display counts (demo/marketing scale).
  The COUNTS above reflect real mock data; below are "platform scale"
  numbers shown when real data is sparse (< 5).
*/
const DISPLAY_FALLBACK: Record<string, number> = {
  technology: 142,
  startups:   98,
  arts:       214,
  environment: 176,
  education:  89,
  health:     63,
};

function getDisplayCount(id: string): number {
  const real = COUNTS[id] ?? 0;
  return real >= 5 ? real : (DISPLAY_FALLBACK[id] ?? real);
}

/* ── Component ──────────────────────────────────────────────────── */
export function Categories() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container-page">

        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-2">
            Бүх ангилал
          </p>
          <h2 className="section-heading mb-3">Ямар чиглэлд дэмжих вэ?</h2>
          <p className="text-slate-500 text-base max-w-xl mx-auto">
            Технологиос урлаг хүртэл — таны сонирхолтой чиглэлийн төслүүдийг олоорой.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.id}`}
              className={[
                "group relative flex flex-col items-center text-center p-5 rounded-2xl",
                "bg-gradient-to-br border transition-all duration-200",
                "hover:-translate-y-1.5 hover:shadow-lg focus-visible:outline-none",
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
                {getDisplayCount(cat.id).toLocaleString()} төсөл
              </span>

              {/* Subtle "→" hint that appears on hover */}
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
          ))}
        </div>

        {/* "See all" footer link */}
        <div className="text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm hover:text-blue-900 transition-colors group"
          >
            Бүх ангиллын төслүүдийг харах
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
