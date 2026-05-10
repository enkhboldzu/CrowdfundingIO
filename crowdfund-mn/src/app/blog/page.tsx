import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Блог — Crowdfund.mn",
  description: "Краудфандингийн зөвлөгөө, амжилтын түүхүүд, платформын шинэ мэдээ.",
};

const POSTS = [
  {
    id: 1,
    title: "Хэрхэн амжилттай төсөл эхлүүлэх вэ? — 7 алхам",
    slug: "how-to-start-project",
    date: "2026-05-01",
    category: "Зөвлөгөө",
    categoryColor: "bg-blue-100 text-blue-700",
    readTime: "5 мин",
    author: "Батболд Дорж",
    summary:
      "Краудфандинг кампанит ажил амжилтттай болгохын тулд зөвхөн санаа хангалтгүй. Зорилго тодорхойлох, нийгэмлэг бүтээх, мэдэгдэл гаргах — эдгээр 7 алхам таны кампанийг дараагийн түвшинд гаргана.",
    featured: true,
    image: "https://picsum.photos/seed/crowdblog1/900/480",
  },
  {
    id: 2,
    title: "Краудфандингийн түүх: Дэлхийгээс Монгол хүртэл",
    slug: "history-of-crowdfunding",
    date: "2026-04-20",
    category: "Мэдлэг",
    categoryColor: "bg-violet-100 text-violet-700",
    readTime: "8 мин",
    author: "Энхтуяа Ганбаатар",
    summary:
      "Kickstarter 2009 онд гарсан цагаас эхлэн краудфандинг хэрхэн дэлхийн санхүүжилтийн хэлбэрийг өөрчилсөн тухай — Монголд яагаад цаг нь болсон тухай бас.",
    featured: false,
    image: "https://picsum.photos/seed/crowdblog2/600/340",
  },
  {
    id: 3,
    title: "Шилдэг 10 технологийн төсөл — 2026",
    slug: "top-10-tech-projects-2026",
    date: "2026-04-10",
    category: "Технологи",
    categoryColor: "bg-emerald-100 text-emerald-700",
    readTime: "6 мин",
    author: "Мөнхзул Буянтогс",
    summary:
      "Crowdfund.mn дээр хамгийн их дэмжлэг авсан технологийн 10 төслийг тонглолоо. AI-аас эхлэн ногоон эрчим хүч хүртэл — Монголын tech экосистем өсч байна.",
    featured: false,
    image: "https://picsum.photos/seed/crowdblog3/600/340",
  },
  {
    id: 4,
    title: "Нийгмийн нөлөөллийн төслүүд яагаад чухал вэ?",
    slug: "why-social-impact-matters",
    date: "2026-03-28",
    category: "Нийгэм",
    categoryColor: "bg-rose-100 text-rose-700",
    readTime: "4 мин",
    author: "Батболд Дорж",
    summary:
      "Ашиг олохоор биш, нийгмийг өөрчлөхөөр санаачлагдсан төслүүд — тэдгээр яагаад хамгийн их сэтгэл хөдлөлтэй дэмжлэг авдаг тухай өгүүллэг.",
    featured: false,
    image: "https://picsum.photos/seed/crowdblog4/600/340",
  },
  {
    id: 5,
    title: "Crowdfund.mn дээр хэрхэн дэмжигч татах вэ?",
    slug: "how-to-attract-backers",
    date: "2026-03-15",
    category: "Зөвлөгөө",
    categoryColor: "bg-amber-100 text-amber-700",
    readTime: "7 мин",
    author: "Энхтуяа Ганбаатар",
    summary:
      "Сайн санаатай ч дэмжигч татаж чадахгүй байгаа бол энэ нийтлэл танд зориулагдсан. Видео, зураг, шинэчлэл, нийгэмлэгийн менежментийн практик зөвлөгөө.",
    featured: false,
    image: "https://picsum.photos/seed/crowdblog5/600/340",
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("mn-MN", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <main>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="gradient-brand-hero pt-28 pb-16 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)" }}
        />
        <div className="container-page relative z-10">
          <div className="max-w-2xl">
            <p className="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-3">
              Блог
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4 leading-tight tracking-tight">
              Зөвлөгөө, түүх,<br />шинэ мэдээ
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-lg">
              Краудфандингийн ертөнцөөс мэргэжлийн зөвлөгөө, амжилтын түүхүүд болон
              платформын шинэ мэдээг нэг дороос уншаарай.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-page">

          {/* Featured post */}
          <div className="mb-12">
            <p className="text-blue-700 font-semibold text-xs uppercase tracking-widest mb-4">
              Онцлох нийтлэл
            </p>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 lg:flex">
              <div className="lg:w-1/2 h-56 lg:h-auto overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="lg:w-1/2 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${featured.categoryColor}`}>
                    {featured.category}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(featured.date)}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl text-slate-900 mb-3 leading-snug">
                  {featured.title}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {featured.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">✍️ {featured.author}</span>
                  <button className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 text-sm font-semibold transition-colors group">
                    Унших
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Post grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rest.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col"
              >
                <div className="h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.categoryColor}`}>
                      <span className="flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />
                        {post.category}
                      </span>
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-4 flex-1 line-clamp-3">
                    {post.summary}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.date)}
                    </div>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load more placeholder */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200">
              Цааш үзэх
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

    </main>
  );
}
