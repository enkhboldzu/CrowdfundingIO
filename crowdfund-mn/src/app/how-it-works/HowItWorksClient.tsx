"use client";

import { useState } from "react";
import Link from "next/link";
import { GuardedLink } from "@/components/ui/GuardedLink";
import { Footer } from "@/components/landing/Footer";
import { cn } from "@/lib/utils";

/* ─── Crowdfunding Illustration ────────────────────────────────── */

function CrowdfundingIllustration() {
  return (
    <svg
      viewBox="0 0 480 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-lg mx-auto"
      aria-hidden
    >
      {/* ── Background blobs ── */}
      <ellipse cx="240" cy="110" rx="200" ry="90" fill="white" fillOpacity="0.06" />

      {/* ── Backer 1 (top-left) ── */}
      <circle cx="52" cy="64" r="22" fill="white" fillOpacity="0.15" />
      <circle cx="52" cy="58" r="8" fill="white" fillOpacity="0.7" />
      <ellipse cx="52" cy="74" rx="12" ry="6" fill="white" fillOpacity="0.5" />
      {/* money badge */}
      <circle cx="69" cy="49" r="9" fill="#34D399" />
      <text x="69" y="53" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">₮</text>

      {/* ── Backer 2 (mid-left) ── */}
      <circle cx="44" cy="118" r="22" fill="white" fillOpacity="0.15" />
      <circle cx="44" cy="112" r="8" fill="white" fillOpacity="0.7" />
      <ellipse cx="44" cy="128" rx="12" ry="6" fill="white" fillOpacity="0.5" />
      <circle cx="61" cy="103" r="9" fill="#34D399" />
      <text x="61" y="107" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">₮</text>

      {/* ── Backer 3 (bottom-left) ── */}
      <circle cx="60" cy="172" r="22" fill="white" fillOpacity="0.15" />
      <circle cx="60" cy="166" r="8" fill="white" fillOpacity="0.7" />
      <ellipse cx="60" cy="182" rx="12" ry="6" fill="white" fillOpacity="0.5" />
      <circle cx="77" cy="157" r="9" fill="#34D399" />
      <text x="77" y="161" textAnchor="middle" fontSize="9" fill="white" fontWeight="700">₮</text>

      {/* ── Flow lines from backers to project card ── */}
      <path d="M74 72 Q130 80 148 100" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M66 118 Q130 115 148 110" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M82 168 Q130 145 148 122" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="4 3" />

      {/* ── Project card (center) ── */}
      <rect x="148" y="50" width="156" height="118" rx="14" fill="white" />
      <rect x="148" y="50" width="156" height="118" rx="14" stroke="white" strokeOpacity="0.3" />

      {/* Card header */}
      <rect x="148" y="50" width="156" height="36" rx="14" fill="#1E40AF" />
      <rect x="148" y="70" width="156" height="16" fill="#1E40AF" />
      <text x="226" y="72" textAnchor="middle" fontSize="10" fill="white" fontWeight="700" letterSpacing="0.5">МОНГОЛ AI ТУСЛАГЧ</text>

      {/* Thumbnail placeholder */}
      <rect x="162" y="95" width="36" height="28" rx="6" fill="#DBEAFE" />
      <circle cx="180" cy="106" r="5" fill="#93C5FD" />
      <path d="M171 117 Q180 110 189 117" stroke="#93C5FD" strokeWidth="1.5" fill="none" />

      {/* Stats */}
      <text x="206" y="104" fontSize="8.5" fill="#1E40AF" fontWeight="700">₮ 24,500,000</text>
      <text x="206" y="116" fontSize="7.5" fill="#94A3B8">зорилго: ₮30,000,000</text>

      {/* Progress bar track */}
      <rect x="162" y="134" width="128" height="7" rx="3.5" fill="#F1F5F9" />
      {/* Progress bar fill */}
      <rect x="162" y="134" width="93" height="7" rx="3.5" fill="#1E40AF" />
      {/* Progress label */}
      <text x="293" y="141" fontSize="7" fill="#1E40AF" fontWeight="700">82%</text>

      {/* Meta row */}
      <circle cx="168" cy="158" r="3" fill="#34D399" />
      <text x="175" y="161" fontSize="7.5" fill="#64748B">142 дэмжигч</text>
      <text x="255" y="161" fontSize="7.5" fill="#94A3B8">8 өдөр үлдсэн</text>

      {/* ── Arrow from card to trophy ── */}
      <path d="M304 111 L338 111" stroke="#86EFAC" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M332 106 L340 111 L332 116" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* ── Trophy circle (right) ── */}
      <circle cx="390" cy="111" r="42" fill="white" fillOpacity="0.12" />
      <circle cx="390" cy="111" r="30" fill="#D1FAE5" />
      {/* Trophy icon */}
      <path d="M383 96 L397 96 L397 107 C397 113.627 393.627 117 387 117 C380.373 117 377 113.627 377 107 L383 96Z"
        stroke="#065F46" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M383 96 C383 96 380 93 378 96 C376 99 378 103 383 104"
        stroke="#065F46" strokeWidth="1.5" fill="none" />
      <path d="M397 96 C397 96 400 93 402 96 C404 99 402 103 397 104"
        stroke="#065F46" strokeWidth="1.5" fill="none" />
      <path d="M384 117 L384 122 L396 122 L396 117" stroke="#065F46" strokeWidth="1.5" fill="none" />
      <path d="M381 122 L399 122" stroke="#065F46" strokeWidth="1.5" strokeLinecap="round" />
      {/* checkmark badge */}
      <circle cx="407" cy="88" r="10" fill="#10B981" />
      <path d="M402 88 L406 92 L413 84" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* ── Floating particles ── */}
      <circle cx="130" cy="44" r="4" fill="white" fillOpacity="0.2" />
      <circle cx="350" cy="44" r="3" fill="white" fillOpacity="0.2" />
      <circle cx="440" cy="80" r="5" fill="white" fillOpacity="0.15" />
      <circle cx="430" cy="155" r="3" fill="white" fillOpacity="0.2" />
      <circle cx="108" cy="195" r="4" fill="white" fillOpacity="0.15" />
    </svg>
  );
}

/* ─── SVG icons ─────────────────────────────────────────────────── */

function IconSend({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function IconClipboardCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
    </svg>
  );
}

function IconBanknotes({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  );
}

function IconTrophy({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
    </svg>
  );
}

function IconCompass({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function IconGift({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 2.25a2.625 2.625 0 000 2.625zm4.5 0A2.625 2.625 0 1014.25 2.25 2.625 2.625 0 0016.5 4.875zM7.5 4.875A2.625 2.625 0 109.75 2.25 2.625 2.625 0 007.5 4.875zm-1.5 0h12M3.375 4.875h17.25a1.875 1.875 0 010 3.75H3.375a1.875 1.875 0 010-3.75zM12 4.875v14.625" />
    </svg>
  );
}

function IconShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconHeadphones({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

/* ─── Step data (4 per flow) ────────────────────────────────────── */

const CREATOR_STEPS = [
  {
    num: 1,
    title: "Төслөө илгээх",
    desc: "Төслийнхөө зорилго, санхүүжилтийн хэмжээ, хугацаа болон дэлгэрэнгүй тайлбарыг оруулна. Зураг, видео материал хавсаргаж болно.",
    icon: <IconSend className="w-5 h-5" />,
    badge: "Алхам 1",
    tip: "Видеотой төслүүд 85% илүү дэмжлэг авдаг.",
  },
  {
    num: 2,
    title: "Хянуулах",
    desc: "Манай мэргэжилтнүүд 48 цагийн дотор таны төслийг хянана. Шаардлагатай бол нэмэлт мэдээлэл гуйна. Бүх шатанд мэдэгдэл очно.",
    icon: <IconClipboardCheck className="w-5 h-5" />,
    badge: "Алхам 2",
    tip: "Бүрэн бичиг баримт хянах хугацааг 24 цаг болгодог.",
  },
  {
    num: 3,
    title: "Санхүүжилт цуглуулах",
    desc: "Зөвшөөрөл авсан төсөл нийтлэгдэж, дэмжигчид идэвхтэй хандаж эхэлнэ. Бодит цагт хэр их цуглуулсаныг хянах боломжтой.",
    icon: <IconBanknotes className="w-5 h-5" />,
    badge: "Алхам 3",
    tip: "Эхний 48 цагт идэвхтэй сурталчилснаар зорилгынхоо 40%-д хүрнэ.",
  },
  {
    num: 4,
    title: "Зорилгодоо хүрэх",
    desc: "Зорилго биелсэн тохиолдолд Эскроу дансаас санхүүжилтийг ажлын 5 өдрийн дотор шилжүүлнэ. Платформын хөлс 5% байна.",
    icon: <IconTrophy className="w-5 h-5" />,
    badge: "Алхам 4",
    tip: "Амжилтгүй болсон бол дэмжигчдийн мөнгийг 100% буцааж өгнө.",
  },
];

const BACKER_STEPS = [
  {
    num: 1,
    title: "Төслөө сонгох",
    desc: "Ангилал, тренд, санхүүжилтийн хэмжээгээр шүүж бүх идэвхтэй төслүүдийг хайна. Таны сонирхолд нийцсэн төслийг олоорой.",
    icon: <IconCompass className="w-5 h-5" />,
    badge: "Алхам 1",
    tip: "Ангиллаар шүүж хандлагатай төслүүдийг хурдан олоорой.",
  },
  {
    num: 2,
    title: "Урамшууллаа сонгох",
    desc: "Танд хамгийн таарамжтай дэмжлэгийн хэмжээ болон шагналын давхаргыг сонгоно. ₮5,000-аас эхлэн дэмжих боломжтой.",
    icon: <IconGift className="w-5 h-5" />,
    badge: "Алхам 2",
    tip: "Хязгаарлагдмал давхаргуудыг эртхэн сонгож авах нь давуу тал болдог.",
  },
  {
    num: 3,
    title: "Дэмжих",
    desc: "Эхний хувилбарт QPay-аар 256-бит SSL шифрлэлттэй баталгаат системээр аюулгүйгээр дэмжлэгийн мөнгөө шилжүүлнэ.",
    icon: <IconShieldCheck className="w-5 h-5" />,
    badge: "Алхам 3",
    tip: "Мөнгийг Эскроу данс хадгалдаг — зорилго биелэхгүй бол автоматаар буцаагдана.",
  },
  {
    num: 4,
    title: "Бэлэг хүлээн авах",
    desc: "Кампанит ажил амжилттай болсны дараа тохирсон хугацааны дотор шагналаа хүлээн авна. Бүтээгч нь хүргэлтийн мэдэгдэл илгээнэ.",
    icon: <IconGift className="w-5 h-5" />,
    badge: "Алхам 4",
    tip: "Шагналаа авсны дараа сэтгэгдэл үлдээж туршлагаа хуваалцаарай.",
  },
];

/* ─── Feature cards (3) ─────────────────────────────────────────── */

const FEATURE_CARDS = [
  {
    icon:    <IconShieldCheck className="w-6 h-6 text-emerald-600" />,
    iconBg:  "bg-emerald-50",
    iconRing: "ring-emerald-100",
    accent:  "border-emerald-200 hover:border-emerald-300",
    label:   "Аюулгүй байдал",
    title:   "Найдвартай байдал",
    desc:    "Эскроу систем болон KYC баталгаажуулалтаар дэмжигчдийн мөнгийг бүрэн хамгаална. Зорилго биелэхгүй бол 100% автоматаар буцааж өгнө.",
    stats:   [{ value: "100%", label: "Буцаах баталгаа" }, { value: "KYC", label: "Биеийн баталгаа" }],
  },
  {
    icon:    <IconEye className="w-6 h-6 text-blue-600" />,
    iconBg:  "bg-blue-50",
    iconRing: "ring-blue-100",
    accent:  "border-blue-200 hover:border-blue-300",
    label:   "Нээлт тод байдал",
    title:   "Шилэн хяналт",
    desc:    "Бүх санхүүгийн хөдөлгөөн дэмжигчдэд бодит цагт нээлттэй харагдана. Хэдэн дэмжигч, яг хэр их мөнгийг яг одоо мэдэх боломжтой.",
    stats:   [{ value: "Live", label: "Бодит цагт" }, { value: "256-bit", label: "SSL шифрлэлт" }],
  },
  {
    icon:    <IconHeadphones className="w-6 h-6 text-violet-600" />,
    iconBg:  "bg-violet-50",
    iconRing: "ring-violet-100",
    accent:  "border-violet-200 hover:border-violet-300",
    label:   "Тусламжийн баг",
    title:   "24/7 Тусламж",
    desc:    "Манай мэргэжлийн дэмжлэгийн баг цагийн зурвасаас үл хамааран таны асуултад хариу өгөхөд бэлэн. Монгол хэлний тусгай дэмжлэг.",
    stats:   [{ value: "24/7", label: "Тасралтгүй" }, { value: "48h", label: "KYC хугацаа" }],
  },
];

/* ─── FAQ data ──────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "Зорилго биелэхгүй бол юу болох вэ?",
    a: "Crowdfund.mn нь 'All-or-Nothing' загварыг ашигладаг. Кампанит ажил тавигдсан хугацааны дотор зорилгодоо хүрэхгүй тохиолдолд бүх дэмжигчдийн мөнгийг 100% буцааж олгоно. Нэг ч төгрөг суутгагдахгүй.",
  },
  {
    q: "Платформ хэдэн хувийн хөлс авдаг вэ?",
    a: "Амжилттай кампанит ажлаас нийт санхүүжилтийн 5%-ийг платформын үйлчилгээний хөлс болгон суутгана. Амжилтгүй болсон тохиолдолд ямар ч хөлс авахгүй.",
  },
  {
    q: "KYC баталгаажуулалт хэр удаан явагддаг вэ?",
    a: "Ажлын 1-2 өдрийн дотор KYC баталгаажуулалтын хариуг өгнө. Шаардлагатай баримт бичиг: иргэний үнэмлэхийн урд, арын зураг болон нүүр царайтай зельфи зураг.",
  },
  {
    q: "Ямар төлбөрийн хэлбэрүүдийг дэмждэг вэ?",
    a: "Одоогоор зөвхөн QPay төлбөрийг дэмжиж байна. Бүх гүйлгээ нь 256-бит SSL шифрлэлтээр хамгаалагдсан.",
  },
  {
    q: "Хамгийн бага санхүүжилтийн зорилго хэд байж болох вэ?",
    a: "Хамгийн бага зорилго ₮10 байна. Дээд хязгаар байхгүй. Бодитой, хүрч болохуйц зорилго тавихыг зөвлөдөг — хэт өндөр зорилго биелэхгүй байх эрсдэлийг нэмэгдүүлдэг.",
  },
];

/* ─── Main component ────────────────────────────────────────────── */

export function HowItWorksClient() {
  const [tab,     setTab]     = useState<"creator" | "backer">("creator");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps       = tab === "creator" ? CREATOR_STEPS : BACKER_STEPS;
  const isCreator   = tab === "creator";
  const accentBg    = isCreator ? "bg-blue-800"   : "bg-indigo-700";
  const accentText  = isCreator ? "text-blue-600"  : "text-indigo-600";
  const accentLight = isCreator ? "bg-blue-50 border-blue-100"  : "bg-indigo-50 border-indigo-100";
  const iconBg      = isCreator ? "bg-blue-50"    : "bg-indigo-50";
  const iconText    = isCreator ? "text-blue-700"  : "text-indigo-700";
  const connectorBg = isCreator ? "bg-blue-100"   : "bg-indigo-100";

  return (
    <>
      <main>

        {/* ══ HERO ════════════════════════════════════════════ */}
        <section className="gradient-brand-hero pt-24 pb-0 relative overflow-hidden">
          {/* decorative blobs */}
          <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)" }} />
          <div aria-hidden className="absolute -bottom-24 left-1/4 w-96 h-64 opacity-10"
            style={{ background: "radial-gradient(ellipse, #60A5FA, transparent 70%)" }} />
          {/* grid */}
          <div aria-hidden className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

          <div className="container-page relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

              {/* Left: text */}
              <div className="flex-1 text-center lg:text-left pt-4 pb-8 lg:pb-14">
                <p className="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-4">
                  Процесс & Гарын авлага
                </p>
                <h1 className="font-display font-bold text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-5">
                  Хэрхэн ажилладаг вэ?
                </h1>
                <p className="text-white/65 text-base sm:text-lg max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
                  Монгол дахь хамгийн найдвартай краудфандинг платформыг ашиглах нь ердөө 4 алхамтай.
                </p>

                {/* Tab switcher */}
                <div className="inline-flex p-1.5 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl">
                  <button
                    onClick={() => setTab("creator")}
                    className={cn(
                      "px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                      tab === "creator"
                        ? "bg-white text-blue-800 shadow-md"
                        : "text-white/70 hover:text-white"
                    )}
                  >
                    Төсөл эхлүүлэгчдэд
                  </button>
                  <button
                    onClick={() => setTab("backer")}
                    className={cn(
                      "px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                      tab === "backer"
                        ? "bg-white text-indigo-800 shadow-md"
                        : "text-white/70 hover:text-white"
                    )}
                  >
                    Дэмжигчдэд
                  </button>
                </div>
              </div>

              {/* Right: SVG illustration */}
              <div className="flex-1 w-full max-w-lg lg:max-w-none lg:pb-0 pb-0 -mb-1">
                <CrowdfundingIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* ══ STEPS — vertical timeline ═══════════════════════ */}
        <section className="bg-white py-16 sm:py-20">
          <div className="container-page">

            {/* Section heading */}
            <div className="text-center mb-12 sm:mb-14">
              <p className={cn("font-semibold text-sm uppercase tracking-widest mb-2", accentText)}>
                {isCreator ? "Бүтээгчдэд зориулсан замнал" : "Дэмжигчдэд зориулсан замнал"}
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
                {isCreator ? "Төслөө амжилтанд хүргэх 4 алхам" : "Анхны дэмжлэгээ өгөх 4 алхам"}
              </h2>
            </div>

            {/* Steps grid — key forces remount on tab switch → triggers animations */}
            <div key={tab} className="max-w-2xl mx-auto">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="flex gap-5 sm:gap-7 animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    {/* Number circle */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0 ring-4 ring-white z-10",
                      accentBg
                    )}>
                      {step.num}
                    </div>
                    {/* Connector line */}
                    {i < steps.length - 1 && (
                      <div className={cn("w-0.5 flex-1 mt-2", connectorBg)} style={{ minHeight: "2rem" }} />
                    )}
                  </div>

                  {/* Step card */}
                  <div className={cn("flex-1 pb-8", i === steps.length - 1 && "pb-0")}>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-4">
                        {/* Icon box */}
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          iconBg, iconText
                        )}>
                          {step.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Badge + title */}
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                              isCreator ? "bg-blue-50 text-blue-600" : "bg-indigo-50 text-indigo-600"
                            )}>
                              {step.badge}
                            </span>
                            <h3 className="font-bold text-slate-900 text-base leading-snug">
                              {step.title}
                            </h3>
                          </div>

                          {/* Description */}
                          <p className="text-slate-500 text-sm leading-relaxed mb-2.5">
                            {step.desc}
                          </p>

                          {/* Tip */}
                          <p className={cn("text-xs font-medium leading-relaxed", accentText)}>
                            💡 {step.tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tab CTA strip */}
            <div className={cn(
              "mt-12 max-w-2xl mx-auto rounded-2xl p-6 sm:p-7 border flex flex-col sm:flex-row items-center justify-between gap-5",
              accentLight
            )}>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1">
                  {isCreator ? "Анхны алхмаа хийхэд бэлэн үү?" : "Дэмжих төсөл хайхад бэлэн үү?"}
                </h3>
                <p className="text-slate-500 text-sm">
                  {isCreator
                    ? "Бүртгэл үүсгэх нь үнэ төлбөргүй. Зөвхөн амжилттай болоход л хөлс авна."
                    : "Аюулгүй, баталгаатай дэмжлэгийн системийг ашиглаарай."}
                </p>
              </div>
              {isCreator ? (
                <GuardedLink
                  href="/create-project"
                  className="flex-shrink-0 inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-colors duration-200 whitespace-nowrap text-white shadow-cta bg-blue-800 hover:bg-blue-900"
                >
                  Төсөл эхлэх →
                </GuardedLink>
              ) : (
                <Link
                  href="/explore"
                  className="flex-shrink-0 inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-colors duration-200 whitespace-nowrap text-white shadow-cta bg-indigo-700 hover:bg-indigo-800"
                >
                  Төслүүд харах →
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ══ FEATURE CARDS (3) ═══════════════════════════════ */}
        <section className="bg-slate-50 py-16 sm:py-20 border-t border-slate-100">
          <div className="container-page">
            <div className="text-center mb-12">
              <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">
                Яагаад бидийг сонгох вэ
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
                Таны мөнгийг бид хамгаална
              </h2>
              <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
                Монголын санхүүгийн зохицуулах хороонд бүртгэлтэй бөгөөд банкны стандартад нийцсэн аюулгүй байдлын арга хэмжээг хэрэгжүүлдэг.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURE_CARDS.map((card, i) => (
                <div
                  key={card.title}
                  className={cn(
                    "bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-up",
                    card.accent
                  )}
                  style={{ animationDelay: `${i * 0.12}s`, animationFillMode: "both" }}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ring-1",
                    card.iconBg, card.iconRing
                  )}>
                    {card.icon}
                  </div>

                  {/* Label */}
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-200 px-2.5 py-0.5 rounded-full mb-3">
                    {card.label}
                  </span>

                  <h3 className="font-bold text-slate-900 text-lg mb-2">{card.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{card.desc}</p>

                  {/* Stats */}
                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    {card.stats.map(s => (
                      <div key={s.label}>
                        <div className="font-display font-bold text-base text-slate-900">{s.value}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Verification strip */}
            <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Монголын ЗХХ-д бүртгэлтэй</div>
                    <div className="text-slate-400 text-xs">Хуулийн дагуу зохицуулагддаг</div>
                  </div>
                </div>

                <div className="hidden sm:block w-px h-10 bg-slate-200" />

                <div className="grid grid-cols-3 gap-4 flex-1 text-center">
                  {[
                    { value: "256-bit", label: "SSL шифрлэлт" },
                    { value: "48h",     label: "KYC хянах хугацаа" },
                    { value: "100%",    label: "Буцаах баталгаа" },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="font-display font-bold text-lg sm:text-xl text-blue-800">{s.value}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ FAQ ══════════════════════════════════════════════ */}
        <section className="bg-white py-16 sm:py-20">
          <div className="container-page">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
                  Түгээмэл асуултууд
                </p>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
                  Асуулт байна уу?
                </h2>
                <p className="text-slate-500 text-base leading-relaxed">
                  Манай дэмжлэгийн баг ажлын 24 цагийн дотор хариу өгнө.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {FAQ_ITEMS.map((faq, i) => (
                  <div key={i} className={cn("border-b border-slate-100", i === FAQ_ITEMS.length - 1 && "border-0")}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors duration-150"
                    >
                      <span className="font-semibold text-slate-900 text-sm sm:text-base pr-4 leading-snug">
                        {faq.q}
                      </span>
                      <div className={cn(
                        "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
                        openFaq === i
                          ? "bg-blue-800 text-white rotate-180"
                          : "bg-slate-100 text-slate-400"
                      )}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{ maxHeight: openFaq === i ? "300px" : "0px" }}
                    >
                      <p className="px-6 pb-6 text-slate-500 text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center text-slate-400 text-sm mt-8">
                Хариулт олдсонгүй?{" "}
                <Link href="/contact" className="text-blue-700 font-semibold hover:text-blue-900 transition-colors">
                  Манай дэмжлэгтэй холбогдоорой →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ══ CTA ═════════════════════════════════════════════ */}
        <section className="gradient-brand py-16 sm:py-20 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
          <div aria-hidden className="absolute -top-20 right-10 w-72 h-72 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)" }} />

          <div className="container-page relative z-10 text-center">
            <p className="text-blue-200 font-semibold text-sm uppercase tracking-widest mb-4">
              Өнөөдрөөс эхлэх цаг болжээ
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-5 text-balance">
              Таны санаа ирэх<br className="hidden sm:block" /> өдрийг хүлээхгүй
            </h2>
            <p className="text-white/65 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Олон мянган дэмжигч таны төслийг хүлээж байна.
              Бүртгэл үүсгэх нь бүрэн үнэ төлбөргүй.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GuardedLink
                href="/create-project"
                className="inline-flex items-center gap-2 bg-white text-blue-800 font-bold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-cta hover:bg-blue-50 transition-colors duration-200"
              >
                Төсөл эхлэх
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </GuardedLink>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white hover:border-white hover:bg-white/10 font-bold text-base sm:text-lg px-8 py-4 rounded-2xl transition-all duration-200"
              >
                Төслүүд харах
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
