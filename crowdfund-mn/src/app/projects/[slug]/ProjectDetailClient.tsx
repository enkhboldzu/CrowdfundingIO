"use client";

import { useState } from "react";
import Image from "next/image";
import { Footer }       from "@/components/landing/Footer";
import { Badge }        from "@/components/ui/Badge";
import { ProgressBar }  from "@/components/ui/ProgressBar";
import { fundingPercent, daysLeftLabel } from "@/lib/utils";
import { formatMNT } from "@/lib/formatters";
import { cn }           from "@/lib/utils";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useToast }     from "@/context/ToastContext";
import type { Project, RewardTier, FundingUpdate } from "@/types";

type Tab = "about" | "updates" | "rewards";

const CATEGORY_LABELS: Record<string, string> = {
  technology:  "Технологи",
  arts:        "Урлаг",
  film:        "Кино",
  environment: "Байгаль орчин",
  games:       "Тоглоом",
  health:      "Эрүүл мэнд",
  education:   "Боловсрол",
  community:   "Нийгэм",
  food:        "Хоол & Ундаа",
  fashion:     "Загвар",
  music:       "Хөгжим",
  publishing:  "Хэвлэл",
  social:      "Нийгэм",
  startups:    "Стартап",
};

interface Props {
  project: Project;
  rewards: RewardTier[];
  updates: FundingUpdate[];
}

export function ProjectDetailClient({ project, rewards, updates }: Props) {
  const [tab, setTab] = useState<Tab>("about");
  const percent = fundingPercent(project.raised, project.goal);
  const tiers   = rewards;

  const tabs: { id: Tab; label: string }[] = [
    { id: "about",   label: "Тухай" },
    { id: "updates", label: updates.length ? `Шинэчлэлт (${updates.length})` : "Шинэчлэлт" },
    { id: "rewards", label: tiers.length   ? `Шагнал (${tiers.length})`      : "Шагнал" },
  ];

  return (
    <>
      <main className="min-h-screen bg-slate-50">

        {/* ── Cover image ──────────────────────────────────── */}
        <div className="relative w-full h-64 sm:h-80 lg:h-[420px] bg-slate-200 overflow-hidden">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* Overlay badges (bottom-left of image) */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Badge variant="blue" className="backdrop-blur-sm bg-blue-800/90 text-white border-0 text-xs px-3 py-1">
              {CATEGORY_LABELS[project.category] ?? project.category}
            </Badge>
            {project.isTrending && (
              <Badge variant="yellow" className="backdrop-blur-sm text-xs px-3 py-1">
                🔥 Тренд
              </Badge>
            )}
          </div>
        </div>

        {/* ── Main layout ──────────────────────────────────── */}
        <div className="container-page py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ── Left: content ──────────────────────────── */}
            <div className="lg:col-span-7 min-w-0">

              {/* Project header */}
              <div className="mb-5">
                {/* Verified badge */}
                {project.isVerified && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full mb-3">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    Баталгаажсан төсөл
                  </div>
                )}

                <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 leading-tight mb-4">
                  {project.title}
                </h1>

                {/* Creator row */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                    <Image
                      src={project.creator.avatar}
                      alt={project.creator.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900">
                        {project.creator.name}
                      </span>
                      {project.creator.isVerified && (
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{project.creator.projectCount} төсөл байршуулсан</p>
                  </div>
                </div>
              </div>

              {/* Mobile: funding card */}
              <div className="lg:hidden mb-6">
                <FundingCard project={project} percent={percent} />
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Tab bar */}
              <div className="border-b border-slate-200 mb-6">
                <div className="flex gap-1">
                  {tabs.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors",
                        tab === t.id
                          ? "border-blue-800 text-blue-800"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              {tab === "about"   && <AboutTab project={project} />}
              {tab === "updates" && <UpdatesTab updates={updates} />}
              {tab === "rewards" && <RewardsTab tiers={tiers} />}
            </div>

            {/* ── Right: sticky sidebar ─────────────────── */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-24 space-y-4">
                <FundingCard project={project} percent={percent} />

                {tiers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
                      Шагналын түвшин
                    </p>
                    <div className="space-y-3">
                      {tiers.map(tier => (
                        <RewardTierCard key={tier.id} tier={tier} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Share */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-3">Хуваалцах</p>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      X / Twitter
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.119 3.504C5.127 3.504 3.5 5.123 3.5 7.119v9.762c0 1.997 1.627 3.615 3.619 3.615h9.762c1.997 0 3.619-1.618 3.619-3.615V7.119c0-1.996-1.622-3.615-3.619-3.615H7.119zm0-1.504h9.762C19.152 2 21 3.852 21 7.119v9.762C21 20.148 19.152 22 16.881 22H7.119C4.848 22 3 20.148 3 16.881V7.119C3 3.852 4.848 2 7.119 2zm4.881 5a5 5 0 100 10A5 5 0 0012 7zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm5.25-.75a.75.75 0 110 1.5.75.75 0 010-1.5z"/>
                      </svg>
                      Instagram
                    </button>
                    <button className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2.5 rounded-xl transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Хуулах
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}


/* ── Sub-components ──────────────────────────────────────────── */

function FundingCard({ project, percent }: { project: Project; percent: number }) {
  const { guard } = useAuthGuard();
  const { show }  = useToast();

  function handleSupport() {
    guard(() => show("Дэмжлэгийн төлбөрийн систем удахгүй нэмэгдэнэ!", "info"));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
      {/* Raised */}
      <div className="mb-1">
        <span className="font-display font-bold text-3xl text-slate-900">
          {formatMNT(project.raised)}
        </span>
      </div>
      <p className="text-slate-500 text-sm mb-4">
        {formatMNT(project.goal)} зорилтоос цугларсан
      </p>

      {/* Progress */}
      <ProgressBar value={percent} raised={project.raised} goal={project.goal} className="mb-5" />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-0 mb-5 rounded-xl bg-slate-50 divide-x divide-slate-200 overflow-hidden">
        <div className="text-center py-3">
          <div className="font-display font-bold text-lg text-blue-800">{percent.toFixed(0)}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">санхүүжсэн</div>
        </div>
        <div className="text-center py-3">
          <div className="font-display font-bold text-lg text-slate-900">{project.backers.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">дэмжигч</div>
        </div>
        <div className="text-center py-3">
          <div className={cn(
            "font-display font-bold text-lg",
            project.daysLeft <= 3 ? "text-red-600" : "text-slate-900"
          )}>
            {project.daysLeft}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">өдөр үлдсэн</div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSupport}
        className="w-full bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-base py-3.5 rounded-xl transition-colors shadow-cta flex items-center justify-center gap-2"
      >
        Дэмжих
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Payment icons */}
      <div className="mt-3.5 flex items-center justify-center gap-3">
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">QPay</span>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">SocialPay</span>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">Карт</span>
      </div>

      {project.daysLeft <= 7 && (
        <p className="mt-3 text-center text-xs text-red-500 font-semibold">
          ⚠️ {daysLeftLabel(project.daysLeft)} — яарна уу!
        </p>
      )}
    </div>
  );
}

function AboutTab({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-slate-600 text-base leading-relaxed">{project.description}</p>
      </div>

      <div className="h-px bg-slate-100" />

      <div>
        <h3 className="font-display font-bold text-slate-900 text-lg mb-3">Төслийн зорилго</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Энэ төсөл нь Монгол улсын{" "}
          {CATEGORY_LABELS[project.category] ?? "технологийн"} салбарт шинэ хуудас нээх зорилготой.
          Бид дижитал инновацийн тусламжтайгаар монголчуудын өдөр тутмын амьдралыг дэмжих,
          боломжийг нэмэгдүүлэхийг зорьж байна. Краудфандингийн тусламжтайгаар нийгмийн өргөн
          дэмжлэгийг авч энэхүү зорилгоо хэрэгжүүлнэ.
        </p>
      </div>

      <div>
        <h3 className="font-display font-bold text-slate-900 text-lg mb-3">Хөрөнгийн ашиглалт</h3>
        <div className="space-y-2.5">
          {[
            { pct: "60%", label: "Хөгжүүлэлт болон техникийн зардал" },
            { pct: "20%", label: "Маркетинг болон хэрэглэгч татах" },
            { pct: "20%", label: "Ажиллах хүчний болон удирдлагын зардал" },
          ].map(item => (
            <div key={item.pct} className="flex items-center gap-3 text-sm text-slate-600">
              <span className="font-bold text-blue-800 w-10 flex-shrink-0">{item.pct}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-200 rounded-full"
                  style={{ width: item.pct }}
                />
              </div>
              <span className="flex-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-slate-900 text-lg mb-3">Багийн тухай</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Манай баг 5+ жилийн туршлагатай мэргэжилтнүүдээс бүрдэнэ. Технологи, бизнес,
          дизайн чиглэлээр мэргэшсэн хүмүүс хамтран ажиллаж байна. Бид өмнө нь хэд хэдэн
          амжилттай төслийг хэрэгжүүлж байсан туршлагатай.
        </p>
      </div>

      <div>
        <h3 className="font-display font-bold text-slate-900 text-lg mb-3">Эрсдэлүүд болон сорилтууд</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Бид болзошгүй эрсдэлүүдийг тодорхойлж, тэдгээрийг даван туулах стратегиа боловсруулсан.
          Хөгжүүлэлтийн хугацаа уртасвал бид дэмжигчидтэйгээ нээлттэй харилцан ажиллах болно.
        </p>
      </div>
    </div>
  );
}

function UpdatesTab({ updates }: { updates: FundingUpdate[] }) {
  if (updates.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
          📭
        </div>
        <p className="font-semibold text-slate-700 mb-1">Шинэчлэлт байхгүй</p>
        <p className="text-slate-400 text-sm">Бүтээгч шинэчлэлт нийтлэхэд энд харагдана.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map(update => (
        <article key={update.id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <time className="text-xs text-slate-400 font-medium block mb-2">
            {new Date(update.createdAt).toLocaleDateString("mn-MN", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </time>
          <h4 className="font-display font-bold text-slate-900 text-base mb-2">{update.title}</h4>
          <p className="text-slate-600 text-sm leading-relaxed">{update.content}</p>
        </article>
      ))}
    </div>
  );
}

function RewardsTab({ tiers }: { tiers: RewardTier[] }) {
  if (tiers.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
          🎁
        </div>
        <p className="font-semibold text-slate-700 mb-1">Шагналын түвшин байхгүй</p>
        <p className="text-slate-400 text-sm">Бүтээгч шагналын түвшин нэмэхэд энд харагдана.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tiers.map(tier => (
        <RewardTierCard key={tier.id} tier={tier} />
      ))}
    </div>
  );
}

function RewardTierCard({ tier }: { tier: RewardTier }) {
  const isAlmostGone = tier.isLimited && tier.remaining !== undefined && tier.remaining <= 5;

  return (
    <div className={cn(
      "bg-white rounded-2xl border p-5 transition-colors",
      isAlmostGone ? "border-orange-200" : "border-slate-200 hover:border-blue-200"
    )}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="font-display font-bold text-blue-800 text-xl">
            ₮{tier.amount.toLocaleString()}
          </span>
          <h4 className="font-semibold text-slate-900 text-sm mt-0.5">{tier.title}</h4>
        </div>
        {tier.isLimited && tier.remaining !== undefined && (
          <span className={cn(
            "text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 border",
            isAlmostGone
              ? "bg-orange-50 text-orange-600 border-orange-200"
              : "bg-slate-50 text-slate-500 border-slate-200"
          )}>
            {tier.remaining} үлдсэн
          </span>
        )}
      </div>

      <p className="text-slate-500 text-xs leading-relaxed mb-3">{tier.description}</p>

      <div className="flex items-center justify-between text-xs text-slate-400 mb-3.5">
        <span>{tier.backerCount} хүн дэмжсэн</span>
        <span>Хүргэлт: {tier.estimatedDelivery}</span>
      </div>

      <button className="w-full bg-blue-50 hover:bg-blue-800 text-blue-800 hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 border border-blue-100 hover:border-blue-800">
        Энэ шагналыг сонгох
      </button>
    </div>
  );
}
