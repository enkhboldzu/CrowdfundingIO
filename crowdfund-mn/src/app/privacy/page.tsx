import type { Metadata } from "next";
import { Shield, Eye, Lock, UserCheck, Trash2, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Нууцлалын бодлого — Crowdfund.mn",
  description: "crowdfund.mn-ийн хэрэглэгчийн мэдээлэл цуглуулах, хадгалах, ашиглах бодлогын талаарх дэлгэрэнгүй мэдээлэл.",
};

const SECTIONS = [
  {
    Icon: Eye,
    id: "collection",
    title: "1. Бид ямар мэдээлэл цуглуулах вэ?",
    content: [
      {
        subtitle: "Та өгч буй мэдээлэл",
        text: "Бүртгэлийн үед нэр, и-мэйл хаяг, утасны дугаар цуглуулагдана. Төсөл үүсгэхэд иргэний үнэмлэх эсвэл бизнесийн бүртгэлийн мэдээлэл нэмж шаардагдана. Дэмжлэг хийхэд төлбөрийн карт эсвэл банкны мэдээлэл цуглуулагдана — энэ нь PCI DSS стандартын дагуу шифрлэгдэн хадгалагдана.",
      },
      {
        subtitle: "Автоматаар цуглуулагдах мэдээлэл",
        text: "IP хаяг, браузерийн төрөл, үзсэн хуудас, платформд зарцуулсан цаг, төхөөрөмжийн мэдээлэл автоматаар бүртгэгдэнэ. Энэ мэдээллийг платформын гүйцэтгэлийг сайжруулах, хэрэглэгчийн туршлагыг тохируулахад ашигладаг.",
      },
    ],
  },
  {
    Icon: Lock,
    id: "usage",
    title: "2. Мэдээллийг хэрхэн ашигладаг вэ?",
    content: [
      {
        subtitle: "Үйлчилгээ үзүүлэх",
        text: "Таны мэдээллийг платформын үндсэн үйл ажиллагааг — бүртгэл, төлбөр, мэдэгдэл — хэвийн явуулахад ашигладаг. Гуравдагч талд зардаггүй, борлуулдаггүй.",
      },
      {
        subtitle: "Холбоо барих",
        text: "Таны төсөл болон хандивтай холбоотой мэдэгдэл, платформын шинэчлэл, аюулгүй байдлын мэдэгдлийг и-мэйл эсвэл утсаар хүргэнэ. Маркетингийн мэйл хүлээн авахаас татгалзах боломжтой.",
      },
    ],
  },
  {
    Icon: Shield,
    id: "protection",
    title: "3. Мэдээллийн аюулгүй байдал",
    content: [
      {
        subtitle: "Техникийн хамгаалалт",
        text: "Бүх өгөгдөл TLS 1.3 шифрлэлтээр дамждаг. Нууц үг bcrypt алгоритмаар хэшлэгддэг. Төлбөрийн мэдээлэл нь Stripe болон PCI DSS баталгаажсан гуравдагч тал дахь тусгаарлагдсан орчинд хадгалагддаг.",
      },
      {
        subtitle: "Хандалтын хяналт",
        text: "Таны мэдээлэлд хандах эрхтэй ажилтнуудын тоог хязгаарлана. Бүх хандалтыг бүртгэж, хянадаг. Ямар нэг хэвийн бус хандалтыг автоматаар илрүүлэх системтэй.",
      },
    ],
  },
  {
    Icon: UserCheck,
    id: "rights",
    title: "4. Таны эрхүүд",
    content: [
      {
        subtitle: "Хандах & засах",
        text: "Та профайлын тохиргооноос хувийн мэдээллээ үзэж, засах боломжтой. Хуулийн дагуу таны мэдээллийг өгч буй зорилгоор нь хадгалж болох — жишээ нь санхүүгийн бүртгэл.",
      },
      {
        subtitle: "Устгах & хязгаарлах",
        text: "Та хэдийд ч бүртгэлээ устгах хүсэлт гаргах боломжтой. Хүсэлтийг 30 хоногийн дотор биелүүлнэ. Идэвхтэй санхүүгийн гүйлгээтэй холбоотой мэдээлэл хуулийн шаардлагаас хамааран хугацааны туршид хадгалагдаж болно.",
      },
    ],
  },
  {
    Icon: RefreshCw,
    id: "updates",
    title: "5. Бодлогын шинэчлэл",
    content: [
      {
        subtitle: "Мэдэгдэх журам",
        text: "Энэхүү бодлого шинэчлэгдэх тохиолдолд хэрэглэгчдэд и-мэйлээр болон платформд мэдэгдэл явуулна. Томоохон өөрчлөлтийн хувьд та бодлогыг дахин зөвшөөрч баталгаажуулах шаардлагатай болно.",
      },
      {
        subtitle: "Анхны хэрэгжилт",
        text: "Энэхүү нууцлалын бодлого 2026 оны 1-р сарын 1-нээс хэрэгжиж эхэлсэн. Хамгийн сүүлийн шинэчлэл: 2026 оны 5-р сарын 1.",
      },
    ],
  },
  {
    Icon: Trash2,
    id: "cookies",
    title: "6. Күүки (Cookies) ашиглалт",
    content: [
      {
        subtitle: "Шаардлагатай күүки",
        text: "Нэвтрэлт, аюулгүй байдлын зорилгоор зайлшгүй шаардлагатай күүкиг ашиглана. Эдгээрийг унтраах нь платформын ажиллагааг зогсооно.",
      },
      {
        subtitle: "Аналитик күүки",
        text: "Хэрэглэгчийн туршлагыг сайжруулах зорилгоор хэрхэн ашиглагдаж буйг хэмжих аналитик күүки ашиглана. Та аналитик күүкиг браузерийн тохиргооноос унтраах боломжтой.",
      },
    ],
  },
];

export default function PrivacyPage() {
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
              Хууль эрх зүй
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4 leading-tight tracking-tight">
              Нууцлалын бодлого
            </h1>
            <p className="text-white/70 text-base">
              Хамгийн сүүлийн шинэчлэл: 2026 оны 5-р сарын 1 &nbsp;·&nbsp; Хэрэгжилт: 2026 оны 1-р сарын 1
            </p>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="max-w-4xl mx-auto">

            {/* Intro */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10">
              <p className="text-blue-800 text-sm leading-relaxed">
                <strong>Товч агуулга:</strong> crowdfund.mn нь таны мэдээллийг гуравдагч талд зардаггүй,
                борлуулдаггүй. Таны мэдээллийг зөвхөн платформын үйлчилгээ үзүүлэх зорилгоор ашигладаг.
                Та хэдийд ч мэдээллээ устгах, засах эрхтэй. Дэлгэрэнгүй доороос уншина уу.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {SECTIONS.map(({ Icon, id, title, content }) => (
                <div key={id} className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="font-display font-bold text-lg text-slate-900">{title}</h2>
                  </div>
                  <div className="space-y-5">
                    {content.map((c) => (
                      <div key={c.subtitle}>
                        <h3 className="font-semibold text-slate-800 text-sm mb-2">{c.subtitle}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-10 bg-slate-900 rounded-2xl p-8 text-center">
              <p className="text-white font-semibold mb-2">Асуулт байна уу?</p>
              <p className="text-slate-400 text-sm mb-4">
                Нууцлалын асуудлаар{" "}
                <a href="mailto:privacy@crowdfund.mn" className="text-blue-400 hover:text-blue-300 underline">
                  privacy@crowdfund.mn
                </a>{" "}
                хаягаар холбоо барина уу.
              </p>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}
