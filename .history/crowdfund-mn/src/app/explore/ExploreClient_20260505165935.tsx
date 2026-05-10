"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar }        from "@/components/landing/Navbar";
import { Footer }        from "@/components/landing/Footer";
import { ProjectCard }   from "@/components/projects/ProjectCard";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { cn }            from "@/lib/utils";

const CATEGORIES = [
  { value: "all",         label: "Бүгд",          emoji: null  },
  { value: "technology",  label: "Технологи",      emoji: "💻" },
  { value: "arts",        label: "Урлаг",          emoji: "🎨" },
  { value: "film",        label: "Кино",           emoji: "🎬" },
  { value: "environment", label: "Байгаль орчин", emoji: "🌿" },
  { value: "games",       label: "Тоглоом",        emoji: "🎮" },
  { value: "health",      label: "Эрүүл мэнд",    emoji: "❤️" },
  { value: "education",   label: "Боловсрол",      emoji: "📚" },
  { value: "community",   label: "Нийгэм",         emoji: "🤝" },
  { value: "food",        label: "Хоол & Ундаа",  emoji: "🍜" },
  { value: "fashion",     label: "Загвар",         emoji: "👗" },
  { value: "music",       label: "Хөгжим",         emoji: "🎵" },
  { value: "publishing",  label: "Хэвлэл",         emoji: "📖" },
];

const SORT_OPTIONS = [
  { value: "trending",    label: "🔥 Онцлох" },
  { value: "ending_soon", label: "⏳ Дуусахад ойрхон" },
  { value: "most_funded", label: "💰 Их санхүүжсэн" },
  { value: "newest",      label: "🆕 Шинэ" },
];

const TOTAL_RAISED  = MOCK_PROJECTS.reduce((s, p) => s + p.raised, 0);
const TOTAL_BACKERS = MOCK_PROJECTS.reduce((s, p) => s + p.backers, 0);

interface Props { initialCategory?: string; }

export function ExploreClient({ initialCategory = "all" }: Props) {
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort,     setSort]     = useState("trending");

  // Sync when navigating between /explore?category=X links
  useEffect(() => { setCategory(initialCategory); }, [initialCategory]);

  const filtered = useMemo(() => {
    let list = [...MOCK_PROJECTS];

    if (category !== "all") {
      list = list.filter(p => p.category === category);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (sort === "ending_soon") list.sort((a, b) => a.daysLeft - b.daysLeft);
    else if (sort === "most_funded") list.sort((a, b) => b.raised - a.raised);
    else if (sort === "newest") list.reverse();
    else list.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));

    return list;
  }, [query, category, sort]);

  const activeLabel = CATEGORIES.find(c => c.value === category)?.label ?? category;
  const hasFilter   = query.trim() !== "" || category !== "all";

  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero search strip ────────────────────────────── */}
        <section className="gradient-brand-hero pt-28 pb-16 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #60A5FA, transparent 70%)" }}
          />

          <div className="container-page relative z-10">
            <div className="max-w-2xl">
              <p className="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-3">
                Төгс төслөө олоорой
              </p>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-3 tracking-tight leading-tight">
                Дараагийн шилдэг<br />санааг дэмж
              </h1>
              <p className="text-white/60 text-base sm:text-lg mb-8 max-w-lg">
                Монголын залуу бүтээгчид, нийгмийн хөдөлгөөн, шинэлэг стартапуудыг нэг дороос олоорой.
              </p>

              {/* Search */}
              <div className="relative mb-8">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Төсөл, ангилал, түлхүүр үг хайх..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-slate-900 placeholder-slate-400 text-base font-medium shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/60 transition-shadow"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Хайлт цэвэрлэх"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span><strong className="text-white font-bold">{MOCK_PROJECTS.length}</strong> идэвхтэй төсөл</span>
                </div>
                <div className="text-white/40 hidden sm:block">·</div>
                <div className="text-white/70">
                  <strong className="text-white font-bold">₮{(TOTAL_RAISED / 1_000_000).toFixed(0)}M+</strong> нийт санхүүжилт
                </div>
                <div className="text-white/40 hidden sm:block">·</div>
                <div className="text-white/70">
                  <strong className="text-white font-bold">{TOTAL_BACKERS.toLocaleString()}+</strong> дэмжигч
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sticky filter bar ────────────────────────────── */}
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
          <div className="container-page">
            <div className="flex items-center gap-3 py-3 sm:py-3.5">
              <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 pb-0.5 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                      category === cat.value
                        ? "bg-blue-800 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    )}
                  >
                    {cat.emoji && <span>{cat.emoji}</span>}
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="hidden sm:block h-6 w-px bg-slate-200 flex-shrink-0" />
              <span className="hidden sm:block flex-shrink-0 text-slate-400 text-sm whitespace-nowrap">
                {filtered.length} үр дүн
              </span>

              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="flex-shrink-0 text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Results ──────────────────────────────────────── */}
        <section className="bg-slate-50 min-h-[60vh]">
          <div className="container-page py-10">

            {hasFilter && (
              <div className="flex flex-wrap items-center gap-2 mb-7">
                <span className="text-slate-400 text-sm font-medium">Шүүлтүүр:</span>
                {category !== "all" && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {CATEGORIES.find(c => c.value === category)?.emoji}{" "}{activeLabel}
                    <button onClick={() => setCategory("all")} aria-label="Ангилал арилгах" className="ml-0.5 hover:text-blue-600">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                    </button>
                  </span>
                )}
                {query.trim() && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                    &ldquo;{query}&rdquo;
                    <button onClick={() => setQuery("")} aria-label="Хайлт арилгах" className="ml-0.5 hover:text-blue-600">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                    </button>
                  </span>
                )}
                <button
                  onClick={() => { setQuery(""); setCategory("all"); }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-medium underline underline-offset-2"
                >
                  Бүгдийг цэвэрлэх
                </button>
              </div>
            )}

            <p className="text-slate-400 text-sm mb-6 sm:hidden">{filtered.length} үр дүн</p>

            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto mb-5 text-2xl">🔍</div>
                <h3 className="font-display font-bold text-slate-800 text-xl mb-2">Төсөл олдсонгүй</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
                  {query
                    ? `"${query}" гэсэн хайлтад тохирох төсөл байхгүй.`
                    : `"${activeLabel}" ангиллаас одоогоор идэвхтэй төсөл байхгүй байна.`
                  } Шүүлтүүрээ өөрчилж үзнэ үү.
                </p>
                <button
                  onClick={() => { setQuery(""); setCategory("all"); }}
                  className="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Бүх төслүүд харах
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
