const TRUST_PILLARS = [
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Баталгаажсан бүртгэл",
    description:
      "Бүх төслийн зохиогчид иргэний үнэмлэх болон банкны данс баталгаажуулалтаар нэвтэрдэг. Танихгүй хүмүүст мөнгөөр дэмжих эрсдэлгүй.",
    highlight: "KYC баталгаажуулалт",
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
      </svg>
    ),
    title: "Escrow буюу хамгаалалттай мөнгө",
    description:
      "Таны дэмжлэг нь зорилтот дүн хүрэхэд л зохиогчид шилждэг. Амжилтгүй болбол мөнгийг 100% буцааж авна. Crowdfund.mn хоосон амлалтаас хамгаална.",
    highlight: "Зорилт хүрэхэд л төлнө",
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Бүрэн ил тод тайлан",
    description:
      "Хандив бүр хаана зарцуулагдсаныг зохиогч бодит цаг хугацаанд мэдээлдэг. Санхүүгийн тайлан, гэрэл зураг, видео нотолгоогоор баталгаажуулсан шинэчлэл.",
    highlight: "Бодит цагийн шинэчлэл",
  },
];

export function TrustSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container-page">
        <div className="text-center mb-14">
          <p className="text-blue-700 font-semibold text-sm uppercase tracking-widest mb-2">
            Яагаад Crowdfund.mn вэ?
          </p>
          <h2 className="section-heading mb-3">
            Итгэлцэл бол бидний суурь
          </h2>
          <p className="text-slate-500 text-base max-w-2xl mx-auto">
            Монголчуудын мөнгийг хүндэтгэн, хариуцлагатай, ил тод системээр
            зохиогч болон дэмжигчийн хооронд гүүр болдог.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TRUST_PILLARS.map((pillar, i) => (
            <div
              key={i}
              className="relative group flex flex-col p-8 rounded-3xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon circle */}
              <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-105 transition-transform duration-200">
                {pillar.icon}
              </div>

              {/* Highlight badge */}
              <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 mb-4">
                ✓ {pillar.highlight}
              </span>

              <h3 className="font-display font-bold text-slate-900 text-lg mb-3">
                {pillar.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {pillar.description}
              </p>

              {/* Corner accent */}
              <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-blue-200 group-hover:bg-blue-500 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Payment trust bar */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-50 border border-slate-100">
          <p className="text-center text-slate-500 text-sm font-medium mb-6 uppercase tracking-widest">
            Манай төлбөрийн системүүд
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* QPay */}
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-6 h-6 rounded bg-blue-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">Q</span>
              </div>
              <span className="font-bold text-slate-700 text-sm">QPay</span>
            </div>

            {/* SocialPay */}
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-6 h-6 rounded bg-green-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="font-bold text-slate-700 text-sm">SocialPay</span>
            </div>

            {/* Visa / MasterCard placeholder */}
            <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="font-bold text-blue-700 text-sm italic">VISA</span>
              <span className="text-slate-300">|</span>
              <span className="font-bold text-orange-500 text-xs">
                <span className="text-red-500">●</span>
                <span className="text-orange-400 -ml-1">●</span>{" "}
                Mastercard
              </span>
            </div>

            {/* SSL badge */}
            <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-green-700 text-sm">256-bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
