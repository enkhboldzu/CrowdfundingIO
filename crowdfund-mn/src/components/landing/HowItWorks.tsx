"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = [
  {
    step: "01",
    emoji: "💡",
    title: "Санаагаа тодорхойлно",
    description:
      "Зорилго, баг, төсөв, эрсдэлээ нэг дор бичиж дэмжигчдэд ойлгомжтой танилцуулна.",
  },
  {
    step: "02",
    emoji: "🚀",
    title: "Хянуулаад нийтэлнэ",
    description:
      "Админ баг мэдээллийг шалгаад баталсны дараа төсөл олон нийтэд нээлттэй харагдана.",
  },
  {
    step: "03",
    emoji: "❤️",
    title: "Дэмжлэгээ авна",
    description:
      "Дэмжигчид QPay-аар төлж, төлбөр баталгаажмагц төслийн дүнд автоматаар нэмэгдэнэ.",
  },
  {
    step: "04",
    emoji: "🎉",
    title: "Амлалтаа биелүүлнэ",
    description:
      "Санхүүжилтээ авсны дараа явцаа шинэчилж, дэмжигчдэдээ амласан үр дүнгээ хүргэнэ.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
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
            Хэрхэн ажилладаг
          </p>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
            Санаанаас санхүүжилт хүртэл<br />
            <span className="text-blue-800">4 алхам</span>
          </h2>
        </motion.div>

        {/* ── Steps ── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
              }}
              className="relative group"
            >
              {/* Connector line (desktop only, not last) */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="hidden lg:block absolute top-5 left-[calc(100%+12px)] w-[calc(100%-24px)] h-px border-t border-dashed border-gray-200 z-0"
                />
              )}

              <div className="relative z-10 flex flex-col h-full border border-gray-200 rounded-2xl p-6 bg-white group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all duration-300">

                {/* Step number */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display font-black text-3xl text-gray-100 leading-none select-none">
                    {step.step}
                  </span>
                  <span className="text-2xl" role="img" aria-label={step.title}>
                    {step.emoji}
                  </span>
                </div>

                <h3 className="font-display font-bold text-gray-950 text-[15px] mb-2.5 leading-snug">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
