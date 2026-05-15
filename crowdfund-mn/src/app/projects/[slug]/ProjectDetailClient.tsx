"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Play,
  Users,
} from "lucide-react";
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

const SOCIAL_LINK_META = [
  { key: "website", label: "Вэбсайт" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "discord", label: "Discord" },
  { key: "twitter", label: "X / Twitter" },
] as const;

function projectSocialLinkItems(project: Project) {
  const links = project.socialLinks;
  if (!links) return [];

  return SOCIAL_LINK_META.flatMap(({ key, label }) => {
    const value = links[key]?.trim();
    if (!value) return [];

    const href = /^https?:\/\//i.test(value)
      ? value
      : `https://${value.replace(/^\/+/, "")}`;
    const display = value.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

    return [{ key, label, href, display }];
  });
}

function formatTimelineDate(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return "Төлөвлөгдөж байна";

  const date = new Date(`${clean}T00:00:00`);
  if (Number.isNaN(date.getTime())) return clean;

  return date.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function documentName(src: string, index: number) {
  try {
    const url = new URL(src, "https://crowdfund.mn");
    const last = url.pathname.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : `Баримт ${index + 1}`;
  } catch {
    const last = src.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : `Баримт ${index + 1}`;
  }
}

interface Props {
  project: Project;
  rewards: RewardTier[];
  updates: FundingUpdate[];
}

export function ProjectDetailClient({ project, rewards, updates }: Props) {
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

  return (
    <>
      <main className="min-h-screen bg-slate-50">

        <ProjectShowcase project={liveProject} percent={percent} onSupport={() => openSupport()} />

        {/* ── Campaign story layout ──────────────────────── */}
        <div className="container-page py-8 lg:py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[190px_minmax(0,1fr)_320px] xl:gap-10">
            <CampaignSideNav project={project} updates={updates} />
            <CampaignStory project={project} updates={updates} />
            <CampaignRewardRail tiers={tiers} onSelectTier={openSupport} />
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

interface CampaignStorySection {
  id: string;
  navLabel: string;
  title: string;
  content?: string | null;
  image?: string;
  imageLabel?: string;
  imageCaption?: string;
}

function campaignStorySections(project: Project): CampaignStorySection[] {
  const mediaBySection = new Map((project.storyMedia ?? []).map((media) => [media.section, media]));

  return [
    {
      id: "project-story",
      navLabel: "Төслийн түүх",
      title: "Төслийн түүх",
      content: project.story,
      image: mediaBySection.get("story")?.image ?? undefined,
      imageLabel: mediaBySection.get("story")?.label ?? "Төслийн түүх",
      imageCaption: mediaBySection.get("story")?.caption ?? undefined,
    },
    {
      id: "problem",
      navLabel: "Асуудал",
      title: "Ямар асуудлыг шийдэх вэ?",
      content: project.description,
      image: mediaBySection.get("problem")?.image ?? undefined,
      imageLabel: mediaBySection.get("problem")?.label ?? "Асуудал",
      imageCaption: mediaBySection.get("problem")?.caption ?? undefined,
    },
    {
      id: "solution",
      navLabel: "Шийдэл",
      title: "Шийдэл ба зорилго",
      content: project.purpose,
      image: mediaBySection.get("solution")?.image ?? undefined,
      imageLabel: mediaBySection.get("solution")?.label ?? "Шийдэл",
      imageCaption: mediaBySection.get("solution")?.caption ?? undefined,
    },
    {
      id: "funding-usage",
      navLabel: "Хөрөнгийн ашиглалт",
      title: "Хөрөнгийн ашиглалт",
      content: project.fundingUsage,
      image: mediaBySection.get("funding")?.image ?? undefined,
      imageLabel: mediaBySection.get("funding")?.label ?? "Хөрөнгийн ашиглалт",
      imageCaption: mediaBySection.get("funding")?.caption ?? undefined,
    },
    {
      id: "team",
      navLabel: "Бидний тухай",
      title: "Багийн тухай",
      content: project.teamInfo,
      image: mediaBySection.get("team")?.image ?? undefined,
      imageLabel: mediaBySection.get("team")?.label ?? "Багийн тухай",
      imageCaption: mediaBySection.get("team")?.caption ?? undefined,
    },
    {
      id: "risks",
      navLabel: "Эрсдэл",
      title: "Эрсдэлүүд болон сорилтууд",
      content: project.risks,
      image: mediaBySection.get("risks")?.image ?? undefined,
      imageLabel: mediaBySection.get("risks")?.label ?? "Эрсдэл",
      imageCaption: mediaBySection.get("risks")?.caption ?? undefined,
    },
  ].filter((section) => Boolean(section.content?.trim()) || Boolean(section.image));
}

function sectionSummary(caption?: string | null, text?: string | null) {
  const clean = (caption || text)?.replace(/\s+/g, " ").trim();
  if (!clean) return "Энэ зураг тухайн хэсгийн утгыг товч харуулна.";
  return clean.length > 150 ? `${clean.slice(0, 150).trim()}...` : clean;
}

function CampaignSideNav({
  project,
  updates,
}: {
  project: Project;
  updates: FundingUpdate[];
}) {
  const sections = campaignStorySections(project);
  const storyBlocks = project.storyBlocks ?? [];
  const hasFaq = Boolean(project.faq?.length);
  const hasSocialLinks = projectSocialLinkItems(project).length > 0;
  const hasDocuments = Boolean(project.documents?.length);

  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-28 border-l-4 border-slate-300 pl-5 text-sm text-slate-500">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "block transition-colors hover:text-blue-800",
                index === 0 ? "font-bold text-slate-700" : "font-medium"
              )}
            >
              {section.navLabel}
            </a>
          ))}

          {storyBlocks.length > 0 && (
            <>
              <a href="#story-blocks" className="block font-medium transition-colors hover:text-blue-800">
                Дэлгэрэнгүй story
              </a>
              <div className="space-y-2 border-l border-dashed border-slate-300 pl-4">
                {storyBlocks.slice(0, 6).map((block, index) => (
                  <a
                    key={block.id}
                    href={`#story-block-${index + 1}`}
                    className="block truncate text-xs font-medium text-slate-500 transition-colors hover:text-blue-800"
                  >
                    {block.title}
                  </a>
                ))}
              </div>
            </>
          )}

          {updates.length > 0 && (
            <a href="#updates" className="block font-medium transition-colors hover:text-blue-800">
              Шинэчлэлт
            </a>
          )}
          {hasFaq && (
            <a href="#faq" className="block font-medium transition-colors hover:text-blue-800">
              FAQ
            </a>
          )}
          <a href="#timeline" className="block font-medium transition-colors hover:text-blue-800">
            Хугацаа
          </a>
          {hasSocialLinks && (
            <a href="#links" className="block font-medium transition-colors hover:text-blue-800">
              Холбоос
            </a>
          )}
          {hasDocuments && (
            <a href="#documents" className="block font-medium transition-colors hover:text-blue-800">
              Баримт
            </a>
          )}
        </div>
      </nav>
    </aside>
  );
}

function CampaignStory({
  project,
  updates,
}: {
  project: Project;
  updates: FundingUpdate[];
}) {
  const sections = campaignStorySections(project);
  const storyBlocks = project.storyBlocks ?? [];

  return (
    <article className="min-w-0 space-y-10">
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">
            {section.navLabel}
          </p>
          <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">
            {section.title}
          </h2>

          {section.image && (
            <StoryMediaFigure
              image={section.image}
              title={section.title}
              label={section.imageLabel ?? `Кампанийн зураг ${index + 1}`}
              summary={sectionSummary(section.imageCaption, section.content)}
            />
          )}

          {section.content?.trim() ? (
            <p className="project-copy project-copy-preserve mt-5">{section.content.trim()}</p>
          ) : (
            <p className="mt-5 text-sm text-slate-400">Энэ хэсгийн дэлгэрэнгүй мэдээлэл хараахан нэмэгдээгүй байна.</p>
          )}
        </section>
      ))}

      {storyBlocks.length > 0 && (
        <section id="story-blocks" className="scroll-mt-28 space-y-6">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Дэлгэрэнгүй story</p>
            <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">Зурагтай дэлгэрэнгүй мэдээлэл</h2>
          </div>
          {storyBlocks.map((block, index) => (
            <StoryBlockSection key={block.id} block={block} index={index} />
          ))}
        </section>
      )}

      {updates.length > 0 && (
        <section id="updates" className="scroll-mt-28">
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Шинэчлэлт</p>
            <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">Шинэчлэлтүүд</h2>
          </div>
          <UpdatesTab updates={updates} />
        </section>
      )}

      <ProjectFaqSection faq={project.faq ?? []} />
      <CampaignTimeline project={project} />
      <ProjectLinksSection project={project} />
      <ProjectDocumentsSection documents={project.documents ?? []} />
    </article>
  );
}

function StoryBlockSection({
  block,
  index,
}: {
  block: NonNullable<Project["storyBlocks"]>[number];
  index: number;
}) {
  return (
    <article
      id={`story-block-${index + 1}`}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
    >
      <div className="relative aspect-[16/9] min-h-[260px] bg-slate-100">
        <Image
          src={block.image}
          alt={block.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 760px"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent p-5 text-white sm:p-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-200">
            Дэлгэрэнгүй #{index + 1}
          </p>
          <h3 className="font-display text-xl font-bold sm:text-2xl">{block.title}</h3>
          {block.caption && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">{block.caption}</p>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <p className="project-copy project-copy-preserve">{block.body}</p>
      </div>
    </article>
  );
}

function StoryMediaFigure({
  image,
  title,
  label,
  summary,
}: {
  image: string;
  title: string;
  label: string;
  summary: string;
}) {
  return (
    <figure className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-slate-950">
      <div className="relative aspect-[16/10] min-h-[260px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 760px"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent p-5 text-white sm:p-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-200">{label}</p>
          <h3 className="font-display text-xl font-bold sm:text-2xl">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">{summary}</p>
        </div>
      </div>
    </figure>
  );
}

function CampaignRewardRail({
  tiers,
  onSelectTier,
}: {
  tiers: RewardTier[];
  onSelectTier: (tier: RewardTier) => void;
}) {
  if (tiers.length === 0) return null;

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-28 space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Урамшуулал</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{tiers.length} сонголт байна</p>
        </div>

        {tiers.map((tier, index) => (
          <RewardRailCard
            key={tier.id}
            tier={tier}
            featured={index === 0}
            onSelect={() => onSelectTier(tier)}
          />
        ))}
      </div>
    </aside>
  );
}

function RewardRailCard({
  tier,
  featured,
  onSelect,
}: {
  tier: RewardTier;
  featured: boolean;
  onSelect: () => void;
}) {
  const isSoldOut = tier.isLimited && tier.remaining !== undefined && tier.remaining <= 0;
  const shortDescription = tier.description.length > 118
    ? `${tier.description.slice(0, 118).trim()}...`
    : tier.description;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      {tier.image && (
        <div className="relative aspect-[16/8] bg-slate-100">
          <Image
            src={tier.image}
            alt={tier.title}
            fill
            className="object-cover"
            sizes="320px"
          />
          {featured && (
            <span className="absolute left-3 top-3 rounded-full bg-pink-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sm">
              Онцлох
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        {!tier.image && featured && (
          <span className="mb-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700">
            Онцлох
          </span>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-2xl font-bold text-slate-950">{formatMNT(tier.amount)}</p>
            <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-900">{tier.title}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-500">
            {tier.backerCount} хүн
          </span>
        </div>

        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{shortDescription}</p>

        <button
          type="button"
          onClick={onSelect}
          disabled={isSoldOut}
          className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isSoldOut ? "Дууссан" : "Сонгох"}
        </button>
      </div>
    </div>
  );
}

function ProjectFaqSection({ faq }: { faq: NonNullable<Project["faq"]> }) {
  if (faq.length === 0) return null;

  return (
    <section id="faq" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-800">
          <HelpCircle className="h-5 w-5" />
        </span>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">FAQ</p>
          <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">Түгээмэл асуулт</h2>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {faq.map((item, index) => (
          <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex gap-3">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-blue-800 shadow-sm">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-950">{item.question}</h3>
                <p className="project-copy-preserve mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CampaignTimeline({ project }: { project: Project }) {
  const start = project.publishedAt ?? project.createdAt;
  const statusLabels: Record<string, string> = {
    PENDING: "Хянагдаж байна",
    ACTIVE: "Идэвхтэй",
    FUNDED: "Амжилттай санхүүжсэн",
    FAILED: "Амжилтгүй",
    CANCELLED: "Цуцлагдсан",
    REJECTED: "Татгалзсан",
  };
  const timeline = project.timeline?.length
    ? project.timeline.map((item) => ({
        label: item.title,
        value: formatTimelineDate(item.date),
        description: item.description,
      }))
    : [
        { label: "Кампан эхэлсэн", value: start ? new Date(start).toLocaleDateString("mn-MN") : "Тун удахгүй", description: "" },
        { label: "Дэмжлэг авах хугацаа", value: project.endsAt ? new Date(project.endsAt).toLocaleDateString("mn-MN") : daysLeftLabel(project.daysLeft), description: "" },
        { label: "Одоогийн төлөв", value: statusLabels[project.status ?? "ACTIVE"] ?? "Идэвхтэй", description: "" },
      ];

  return (
    <section id="timeline" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Хугацаа</p>
      <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">Төслийн хугацаа</h2>
      <div className="mt-6 space-y-4">
        {timeline.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-800 text-xs font-bold text-white">{index + 1}</span>
              {index < timeline.length - 1 && <span className="h-full w-px bg-slate-200" />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-bold text-slate-900">{item.label}</p>
              <p className="mt-1 text-sm text-slate-500">{item.value}</p>
              {item.description && (
                <p className="project-copy-preserve mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectLinksSection({ project }: { project: Project }) {
  const links = projectSocialLinkItems(project);
  if (links.length === 0) return null;

  return (
    <section id="links" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-800">
          <Globe className="h-5 w-5" />
        </span>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Холбоос</p>
          <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">Төслийн холбоосууд</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-950">{link.label}</span>
              <span className="block truncate text-xs font-medium text-slate-500">{link.display}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-800" />
          </a>
        ))}
      </div>
    </section>
  );
}

function ProjectDocumentsSection({ documents }: { documents: string[] }) {
  const cleanDocuments = documents.map((document) => document.trim()).filter(Boolean);
  if (cleanDocuments.length === 0) return null;

  return (
    <section id="documents" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-800">
          <FileText className="h-5 w-5" />
        </span>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">Баримт</p>
          <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">Нэмэлт баримт бичиг</h2>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {cleanDocuments.map((document, index) => (
          <a
            key={`${document}-${index}`}
            href={document}
            target="_blank"
            rel="noreferrer"
            className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-800 shadow-sm">
                <FileText className="h-4 w-4" />
              </span>
              <span className="truncate text-sm font-bold text-slate-900">{documentName(document, index)}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-800" />
          </a>
        ))}
      </div>
    </section>
  );
}

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
            <span>Бүтээгч: {project.creator.name}</span>
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
                      <span className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-3">
                          {tier.image && (
                            <span className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                              <Image src={tier.image} alt="" fill className="object-cover" sizes="44px" />
                            </span>
                          )}
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{tier.title}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">{formatMNT(tier.amount)}-с эхэлнэ</span>
                          </span>
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
