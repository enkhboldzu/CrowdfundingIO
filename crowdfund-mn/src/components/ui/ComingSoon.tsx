import Link from "next/link";

interface ComingSoonProps {
  icon: string;
  title: string;
  description: string;
}

export function ComingSoon({ icon, title, description }: ComingSoonProps) {
  return (
    <div className="min-h-[72vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-6 shadow-cta text-4xl select-none">
          {icon}
        </div>

        <h1 className="font-display font-bold text-3xl text-slate-900 mb-3">
          {title}
        </h1>

        <p className="text-slate-500 text-base leading-relaxed mb-8">
          {description}
        </p>

        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-5 py-2.5 rounded-full mb-10">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Тун удахгүй нэмэгдэнэ...
        </div>

        <div className="block">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
}
