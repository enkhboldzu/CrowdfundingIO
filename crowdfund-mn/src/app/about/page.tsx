import type { Metadata } from "next";
import { Heart, Globe, Zap, Users, Target, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Бидний тухай — Crowdfund.mn",
  description: "Монголын бүтээгчид, инновацчид, нийгмийн төслүүдийг дэмжих зорилгоор байгуулагдсан crowdfund.mn-ийн тухай.",
};

const STATS = [
  { value: "500+",    label: "Амжилттай төсөл"     },
  { value: "12,000+", label: "Идэвхтэй дэмжигч"    },
  { value: "₮2.1Т+",  label: "Нийт босгосон"        },
  { value: "98%",     label: "Хэрэглэгчийн сэтгэл ханамж" },
];

const VALUES = [
  {
    Icon: Heart,
    title: "Итгэл",
    desc: "Бүтээгчид болон дэмжигчдийн хооронд бодит итгэлцлийг бий болгоно. Бид хариуцлагатай, ил тод харилцааг эрхэмлэнэ.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    Icon: Globe,
    title: "Нийтлэг хандалт",
    desc: "Монголын хаана ч байгаа бүтээгч манай платформыг ашиглах боломжтой. Хот болон хөдөөгийн ялгааг арилгана.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    Icon: Zap,
    title: "Хурдан процесс",
    desc: "Хурдан, хялбар бүртгэлийн процессоор таны санаа богино хугацаанд зах зээлд хүрнэ. Бюрократ байхгүй.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    Icon: Users,
    title: "Хүчирхэг нийгэмлэг",
    desc: "Зөвхөн мөнгө бус, туршлагатай ментор, хөрөнгө оруулагч, дэмжигчдийн нийгэмлэгтэй холбоно.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    Icon: Target,
    title: "Тодорхой зорилго",
    desc: "Төслийн зорилго, төсвийн хуваарилалт, хэрэгжилтийн явцыг ил тод тайлагнах тогтолцоо.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    Icon: TrendingUp,
    title: "Өсөлтийг дэмж",
    desc: "Амжилтт бүрийг дараагийн алхмаа авахад дэмжинэ. Эхний өдрөөс эхлэн бизнесийн зөвлөгөө, сүлжээ.",
    color: "bg-cyan-50 text-cyan-600",
  },
];

const TEAM = [
  {
    name: "Батболд Дорж",
    role: "Үүсгэн байгуулагч & CEO",
    initials: "БД",
    gradient: "from-blue-500 to-blue-700",
    bio: "Монголын инноваци дэлхийд хүрэх боломжтой гэдэгт гүнээ итгэдэг. Өдөрт 4 аяга кофе, бас стартапын хариулагдаагүй 200 имэйл.",
    linkedin: "#",
  },
  {
    name: "Энхтуяа Ганбаатар",
    role: "Техникийн захирал & CTO",
    initials: "ЭГ",
    gradient: "from-violet-500 to-violet-700",
    bio: "Алгоритм болон буузыг адилхан дуртайгаар задалдаг. Гэр бүлийнхэн нь 'компьютер засчихдаг хүн' гэж таниулдаг.",
    linkedin: "#",
  },
  {
    name: "Мөнхзул Буянтогс",
    role: "Дизайны дарга & Хамтран үүсгэн байгуулагч",
    initials: "МБ",
    gradient: "from-pink-500 to-rose-600",
    bio: "Пиксел бүрийн цаана утга байдаг гэж үздэг. Уран зурагч болох мөрөөдлөөсөө UX дизайны ертөнцөд унасан — гэсэн ч харамсаагүй.",
    linkedin: "#",
  },
];

export default function AboutPage() {
  return (
    <main>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="gradient-brand-hero pt-28 pb-20 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-24 -right-20 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)" }}
        />
        <div className="container-page relative z-10 text-center max-w-3xl mx-auto">
          <p className="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-3">
            Бидний тухай
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-5 leading-tight tracking-tight">
            Монголын бүтээгчдийг<br />дэлхийд таниулна
          </h1>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            crowdfund.mn нь Монголын инновацчид, урлагийн бүтээгчид болон нийгмийн
            санаачлагчдыг санхүүжилт, нийгэмлэгтэй холбодог нээлттэй платформ юм.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-page py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display font-bold text-3xl sm:text-4xl text-blue-800 mb-1">
                  {s.value}
                </p>
                <p className="text-slate-500 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Story ────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Text */}
            <div>
              <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-3">
                Манай түүх
              </p>
              <h2 className="font-display font-bold text-3xl text-slate-900 mb-5 leading-snug">
                Нэг асуултаас эхэлсэн аялал
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  2023 оны эхээр бид гурав гурван асуулт тавьсан: Яагаад Монголын шилдэг бүтээлүүд
                  санхүүжилтийн асуудлаас болж хойш тавигддаг вэ? Яагаад нийгмийн сайн санаачлага
                  ивээн тэтгэгч хайхаар сарыг хугацаагаа үрдэг вэ?
                </p>
                <p>
                  Хариулт нь нэг байсан: зөв платформ байхгүй байсан. Тиймдээ бид crowdfund.mn-ийг
                  байгуулсан — зөвхөн мөнгө цуглуулах биш, нийгэмлэг, итгэл, хамтын хүчийг
                  нэгтгэдэг орон зай.
                </p>
                <p>
                  Өнөөдөр бид 500 гаруй амжилттай төсөлтэй, 12,000 гаруй идэвхтэй дэмжигчтэй
                  болсон. Гэхдээ энэ бол зөвхөн эхлэл — Монголын бүтээлч хүмүүнийхэй боломж
                  хязгааргүй.
                </p>
              </div>
            </div>
            {/* Visual */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl h-40 flex items-center justify-center text-5xl shadow-sm">
                🚀
              </div>
              <div className="bg-gradient-to-br from-violet-100 to-violet-200 rounded-2xl h-40 flex items-center justify-center text-5xl shadow-sm mt-6">
                💡
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl h-40 flex items-center justify-center text-5xl shadow-sm -mt-4">
                🌍
              </div>
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl h-40 flex items-center justify-center text-5xl shadow-sm mt-2">
                🏆
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-2">
              Манай үнэт зүйлс
            </p>
            <h2 className="section-heading mb-3">Бид юуг чухалчилдаг вэ?</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              Платформоо байгуулсан үнэт зүйлс — хэрэглэгч бүртэй, шийдвэр бүрт тусгагдсан.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {VALUES.map(({ Icon, title, desc, color }) => (
              <div
                key={title}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────── */}
      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <div className="text-center mb-12">
            <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-2">
              Манай баг
            </p>
            <h2 className="section-heading mb-3">Хүмүүсийг тань</h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              Жижигхэн боловч зоригтой баг — crowdfund.mn-ийг бодит болгосон хүмүүс.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-7 border border-slate-100 hover:shadow-lg transition-all duration-200 text-center group"
              >
                {/* Avatar */}
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-5 shadow-md group-hover:scale-105 transition-transform duration-200`}
                >
                  <span className="text-white font-bold text-xl font-display">
                    {member.initials}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-0.5">{member.name}</h3>
                <p className="text-blue-700 text-xs font-semibold mb-3">{member.role}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container-page text-center max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-slate-900 mb-4">
            Манай нийгэмлэгт нэгдэх үү?
          </h2>
          <p className="text-slate-500 text-base mb-8 leading-relaxed">
            Монголын дараагийн шилдэг бүтээлийг хамтдаа босгоцгооё. Бүтээгч ч, дэмжигч ч
            энд тавтай морил.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/explore"
              className="inline-flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Төслүүд харах
            </a>
            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              Бүртгүүлэх
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
