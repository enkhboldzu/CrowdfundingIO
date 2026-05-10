import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Ангилалууд — Crowdfund.mn",
  description:
    "Технологи, урлаг, байгаль орчин, боловсрол болон бусад 12 ангиллын идэвхтэй краудфандинг төслүүдийг олоорой.",
};

const CATEGORIES = [
  {
    slug:        "technology",
    name:        "Технологи & Гаджет",
    nameEn:      "Technology & Gadgets",
    emoji:       "💻",
    gradient:    "from-blue-600 to-blue-800",
    glowColor:   "rgba(37,99,235,0.35)",
    count:       24,
    description: "AI, апп, гаджет болон техник хэрэгсэл",
    isPopular:   true,
  },
  {
    slug:        "arts",
    name:        "Бүтээлч урлаг",
    nameEn:      "Creative Arts",
    emoji:       "🎨",
    gradient:    "from-violet-500 to-purple-700",
    glowColor:   "rgba(124,58,237,0.35)",
    count:       17,
    description: "Зураг, гэрэл зураг, дизайн, уран сайхан",
    isPopular:   false,
  },
  {
    slug:        "film",
    name:        "Кино & Видео",
    nameEn:      "Film & Video",
    emoji:       "🎬",
    gradient:    "from-slate-600 to-slate-900",
    glowColor:   "rgba(30,41,59,0.4)",
    count:       9,
    description: "Богино кино, баримтат, анимэйшн",
    isPopular:   false,
  },
  {
    slug:        "environment",
    name:        "Байгаль & Ногоон эрчим хүч",
    nameEn:      "Environment & Green Energy",
    emoji:       "🌿",
    gradient:    "from-emerald-500 to-green-700",
    glowColor:   "rgba(5,150,105,0.35)",
    count:       14,
    description: "Ногоон эрчим хүч, байгаль хамгаалал",
    isPopular:   false,
  },
  {
    slug:        "games",
    name:        "Тоглоом",
    nameEn:      "Games",
    emoji:       "🎮",
    gradient:    "from-indigo-500 to-indigo-800",
    glowColor:   "rgba(79,70,229,0.35)",
    count:       7,
    description: "Видео тоглоом, хөл тоглоом, стратеги",
    isPopular:   false,
  },
  {
    slug:        "health",
    name:        "Эрүүл мэнд & Сайн сайхан",
    nameEn:      "Health & Wellness",
    emoji:       "❤️",
    gradient:    "from-rose-500 to-pink-700",
    glowColor:   "rgba(225,29,72,0.35)",
    count:       19,
    description: "Эмнэлэг, спорт, тансаг байдал",
    isPopular:   true,
  },
  {
    slug:        "education",
    name:        "Боловсрол",
    nameEn:      "Education",
    emoji:       "📚",
    gradient:    "from-amber-500 to-orange-600",
    glowColor:   "rgba(217,119,6,0.35)",
    count:       31,
    description: "Онлайн сургалт, ном, мэдлэг дамжуулах",
    isPopular:   true,
  },
  {
    slug:        "community",
    name:        "Нийгмийн төсөл",
    nameEn:      "Community Projects",
    emoji:       "🤝",
    gradient:    "from-teal-500 to-cyan-700",
    glowColor:   "rgba(13,148,136,0.35)",
    count:       12,
    description: "Хот орон нутаг, нийгмийн дэд бүтэц",
    isPopular:   false,
  },
  {
    slug:        "food",
    name:        "Хоол & Ундаа",
    nameEn:      "Food & Beverage",
    emoji:       "🍜",
    gradient:    "from-orange-500 to-red-600",
    glowColor:   "rgba(234,88,12,0.35)",
    count:       8,
    description: "Монгол хоол, ресторан, хүнс үйлдвэрлэл",
    isPopular:   false,
  },
  {
    slug:        "fashion",
    name:        "Загвар хувцас",
    nameEn:      "Fashion",
    emoji:       "👗",
    gradient:    "from-pink-500 to-rose-600",
    glowColor:   "rgba(236,72,153,0.35)",
    count:       11,
    description: "Монгол загвар, дэл, гоёл чимэглэл",
    isPopular:   false,
  },
  {
    slug:        "music",
    name:        "Хөгжим",
    nameEn:      "Music",
    emoji:       "🎵",
    gradient:    "from-violet-600 to-purple-800",
    glowColor:   "rgba(109,40,217,0.35)",
    count:       6,
    description: "Уламжлалт болон орчин үеийн хөгжим",
    isPopular:   false,
  },
  {
    slug:        "publishing",
    name:        "Хэвлэл & Ном",
    nameEn:      "Publishing",
    emoji:       "📖",
    gradient:    "from-slate-500 to-slate-700",
    glowColor:   "rgba(71,85,105,0.35)",
    count:       4,
    description: "Ном, сэтгүүл, дижитал контент",
    isPopular:   false,
  },
];

const TOTAL_PROJECTS = CATEGORIES.reduce((s, c) => s + c.count, 0);

export default function CategoriesPage() {
  return (
    <>
      <main>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="gradient-brand-hero pt-28 pb-12 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-1/3 w-96 h-48 opacity-10"
            style={{ background: "radial-gradient(ellipse, #60A5FA, transparent 70%)" }}
          />

          <div className="container-page relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
              {/* Left: heading */}
              <div>
                <p className="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-3">
                  Ангилалаар харах
                </p>
                <h1 className="font-display font-bold text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-3">
                  Юу хайж<br className="hidden sm:block" /> байна вэ?
                </h1>
                <p className="text-white/60 text-base max-w-md leading-relaxed">
                  Монголын нийгэмд нөлөөлж буй{" "}
                  <strong className="text-white">{CATEGORIES.length} ангиллын</strong>{" "}
                  <strong className="text-white">{TOTAL_PROJECTS}+</strong>{" "}
                  идэвхтэй төслөөс сонгоно уу.
                </p>
              </div>

              {/* Right: stat pills */}
              <div className="flex flex-wrap gap-3 sm:flex-shrink-0">
                {[
                  { value: CATEGORIES.length,            label: "Ангилал" },
                  { value: `${TOTAL_PROJECTS}+`,         label: "Идэвхтэй төсөл" },
                  { value: "94%",                         label: "Амжилтын хувь" },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-3.5 text-center min-w-[80px]"
                  >
                    <div className="font-display font-bold text-xl text-white">{stat.value}</div>
                    <div className="text-white/55 text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Category grid ────────────────────────────────── */}
        <section className="bg-slate-50 py-14">
          <div className="container-page">

            {/* Popular label */}
            <div className="flex items-center gap-3 mb-8">
              <p className="text-slate-400 text-sm font-medium">
                🔥 Онцлох ангилалыг тэмдэглэсэн
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/explore?category=${cat.slug}`}
                  className="group block rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5"
                >
                  {/* Gradient icon header */}
                  <div
                    className={`relative h-36 bg-gradient-to-br ${cat.gradient} flex items-center justify-center overflow-hidden`}
                  >
                    {/* Grid overlay */}
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage:
                          "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                        backgroundSize: "18px 18px",
                      }}
                    />
                    {/* Radial glow */}
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 65%, rgba(255,255,255,0.25), transparent 60%)",
                      }}
                    />

                    {/* Popular badge */}
                    {cat.isPopular && (
                      <div className="absolute top-2.5 right-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        🔥 Онцлох
                      </div>
                    )}

                    {/* Emoji */}
                    <span
                      className="relative z-10 text-5xl transition-transform duration-300 group-hover:scale-110 select-none"
                      role="img"
                      aria-label={cat.nameEn}
                    >
                      {cat.emoji}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-display font-bold text-slate-900 text-sm sm:text-[15px] leading-snug">
                        {cat.name}
                      </h3>
                      <svg
                        className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-1 mb-3.5">
                      {cat.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      {cat.count} идэвхтэй төсөл
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-14 rounded-2xl bg-gradient-to-br from-blue-800 to-blue-950 p-8 sm:p-10 text-center relative overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative z-10">
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">
                  Илүү олон ангилал удахгүй
                </p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
                  Тодорхой ангилал олдсонгүй?
                </h2>
                <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
                  Бүх ангиллын нийт{" "}
                  <strong className="text-white">{TOTAL_PROJECTS}+</strong> идэвхтэй
                  төслийг нэг дороос хайж харна уу.
                </p>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 bg-white text-blue-800 font-bold text-sm sm:text-base px-6 py-3 rounded-xl shadow-cta hover:bg-blue-50 transition-colors duration-200"
                >
                  Бүх төслүүдийг харах
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
