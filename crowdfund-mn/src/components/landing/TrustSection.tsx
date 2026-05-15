"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PILLARS = [
  {
    index: "01",
    title: "Бүтээгчийн мэдээлэл тодорхой",
    description:
      "Төсөл бүр админаар шалгагдаж, зохиогчийн холбоо барих болон банкны мэдээлэл тулгагдсаны дараа нийтлэгдэнэ.",
    highlight: "Админ хяналт",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    index: "02",
    title: "Төлбөр баталгаажсаны дараа бүртгэнэ",
    description:
      "QPay төлбөр амжилттай баталгаажсаны дараа л дэмжлэг төслийн дүнд нэмэгдэнэ. Дэмжигч, дүн, төслийг хянах боломжтой.",
    highlight: "QPay баталгаажуулалт",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
      </svg>
    ),
  },
  {
    index: "03",
    title: "Ил тод явц",
    description:
      "Бүтээгч төсөл, зорилго, хөрөнгийн ашиглалт, баг, эрсдэлээ нэг дор бичдэг тул дэмжигч шийдвэрээ ойлгомжтой гаргана.",
    highlight: "Тодорхой мэдээлэл",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

export function TrustSection() {
  return (
    <section className="py-24 bg-gray-50/60 border-y border-gray-100">
      <div className="container-page">

        {/* ── Header ── */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">
            Яагаад Crowdfund.mn вэ?
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-950 tracking-tight leading-tight max-w-lg">
            Дэмжихээс өмнө<br /> <span className="text-blue-800">ойлгох мэдээлэл</span> нь бэлэн
          </h2>
        </motion.div>

        {/* ── Pillars ── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}
        >
          {PILLARS.map((pillar) => (
            <motion.div
              key={pillar.index}
              variants={{
                hidden: { opacity: 0, y: 16 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
              }}
              className="group relative flex flex-col p-8 bg-white hover:bg-gray-50/80 transition-colors duration-300"
            >
              {/* Step number + icon */}
              <div className="flex items-start justify-between mb-6">
                <span className="font-display font-black text-4xl text-gray-100 leading-none select-none">
                  {pillar.index}
                </span>
                <div className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 group-hover:border-blue-200 group-hover:text-blue-700 transition-colors duration-300">
                  {pillar.icon}
                </div>
              </div>

              {/* Highlight badge */}
              <span className="inline-flex w-fit items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full mb-4">
                ✓ {pillar.highlight}
              </span>

              <h3 className="font-display font-bold text-gray-950 text-base mb-2.5 leading-snug">
                {pillar.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
