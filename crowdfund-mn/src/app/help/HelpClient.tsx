"use client";

import { useState } from "react";
import { ChevronDown, Search, MessageCircle, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    id: 1,
    question: "Төсөл яаж эхлүүлэх вэ?",
    answer:
      "Бүртгэлтэй хэрэглэгч 'Төсөл эхлэх' товчийг дарж, тавдан алхамт маягтыг бөглөнө: Үндсэн мэдээлэл → Зорилго & санхүүжилт → Шагнал тохиргоо → Мэдиа контент → Хянан нийтлүүлэх. Баг 1–3 ажлын өдрийн дотор хянан зөвшөөрнө.",
  },
  {
    id: 2,
    question: "Зорилгодоо хүрч чадаагүй бол мөнгөө буцааж авах уу?",
    answer:
      "Тийм. crowdfund.mn нь 'All-or-Nothing' загварыг ашигладаг — зорилгын дүнгээ бүрэн цуглуулж чадаагүй бол дэмжигч нарын мөнгийг бүрэн буцаана. Буцаалт 5–7 ажлын өдрийн дотор хийгдэнэ.",
  },
  {
    id: 3,
    question: "Хяналтын процесс хэр удаан үргэлжлэх вэ?",
    answer:
      "Стандарт хянан шалгах хугацаа 1–3 ажлын өдөр. Мэдээллийг бүрэн, үнэн зөв оруулсан тохиолдолд хурдан батлагдана. Нэмэлт баримт бичиг шаардлагатай бол баг холбоо барина.",
  },
  {
    id: 4,
    question: "Платформ ямар хэмжээний шимтгэл авах вэ?",
    answer:
      "Амжилттай кампанийн нийт цуглуулсан дүнгийн 5% шимтгэл авна. Амжилтгүй болсон (зорилгодоо хүрээгүй) тохиолдолд ямар ч шимтгэл авахгүй. Төлбөр боловсруулалтын 2.5% нь тусдаа тооцогдоно.",
  },
  {
    id: 5,
    question: "Ямар ангиллын төсөл байж болох вэ?",
    answer:
      "Технологи, урлаг, боловсрол, эрүүл мэнд, нийгмийн нөлөө, тоглоом, хоол & ундаа, загвар болон бусад бараг бүх чиглэлийн төсөл байж болно. Хуулиар хориглосон, хууран мэхлэх шинжтэй, дэмжигчдийг гэмтээж болзошгүй контент зөвшөөрөхгүй.",
  },
  {
    id: 6,
    question: "Кампанийн хугацаа хэр байх вэ?",
    answer:
      "Кампанийн хугацаа 7-аас 60 хоног хооронд байна. Практик туршлагаас харахад 30 хоногийн кампани хамгийн сайн үр дүн өгдөг — хэт урт эсвэл богино кампани дэмжигчдийн сонирхлыг бууруулдаг.",
  },
  {
    id: 7,
    question: "Гадаад валютаар хандив авах боломжтой юу?",
    answer:
      "Одоогоор платформ нь MNT (Монгол төгрөг) дэмждэг. Дэлхийн хэд хэдэн гол валютыг дэмжих ажил 2026 оны III улиралд нэмэгдэх төлөвлөгөөтэй байна.",
  },
  {
    id: 8,
    question: "Дэмжигч болохын тулд бүртгэл шаардлагатай юу?",
    answer:
      "Тийм. Аюулгүй байдал болон буцаалтын процессыг баталгаажуулахын тулд дэмжигч бүр crowdfund.mn-д бүртгэлтэй байх шаардлагатай. Бүртгэл нь хурдан, үнэгүй.",
  },
];

function FaqItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200",
          open ? "bg-blue-50" : "bg-white hover:bg-slate-50"
        )}
        aria-expanded={open}
      >
        <span className={cn("font-semibold text-sm leading-snug", open ? "text-blue-800" : "text-slate-900")}>
          {faq.question}
        </span>
        <ChevronDown
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-transform duration-200",
            open ? "rotate-180 text-blue-600" : "text-slate-400"
          )}
        />
      </button>
      {open && (
        <div className="px-6 py-5 bg-white border-t border-slate-100">
          <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export function HelpClient() {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? FAQS.filter(
        f =>
          f.question.toLowerCase().includes(query.toLowerCase()) ||
          f.answer.toLowerCase().includes(query.toLowerCase())
      )
    : FAQS;

  return (
    <main>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="gradient-brand-hero pt-28 pb-16 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)" }}
        />
        <div className="container-page relative z-10 text-center max-w-2xl mx-auto">
          <p className="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-3">
            Тусламж & Дэмжлэг
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-5 leading-tight tracking-tight">
            Танд хэрхэн туслах вэ?
          </h1>
          <p className="text-white/70 text-base mb-8">
            Хамгийн их асуугддаг асуултуудад хариулт бэлдсэн. Олдохгүй байвал биддэнтэй холбоо барина уу.
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Асуулт хайх..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/95 text-slate-900 placeholder-slate-400 text-base font-medium shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/60"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="container-page max-w-3xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-slate-900">
              Түгээмэл асуултууд
            </h2>
            {query && (
              <span className="text-slate-400 text-sm">
                {filtered.length} үр дүн
              </span>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map(faq => (
                <FaqItem key={faq.id} faq={faq} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-slate-500 text-sm">
                &ldquo;{query}&rdquo; хайлтад тохирох хариулт олдсонгүй.
              </p>
              <button
                onClick={() => setQuery("")}
                className="mt-4 text-blue-700 text-sm font-semibold hover:underline"
              >
                Хайлтыг цэвэрлэх
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-2xl text-slate-900 mb-2">
              Хариулт олдсонгүй юу?
            </h2>
            <p className="text-slate-500 text-sm">Манай дэмжлэгийн баг таныг хүлээж байна.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                Icon: MessageCircle,
                title: "Чат",
                desc: "Ажлын цагаар 09:00–18:00",
                action: "Чат эхлүүлэх",
                color: "bg-blue-50 text-blue-600",
              },
              {
                Icon: Mail,
                title: "И-мэйл",
                desc: "support@crowdfund.mn",
                action: "И-мэйл бичих",
                color: "bg-violet-50 text-violet-600",
              },
              {
                Icon: Phone,
                title: "Утас",
                desc: "+976 7700-0000",
                action: "Залгах",
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map(({ Icon, title, desc, action, color }) => (
              <div
                key={title}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center hover:shadow-md transition-shadow duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{title}</h3>
                <p className="text-slate-500 text-xs mb-4">{desc}</p>
                <button className="text-blue-700 hover:text-blue-900 text-sm font-semibold transition-colors">
                  {action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
