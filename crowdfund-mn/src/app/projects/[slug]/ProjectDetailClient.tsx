"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Play, Users } from "lucide-react";
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

type ProjectMediaItem =
  | { type: "video"; src: string }
  | { type: "image"; src: string };

function uniqueProjectImages(project: Project) {
  const images = [project.coverImage, ...(project.galleryImages ?? [])]
    .map((image) => image?.trim())
    .filter((image): image is string => Boolean(image));

  return Array.from(new Set(images));
}

function projectMedia(project: Project): ProjectMediaItem[] {
  const images = uniqueProjectImages(project).map((src) => ({ type: "image" as const, src }));
  const videoUrl = project.videoUrl?.trim();

  return videoUrl ? [{ type: "video", src: videoUrl }, ...images] : images;
}

function youtubeEmbedUrl(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (host.endsWith("youtube.com")) {
    id = url.searchParams.get("v");
    if (!id && url.pathname.startsWith("/shorts/")) {
      id = url.pathname.split("/").filter(Boolean)[1] ?? null;
    }
    if (!id && url.pathname.startsWith("/embed/")) {
      id = url.pathname.split("/").filter(Boolean)[1] ?? null;
    }
  }

  return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
}

function videoEmbedUrl(src: string): string | null {
  try {
    const url = new URL(src);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const youtube = youtubeEmbedUrl(url);
    if (youtube) return youtube;

    if (host.endsWith("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${encodeURIComponent(id)}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function isDirectVideo(src: string) {
  try {
    return /\.(mp4|webm|mov|m4v)$/i.test(new URL(src).pathname);
  } catch {
    return false;
  }
}

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

        <ProjectShowcase project={liveProject} percent={percent} onSupport={() => openSupport()} />

        {/* ── Main layout ──────────────────────────────────── */}
        <div className="container-page py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* ── Left: content ──────────────────────────── */}
            <div className="lg:col-span-7 min-w-0">

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

function ProjectShowcase({
  project,
  percent,
  onSupport,
}: {
  project: Project;
  percent: number;
  onSupport: () => void;
}) {
  return (
    <section className="relative overflow-hidden bg-slate-950 pt-24 pb-10 sm:pt-28 lg:pb-12">
      <Image
        src={project.coverImage}
        alt=""
        fill
        priority
        className="object-cover opacity-25 blur-sm scale-105"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/70" />
      <div className="container-page relative z-10">
        <div className="mb-5 max-w-4xl">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="blue" className="bg-white/10 text-blue-100 border-white/15 backdrop-blur-sm">
              {CATEGORY_LABELS[project.category] ?? project.category}
            </Badge>
            {project.isTrending && (
              <Badge variant="yellow" className="border-0 bg-amber-300 text-amber-950">
                🔥 Тренд
              </Badge>
            )}
            {project.isVerified && (
              <span className="inline-flex items-center rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-100">
                Баталгаажсан
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {project.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-blue-100">
            <span>by {project.creator.name}</span>
            <span className="hidden h-1 w-1 rounded-full bg-blue-200/60 sm:block" />
            <span>{project.creator.projectCount} төсөл байршуулсан</span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            {project.description}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
          <ProjectMediaCarousel project={project} />
          <FundingCard project={project} percent={percent} onSupport={onSupport} />
        </div>
      </div>
    </section>
  );
}

function ProjectMediaCarousel({ project }: { project: Project }) {
  const media = useMemo(() => projectMedia(project), [project]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const active = media[activeIndex] ?? media[0] ?? { type: "image" as const, src: project.coverImage };

  function showMedia(nextIndex: number, nextDirection: number) {
    if (media.length <= 1) return;
    setDirection(nextDirection);
    setActiveIndex((nextIndex + media.length) % media.length);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-slate-950/30">
      <div className="relative aspect-video min-h-[260px] overflow-hidden sm:min-h-[360px] lg:min-h-[420px]">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`${active.type}-${active.src}-${activeIndex}`}
            custom={direction}
            initial={{ x: direction * 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {active.type === "video" ? (
              <ProjectVideo src={active.src} poster={project.coverImage} />
            ) : (
              <Image
                src={active.src}
                alt={project.title}
                fill
                priority={activeIndex === 0}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 760px"
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/70 to-transparent" />

        {active.type === "video" && (
          <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            <Play className="h-3.5 w-3.5 fill-white" strokeWidth={2.4} />
            Богино видео
          </div>
        )}

        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => showMedia(activeIndex - 1, -1)}
              className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:bg-white"
              aria-label="Өмнөх медиа"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => showMedia(activeIndex + 1, 1)}
              className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:bg-white"
              aria-label="Дараах медиа"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
              {media.map((item, index) => (
                <button
                  key={`${item.type}-${item.src}-${index}`}
                  type="button"
                  onClick={() => showMedia(index, index >= activeIndex ? 1 : -1)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === activeIndex ? "w-8 bg-blue-300" : "w-4 bg-white/70 hover:bg-white"
                  )}
                  aria-label={`${index + 1}-р медиа`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProjectVideo({ src, poster }: { src: string; poster: string }) {
  const embed = videoEmbedUrl(src);

  if (embed) {
    return (
      <iframe
        src={embed}
        title="Төслийн богино видео"
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  if (isDirectVideo(src)) {
    return (
      <video
        className="h-full w-full object-cover"
        controls
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src={src} />
      </video>
    );
  }

  return (
    <Image
      src={poster}
      alt="Төслийн видео"
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, 760px"
    />
  );
}

function FundingCard({ project, percent, onSupport }: { project: Project; percent: number; onSupport: () => void }) {
  const reached = percent >= 100;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-4 text-center text-sm font-bold text-white">
        {reached ? "Зорилго биелсэн" : `${percent.toFixed(0)}% санхүүжсэн`}
      </div>

      <div className="p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Зорилго: {formatMNT(project.goal)}
        </p>
        <div className="mt-2">
          <span className="font-display text-4xl font-bold text-slate-950">
            {formatMNT(project.raised)}
          </span>
        </div>

        <ProgressBar
          value={percent}
          raised={project.raised}
          goal={project.goal}
          showLabel={false}
          className="mt-4 mb-5"
        />

        <div className="mb-8 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-700">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3">
            <Users className="h-4 w-4 text-slate-500" />
            <span>{project.backers.toLocaleString()} дэмжигч</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span>{daysLeftLabel(project.daysLeft)}</span>
          </div>
        </div>

        <button
          onClick={onSupport}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 py-3.5 text-base font-bold text-white shadow-cta transition-colors hover:bg-blue-900 active:bg-blue-950"
        >
          Энэ төслийг дэмжих
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </button>

        {project.daysLeft <= 7 && (
          <p className="mt-4 text-center text-xs font-semibold text-red-500">
            {daysLeftLabel(project.daysLeft)}. Дэмжих хугацаа ойртож байна.
          </p>
        )}

        <div className="mt-4 text-center text-xs font-medium text-slate-400">
          Төлбөр баталгаажмагц дэмжлэг төслийн дүнд нэмэгдэнэ.
        </div>
      </div>
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
      if (!silent) setPaymentMessage(result.message ?? "Төлбөр хараахан баталгаажаагүй байна. QPay апп дээр төлбөрөө баталгаажуулсан эсэхээ шалгана уу.");
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
        setPaymentMessage("QPay дээр төлбөрөө баталгаажуулмагц энэ дэмжлэг төслийн дүнд автоматаар нэмэгдэнэ.");
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
        className="w-full max-w-md max-h-[calc(100svh-2rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-white/80"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-700">Аюулгүй QPay төлбөр</p>
            <h2 id="support-modal-title" className="mt-1 font-display text-lg font-bold text-slate-950">
              {project.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            aria-label="Хаах"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.22 5.22a.75.75 0 011.06 0L10 8.94l3.72-3.72a.75.75 0 111.06 1.06L11.06 10l3.72 3.72a.75.75 0 11-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 11-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          {invoice ? (
            <div className="space-y-3.5">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">Төлөх дүн</p>
                <p className="mt-1 text-xl font-bold text-blue-950">{formatMNT(invoice.amount)}</p>
              </div>

              {invoice.qrImage ? (
                <div className="flex justify-center">
                  <Image
                    src={invoice.qrImage.startsWith("data:") ? invoice.qrImage : `data:image/png;base64,${invoice.qrImage}`}
                    alt="QPay QR"
                    width={192}
                    height={192}
                    unoptimized
                    className="h-48 w-48 rounded-2xl border border-slate-200 bg-white object-contain p-2.5"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 break-all">
                  {invoice.qrText}
                </div>
              )}

              {invoice.urls.length > 0 && (
                <div className="md:hidden">
                  <p className="mb-2 text-sm font-bold text-slate-800">Төлөх апп аа сонгоно уу</p>
                  <div className="max-h-36 overflow-y-auto pr-1 grid grid-cols-2 gap-2">
                    {invoice.urls.map((url) => (
                      <button
                        key={`${url.name}-${url.link}`}
                        type="button"
                        onClick={() => openPaymentLink(url.link)}
                        className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-center text-xs font-semibold text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
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
                  QPay-р төлөх
                </a>
              )}

              <p className="text-center text-xs font-medium text-slate-500 md:hidden">
                QR уншуулж эсвэл апп сонгоод төлнө үү. Төлбөр баталгаажмагц дэмжлэг шууд бүртгэгдэнэ.
              </p>
              <p className="hidden text-center text-xs font-medium text-slate-500 md:block">
                QR уншуулж төлнө үү. Төлбөр баталгаажмагц дэмжлэг шууд бүртгэгдэнэ.
              </p>
            </div>
          ) : (
            <>
          {tiers.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">Дэмжлэгийн сонголт</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => selectRewardTier(null)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                    selectedRewardTierId === null
                      ? "border-blue-700 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                  )}
                >
                  <span className="font-semibold">Зөвхөн мөнгөн дэмжлэг өгөх</span>
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
                        "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
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
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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

        <div className="border-t border-slate-100 px-4 py-3">
          <button
            type={invoice ? "button" : "submit"}
            onClick={invoice ? () => void checkPayment(invoice.donationId) : undefined}
            disabled={isPending || isCheckingPayment}
            className="w-full rounded-xl bg-blue-800 py-3 text-sm font-bold text-white shadow-cta transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300"
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
        <p className="project-copy">{project.description}</p>
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
        <p className="project-copy project-copy-preserve">{text}</p>
      ) : (
        <p className="text-slate-400 text-sm italic">Бүтээгч энэ хэсгийг хараахан бөглөөгүй байна.</p>
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
        <p className="font-semibold text-slate-700 mb-1">Шинэчлэлт хараахан ороогүй</p>
        <p className="text-slate-400 text-sm">Төсөл урагшлах үед бүтээгчийн мэдээ, тайлан энд нэмэгдэнэ.</p>
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
        <p className="font-semibold text-slate-700 mb-1">Урамшуулал нэмээгүй байна</p>
        <p className="text-slate-400 text-sm">Та урамшуулалгүйгээр мөнгөн дэмжлэг өгөх боломжтой.</p>
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
