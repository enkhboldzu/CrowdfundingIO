const STEPS = [
  {
    step: "01",
    icon: "💡",
    title: "Санаагаа тодорхойлно",
    description:
      "Зорилго, баг, төсөв, эрсдэлээ нэг дор бичиж дэмжигчдэд ойлгомжтой танилцуулна.",
  },
  {
    step: "02",
    icon: "🚀",
    title: "Хянуулаад нийтэлнэ",
    description:
      "Админ баг мэдээллийг шалгаад баталсны дараа төсөл олон нийтэд нээлттэй харагдана.",
  },
  {
    step: "03",
    icon: "❤️",
    title: "Дэмжлэгээ авна",
    description:
      "Дэмжигчид QPay-аар төлж, төлбөр баталгаажмагц төслийн дүнд автоматаар нэмэгдэнэ.",
  },
  {
    step: "04",
    icon: "🎉",
    title: "Амлалтаа биелүүлнэ",
    description:
      "Санхүүжилтээ авсны дараа явцаа шинэчилж, дэмжигчдэдээ амласан үр дүнгээ хүргэнэ.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 gradient-brand-hero relative overflow-hidden">
      {/* subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container-page relative z-10">
        <div className="text-center mb-14">
          <p className="text-blue-200 font-semibold text-sm uppercase tracking-widest mb-2">
            Хэрхэн ажилладаг
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight mb-3">
            Санаанаас санхүүжилт хүртэл 4 алхам
          </h2>
          <p className="text-blue-200 text-base max-w-xl mx-auto">
            Бүтээгчид ойлгомжтой танилцуулж, дэмжигчид итгэлтэй шийдвэр гаргана.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.step} className="relative flex flex-col">
              {/* Connector line (desktop only) */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="hidden lg:block absolute top-10 left-[calc(100%-24px)] w-full h-px border-t-2 border-dashed border-blue-400/40 z-0"
                />
              )}

              <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/15 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-black border-2 border-white/20 shadow">
                    {step.step}
                  </span>
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <h3 className="font-display font-bold text-white text-base">
                  {step.title}
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
