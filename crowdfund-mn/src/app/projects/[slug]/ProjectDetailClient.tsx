"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { Footer }       from "@/components/landing/Footer";
import { Badge }        from "@/components/ui/Badge";
import { ProgressBar }  from "@/components/ui/ProgressBar";
import { fundingPercent, daysLeftLabel } from "@/lib/utils";
import { formatMNT } from "@/lib/formatters";
import { cn }           from "@/lib/utils";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useToast }     from "@/context/ToastContext";
import {
  checkQpayDonationPayment,
  createQpayDonationInvoice,
} from "@/lib/actions/donations";
import type { Project, RewardTier, FundingUpdate } from "@/types";

type Tab = "about" | "updates" | "rewards";
type SupportSelection = {
  rewardTierId: string | null;
  amount: number;
};
type SupportPaymentResult = Awaited<ReturnType<typeof checkQpayDonationPayment>>;
type SupportPaymentSuccess = Extract<SupportPaymentResult, { success: true; paid: true }>;
type QpayInvoiceResult = Extract<Awaited<ReturnType<typeof createQpayDonationInvoice>>, { success: true }>;

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
  const [liveProject, setLiveProject] = useState(project);
  const [tiers, setTiers] = useState(rewards);
  const [supportSelection, setSupportSelection] = useState<SupportSelection | null>(null);
  const { guard } = useAuthGuard();
  const { show } = useToast();
  const percent = fundingPercent(liveProject.raised, liveProject.goal);

  function openSupport(tier?: RewardTier) {
    guard(() => {
      setSupportSelection({
        rewardTierId: tier?.id ?? null,
        amount: tier?.amount ?? 10,
      });
    });
  }

  function handleSupportCompleted(result: SupportPaymentSuccess) {
    setLiveProject((current) => ({
      ...current,
      raised: result.project.raised,
      backers: result.project.backers,
    }));

    if (result.rewardTier) {
      setTiers((current) => current.map((tier) =>
        tier.id === result.rewardTier?.id
          ? {
              ...tier,
              backerCount: result.rewardTier.backerCount,
              remaining: result.rewardTier.remaining,
            }
          : tier
      ));
    }

    setSupportSelection(null);
    show(result.goalReached ? "Дэмжлэг бүртгэгдлээ. Төслийн зорилго биеллээ!" : "Дэмжлэг амжилттай бүртгэгдлээ.", "info");
  }

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
                <FundingCard project={liveProject} percent={percent} onSupport={() => openSupport()} />
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
              {tab === "rewards" && <RewardsTab tiers={tiers} onSelectTier={openSupport} />}
            </div>

            {/* ── Right: sticky sidebar ─────────────────── */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-24 space-y-4">
                <FundingCard project={liveProject} percent={percent} onSupport={() => openSupport()} />

                {tiers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">
                      Шагналын түвшин
                    </p>
                    <div className="space-y-3">
                      {tiers.map(tier => (
                        <RewardTierCard key={tier.id} tier={tier} onSelect={() => openSupport(tier)} />
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
      {supportSelection && (
        <SupportModal
          project={liveProject}
          tiers={tiers}
          initialAmount={supportSelection.amount}
          initialRewardTierId={supportSelection.rewardTierId}
          onClose={() => setSupportSelection(null)}
          onCompleted={handleSupportCompleted}
        />
      )}
      <Footer />
    </>
  );
}


/* ── Sub-components ──────────────────────────────────────────── */

function FundingCard({ project, percent, onSupport }: { project: Project; percent: number; onSupport: () => void }) {
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
        onClick={onSupport}
        className="w-full bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white font-bold text-base py-3.5 rounded-xl transition-colors shadow-cta flex items-center justify-center gap-2"
      >
        Дэмжих
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Payment icons */}
      <div className="mt-3.5 flex items-center justify-center gap-3">
        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">QPay</span>
      </div>

      {project.daysLeft <= 7 && (
        <p className="mt-3 text-center text-xs text-red-500 font-semibold">
          ⚠️ {daysLeftLabel(project.daysLeft)} — яарна уу!
        </p>
      )}
    </div>
  );
}

function SupportModal({
  project,
  tiers,
  initialAmount,
  initialRewardTierId,
  onClose,
  onCompleted,
}: {
  project: Project;
  tiers: RewardTier[];
  initialAmount: number;
  initialRewardTierId: string | null;
  onClose: () => void;
  onCompleted: (result: SupportPaymentSuccess) => void;
}) {
  const [amount, setAmount] = useState(String(initialAmount));
  const [selectedRewardTierId, setSelectedRewardTierId] = useState(initialRewardTierId);
  const [invoice, setInvoice] = useState<QpayInvoiceResult | null>(null);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.id === selectedRewardTierId) ?? null,
    [selectedRewardTierId, tiers]
  );
  const parsedAmount = Number(amount || 0);
  const minimumAmount = Math.max(10, selectedTier?.amount ?? 10);
  const quickAmounts = useMemo(() => {
    const values = [10, selectedTier?.amount, 100, 1000, 5000, 10000]
      .filter((value): value is number => typeof value === "number" && value >= minimumAmount);
    return Array.from(new Set(values)).slice(0, 5);
  }, [minimumAmount, selectedTier?.amount]);

  function changeAmount(value: string) {
    setAmount(value.replace(/[^\d]/g, ""));
    setError("");
  }

  function selectRewardTier(tier: RewardTier | null) {
    setSelectedRewardTierId(tier?.id ?? null);
    setAmount(String(Math.max(Number(amount || 0), tier?.amount ?? 10)));
    setError("");
  }

  const checkPayment = useCallback(async (donationId: string, silent = false) => {
    if (!silent) {
      setIsCheckingPayment(true);
      setPaymentMessage("");
    }

    const result = await checkQpayDonationPayment(donationId);

    if (!silent) setIsCheckingPayment(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (!result.paid) {
      if (!silent) setPaymentMessage(result.message ?? "Төлбөр хараахан баталгаажаагүй байна.");
      return;
    }

    onCompleted(result);
  }, [onCompleted]);

  useEffect(() => {
    if (!invoice) return;

    const timer = window.setInterval(() => {
      void checkPayment(invoice.donationId, true);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [checkPayment, invoice]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!Number.isFinite(parsedAmount) || parsedAmount < minimumAmount) {
      setError(`Дэмжлэгийн дүн хамгийн багадаа ${formatMNT(minimumAmount)} байна.`);
      return;
    }

    if (selectedTier?.isLimited && selectedTier.remaining !== undefined && selectedTier.remaining <= 0) {
      setError("Энэ урамшуулал дууссан байна.");
      return;
    }

    startTransition(() => {
      void (async () => {
        const result = await createQpayDonationInvoice({
          projectId: project.id,
          amount: parsedAmount,
          rewardTierId: selectedRewardTierId,
        });

        if (!result.success) {
          setError(result.error);
          return;
        }

        setInvoice(result);
        setPaymentMessage("QPay-р төлсний дараа төлбөр автоматаар шалгагдана.");
      })();
    });
  }

  function openPaymentLink(link: string) {
    window.open(link, "_self");
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-slate-950/55 px-3 py-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-title"
      onMouseDown={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100svh-2rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-white/80"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Төсөл дэмжих</p>
            <h2 id="support-modal-title" className="mt-1 font-display text-xl font-bold text-slate-950">
              {project.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            aria-label="Хаах"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.22 5.22a.75.75 0 011.06 0L10 8.94l3.72-3.72a.75.75 0 111.06 1.06L11.06 10l3.72 3.72a.75.75 0 11-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 11-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          {invoice ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">QPay нэхэмжлэх</p>
                <p className="mt-1 text-2xl font-bold text-blue-950">{formatMNT(invoice.amount)}</p>
              </div>

              {invoice.qrImage ? (
                <div className="flex justify-center">
                  <Image
                    src={invoice.qrImage.startsWith("data:") ? invoice.qrImage : `data:image/png;base64,${invoice.qrImage}`}
                    alt="QPay QR"
                    width={224}
                    height={224}
                    unoptimized
                    className="h-56 w-56 rounded-2xl border border-slate-200 bg-white object-contain p-3"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 break-all">
                  {invoice.qrText}
                </div>
              )}

              {invoice.urls.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-bold text-slate-800">QPay апп сонгох</p>
                  <div className="max-h-44 overflow-y-auto pr-1 grid grid-cols-2 gap-2">
                    {invoice.urls.map((url) => (
                      <button
                        key={`${url.name}-${url.link}`}
                        type="button"
                        onClick={() => openPaymentLink(url.link)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                      >
                        {url.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {invoice.urls.length === 0 && invoice.shortUrl && (
                <a
                  href={invoice.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center rounded-xl bg-blue-800 px-4 py-3 text-sm font-bold text-white shadow-cta hover:bg-blue-900"
                >
                  QPay апп нээх
                </a>
              )}

              <p className="text-center text-xs font-medium text-slate-500">
                QR уншуулж эсвэл дээрээс апп сонгоод төлнө үү. Төлөгдвөл төсөлд мөнгө автоматаар нэмэгдэнэ.
              </p>
            </div>
          ) : (
            <>
          {tiers.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">Урамшуулал</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => selectRewardTier(null)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                    selectedRewardTierId === null
                      ? "border-blue-700 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                  )}
                >
                  <span className="font-semibold">Зөвхөн дэмжих</span>
                </button>
                {tiers.map((tier) => {
                  const isSoldOut = tier.isLimited && tier.remaining !== undefined && tier.remaining <= 0;

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => selectRewardTier(tier)}
                      disabled={isSoldOut}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
                        selectedRewardTierId === tier.id
                          ? "border-blue-700 bg-blue-50 text-blue-900"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                      )}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block font-semibold">{tier.title}</span>
                          <span className="mt-0.5 block text-xs text-slate-500">{formatMNT(tier.amount)}-с эхэлнэ</span>
                        </span>
                        {isSoldOut ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-400">Дууссан</span>
                        ) : tier.isLimited && tier.remaining !== undefined ? (
                          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">{tier.remaining} үлдсэн</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="support-amount" className="mb-2 block text-sm font-bold text-slate-800">
              Дэмжлэгийн дүн
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₮</span>
              <input
                id="support-amount"
                value={amount}
                onChange={(event) => changeAmount(event.target.value)}
                inputMode="numeric"
                min={minimumAmount}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-base font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => changeAmount(String(value))}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-800"
                >
                  {formatMNT(value)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">Төлбөрийн хэлбэр</label>
            <div className="rounded-xl border border-blue-700 bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-sm">
              QPay
            </div>
            <p className="mt-2 text-xs font-medium text-slate-400">Одоогоор зөвхөн QPay төлбөр дэмжигдэнэ.</p>
          </div>
            </>
          )}

          {paymentMessage && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {paymentMessage}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4">
          <button
            type={invoice ? "button" : "submit"}
            onClick={invoice ? () => void checkPayment(invoice.donationId) : undefined}
            disabled={isPending || isCheckingPayment}
            className="w-full rounded-xl bg-blue-800 py-3.5 text-base font-bold text-white shadow-cta transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {invoice
              ? isCheckingPayment ? "Төлбөр шалгаж байна..." : "Төлбөр шалгах"
              : isPending ? "Нэхэмжлэх үүсгэж байна..." : `${formatMNT(parsedAmount || minimumAmount)} дэмжих`}
          </button>
        </div>
      </form>
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

      <ProjectTextSection title="Төслийн тухай" content={project.story} />
      <ProjectTextSection title="Төслийн зорилго" content={project.purpose} />
      <ProjectTextSection title="Хөрөнгийн ашиглалт" content={project.fundingUsage} />
      <ProjectTextSection title="Багийн тухай" content={project.teamInfo} />
      <ProjectTextSection title="Эрсдэлүүд болон сорилтууд" content={project.risks} />
    </div>
  );
}

function ProjectTextSection({ title, content }: { title: string; content?: string | null }) {
  const text = content?.trim();

  return (
    <div>
      <h3 className="font-display font-bold text-slate-900 text-lg mb-3">{title}</h3>
      {text ? (
        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
      ) : (
        <p className="text-slate-400 text-sm italic">Мэдээлэл оруулаагүй байна.</p>
      )}
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

function RewardsTab({ tiers, onSelectTier }: { tiers: RewardTier[]; onSelectTier: (tier: RewardTier) => void }) {
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
        <RewardTierCard key={tier.id} tier={tier} onSelect={() => onSelectTier(tier)} />
      ))}
    </div>
  );
}

function RewardTierCard({ tier, onSelect }: { tier: RewardTier; onSelect: () => void }) {
  const isAlmostGone = tier.isLimited && tier.remaining !== undefined && tier.remaining <= 5;
  const isSoldOut = tier.isLimited && tier.remaining !== undefined && tier.remaining <= 0;

  return (
    <div className={cn(
      "bg-white rounded-2xl border p-5 transition-colors",
      isAlmostGone ? "border-orange-200" : "border-slate-200 hover:border-blue-200"
    )}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="font-display font-bold text-blue-800 text-xl">
            {formatMNT(tier.amount)}
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

      <button
        type="button"
        onClick={onSelect}
        disabled={isSoldOut}
        className="w-full bg-blue-50 hover:bg-blue-800 text-blue-800 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 border border-blue-100 hover:border-blue-800"
      >
        {isSoldOut ? "Урамшуулал дууссан" : "Энэ шагналыг сонгох"}
      </button>
    </div>
  );
}
