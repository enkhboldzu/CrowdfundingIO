import type { Metadata } from "next";
import { FileText, AlertCircle, CheckCircle, XCircle, Scale, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Үйлчилгээний нөхцөл — Crowdfund.mn",
  description: "crowdfund.mn платформыг ашиглахтай холбоотой эрх, үүрэг, хариуцлагын нөхцөлүүд.",
};

const SECTIONS = [
  {
    Icon: FileText,
    id: "intro",
    title: "1. Нөхцөлийн хамрах хүрээ",
    content: [
      {
        subtitle: "Хэрэглэгдэх хүрээ",
        text: "Эдгээр нөхцөл нь crowdfund.mn платформ (цаашид 'Платформ' гэх) болон холбогдох бүх үйлчилгээнд хамаарна. Платформыг ашигласнаар та эдгээр нөхцөлийг бүрэн хүлээн зөвшөөрч байна гэж үзнэ. Зөвшөөрөхгүй бол платформыг ашиглахаа зогсооно уу.",
      },
      {
        subtitle: "Насны шаардлага",
        text: "Платформыг ашиглах хэрэглэгч 16 нас хүрсэн байх шаардлагатай. 16-18 насны хэрэглэгч эцэг эхийн зөвшөөрлөөр ашиглах боломжтой. Насанд хүрээгүй хэрэглэгчийн бүртгэл баримтлагдсан тохиолдолд устгагдана.",
      },
    ],
  },
  {
    Icon: CheckCircle,
    id: "user-rights",
    title: "2. Хэрэглэгчийн эрх, үүрэг",
    content: [
      {
        subtitle: "Хэрэглэгчийн эрх",
        text: "Та платформд бүртгүүлэх, зөвшөөрөгдсөн төслүүдийг дэмжих, өөрийн мэдээллийг засах, устгах, хандивын түүхээ харах эрхтэй. Манай дэмжлэгийн багтай холбоо барих, гомдол гаргах эрхтэй.",
      },
      {
        subtitle: "Хэрэглэгчийн үүрэг",
        text: "Та бодит мэдээлэл өгөх, бусад хэрэглэгчийн эрхийг хүндэтгэх, платформыг зохисгүй байдлаар ашиглахгүй байх үүрэгтэй. Бүртгэлийн нэвтрэх мэдээллийн аюулгүй байдлыг хариуцаж, алдагдсан тохиолдолд нэн даруй мэдэгдэнэ.",
      },
    ],
  },
  {
    Icon: AlertCircle,
    id: "creator-rules",
    title: "3. Төсөл эхлүүлэгчийн нөхцөл",
    content: [
      {
        subtitle: "Зөвшөөрөгдсөн контент",
        text: "Бодит, хуульд нийцсэн зорилготой төслүүд байж болно. Шагнал нь хандивтай тохирсон, хэрэгжих боломжтой байх ёстой. Кампанийн хугацаанд шинэчлэл тогтмол нийтлэх ёстой.",
      },
      {
        subtitle: "Хориглосон контент",
        text: "Хууран мэхлэх, худал мэдээлэл агуулсан, хуулиар хориглосон бараа/үйлчилгээтэй холбоотой, дэмжигчдэд хохирол учруулж болзошгүй аливаа төсөл зөвшөөрөхгүй. Ийм төслийг устгаж, эзэмшигчийн бүртгэлийг хаана.",
      },
    ],
  },
  {
    Icon: Scale,
    id: "payments",
    title: "4. Төлбөр, санхүүгийн нөхцөл",
    content: [
      {
        subtitle: "Шимтгэлийн бодлого",
        text: "Платформ нь амжилттай кампанийн нийт дүнгийн 5% платформын шимтгэл авна. Төлбөр боловсруулалтын 2.5% нь гуравдагч талын төлбөрийн систем (Stripe / QPay) дамжин тооцогдоно. Бүх шимтгэл нь кампани дуусахад суутгагдана.",
      },
      {
        subtitle: "Буцаалтын бодлого",
        text: "All-or-Nothing загварын дагуу зорилгодоо хүрч чадаагүй кампанийн дэмжигч нарт мөнгийг бүрэн буцаана. Амжилттай кампанийн хандив буцаан авах боломжгүй. Онцгой тохиолдолд манай баг тус бүрд нь шийдвэр гаргана.",
      },
    ],
  },
  {
    Icon: XCircle,
    id: "termination",
    title: "5. Бүртгэл хаах нөхцөл",
    content: [
      {
        subtitle: "Платформын эрх",
        text: "Нөхцөл зөрчсөн, хуурамч мэдээлэл оруулсан, платформ болон бусад хэрэглэгчдэд хохирол учруулсан тохиолдолд мэдэгдэлгүйгээр бүртгэлийг хаах эрхтэй. Ноцтой зөрчлийн тохиолдолд хуулийн байгууллагад шилжүүлнэ.",
      },
      {
        subtitle: "Хэрэглэгчийн эрх",
        text: "Та хэдийд ч бүртгэлээ хааж болно. Идэвхтэй кампанитай тохиолдолд эхлээд кампанийг хаасны дараа бүртгэл устгагдана. Санхүүгийн гүйлгээтэй холбоотой мэдээлэл хуулийн дагуу хадгалагдана.",
      },
    ],
  },
  {
    Icon: Clock,
    id: "amendments",
    title: "6. Нөхцөлийн өөрчлөлт",
    content: [
      {
        subtitle: "Өөрчлөлт оруулах эрх",
        text: "Crowdfund.mn эдгээр нөхцөлийг хэдийд ч өөрчлөх эрхтэй. Томоохон өөрчлөлтийн 14 хоногийн өмнө и-мэйлээр мэдэгдэл явуулна. Өөрчлөлтийн дараа платформыг үргэлжлүүлэн ашигласнаар шинэ нөхцөлийг зөвшөөрсөн гэж тооцогдоно.",
      },
      {
        subtitle: "Хэрэгжих хууль",
        text: "Энэхүү нөхцөл нь Монгол Улсын хуулийн дагуу зохицуулагдана. Маргаантай асуудлыг Монгол Улсын шүүхийн тогтолцоогоор шийдвэрлэнэ. Нөхцөл 2026 оны 1-р сарын 1-нээс хэрэгжинэ.",
      },
    ],
  },
];

export default function TermsPage() {
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
              Үйлчилгээний нөхцөл
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
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-10">
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>Анхаарал:</strong> Эдгээр нөхцөлийг платформыг ашиглахаасаа өмнө анхааралтай уншина уу.
                crowdfund.mn-ийг ашигласнаар та эдгээр бүх нөхцөлийг зөвшөөрч буй болно. Асуулт байвал{" "}
                <a href="mailto:legal@crowdfund.mn" className="text-amber-700 underline hover:text-amber-900">
                  legal@crowdfund.mn
                </a>{" "}
                хаягаар холбоо барина уу.
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
              <p className="text-white font-semibold mb-2">Хуулийн асуулт байна уу?</p>
              <p className="text-slate-400 text-sm">
                Үйлчилгээний нөхцөлтэй холбоотой асуудлаар{" "}
                <a href="mailto:legal@crowdfund.mn" className="text-blue-400 hover:text-blue-300 underline">
                  legal@crowdfund.mn
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
