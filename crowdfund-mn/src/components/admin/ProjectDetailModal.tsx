"use client";

import { useState, useEffect } from "react";
import {
  X, Loader2, AlertTriangle, CheckCircle, XCircle,
  User, Mail, Phone, CalendarDays, FolderKanban,
  MapPin, Tag, Banknote, Building2, CreditCard,
  Award, BookOpen, Clock, FileText, ExternalLink, RefreshCw,
  Image as ImageIcon, Link2, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMNT } from "@/lib/formatters";

/* ── Types ──────────────────────────────────────────────────────── */

interface RewardTier {
  id:                string;
  title:             string;
  amount:            number;
  description:       string;
  image:             string | null;
  estimatedDelivery: string;
  isLimited:         boolean;
  remaining:         number | null;
  backerCount:       number;
}

interface ProjectStoryBlock {
  id: string;
  title: string;
  body: string;
  image: string;
  caption?: string | null;
}

interface ProjectFaqItem {
  id: string;
  question: string;
  answer: string;
}

interface ProjectTimelineItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface ProjectSocialLinks {
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  discord?: string | null;
  twitter?: string | null;
}

interface DonationDetail {
  id:            string;
  amount:        number;
  paymentMethod: string;
  status:        string;
  createdAt:     string;
  paidAt:        string | null;
  qpayPaymentId: string | null;
  user: {
    id:    string;
    name:  string;
    email: string | null;
    phone: string | null;
  } | null;
  rewardTier: {
    id:     string;
    title:  string;
    amount: number;
  } | null;
}

interface ProjectDetail {
  id:              string;
  title:           string;
  slug:            string;
  description:     string;
  story:           string;
  purpose:         string | null;
  fundingUsage:    string | null;
  teamInfo:        string | null;
  risks:           string | null;
  category:        string;
  coverImage:      string | null;
  galleryImages:   string[];
  videoUrl:        string | null;
  documents:       string[];
  storyBlocks:     ProjectStoryBlock[];
  faq:             ProjectFaqItem[];
  timeline:        ProjectTimelineItem[];
  socialLinks:     ProjectSocialLinks | null;
  goal:            number;
  raised:          number;
  backers:         number;
  location:        string;
  bankName:        string;
  bankAccount:     string;
  bankAccountName: string;
  endsAt:          string;
  status:          string;
  rejectionReason: string | null;
  isVerified:      boolean;
  isTrending:      boolean;
  isFeatured:      boolean;
  createdAt:       string;
  creator: {
    id:         string;
    name:       string;
    email:      string | null;
    phone:      string | null;
    isVerified: boolean;
    createdAt:  string;
    _count:     { projects: number };
  };
  rewards: RewardTier[];
  donations: DonationDetail[];
  _count:  { donations: number };
}

interface Props {
  projectId: string;
  onClose:   () => void;
  onDecide:  (id: string, action: "approve" | "reject", reason?: string) => Promise<void>;
  acting:    boolean;
}

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  PENDING:   { label: "Хүлээгдэж байна", bg: "bg-amber-100",   text: "text-amber-700"   },
  ACTIVE:    { label: "Нийтлэгдсэн",     bg: "bg-emerald-100", text: "text-emerald-700" },
  REJECTED:  { label: "Татгалзагдсан",   bg: "bg-red-100",     text: "text-red-700"     },
  FUNDED:    { label: "Санхүүжсэн",      bg: "bg-blue-100",    text: "text-blue-700"    },
};

const SOCIAL_LINK_META = [
  { key: "website", label: "Вэбсайт" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "discord", label: "Discord" },
  { key: "twitter", label: "X / Twitter" },
] as const;

function documentName(src: string, index: number) {
  try {
    const url = new URL(src, "https://crowdfund.local");
    const filename = url.pathname.split("/").filter(Boolean).pop();
    return filename ? decodeURIComponent(filename) : `document-${index + 1}`;
  } catch {
    return `document-${index + 1}`;
  }
}

function socialLinkItems(links: ProjectSocialLinks | null | undefined) {
  if (!links) return [];

  return SOCIAL_LINK_META.flatMap(({ key, label }) => {
    const rawValue = links[key];
    const value = typeof rawValue === "string" ? rawValue.trim() : "";
    if (!value) return [];
    const href = /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/+/, "")}`;
    const display = value.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
    return [{ key, label, href, display }];
  });
}

function formatTimelineDate(value?: string | null) {
  const clean = value?.trim();
  if (!clean) return "Огноо оруулаагүй";

  const date = new Date(`${clean}T00:00:00`);
  if (Number.isNaN(date.getTime())) return clean;

  return date.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function FullImageFrame({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="relative z-[1] h-full w-full object-contain"
      />
    </div>
  );
}

/* ── Section header helper ──────────────────────────────────────── */
function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-blue-600" strokeWidth={2} />
        </div>
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ── Info row helper ─────────────────────────────────────────────── */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-slate-400 w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm font-semibold text-slate-900 flex-1 break-all">{value ?? "—"}</span>
    </div>
  );
}

function DetailTextCard({ title, content }: { title: string; content: string | null }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-800 mb-1.5">{title}</p>
      {content?.trim() ? (
        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">{content}</p>
      ) : (
        <p className="text-xs italic text-slate-400">Мэдээлэл байхгүй</p>
      )}
    </div>
  );
}

function donationDate(donation: DonationDetail) {
  return new Date(donation.paidAt ?? donation.createdAt).toLocaleString("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function donorLabel(donation: DonationDetail) {
  return donation.user?.name ?? "Зочин дэмжигч";
}

/* ── Main modal ──────────────────────────────────────────────────── */
export function ProjectDetailModal({ projectId, onClose, onDecide, acting }: Props) {
  const [detail, setDetail]       = useState<ProjectDetail | null>(null);
  const [loadSt, setLoadSt]       = useState<"loading" | "ok" | "error">("loading");
  const [showReject, setShowRej]  = useState(false);
  const [reason, setReason]       = useState("");

  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      setLoadSt("loading");
      fetch(`/admin-api/projects/${projectId}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(d => {
          if (cancelled) return;
          setDetail(d.project);
          setLoadSt("ok");
        })
        .catch(() => {
          if (!cancelled) setLoadSt("error");
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [projectId]);

  /* Close on Escape */
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleApprove() {
    if (!detail) return;
    await onDecide(detail.id, "approve");
    onClose();
  }

  async function handleReject() {
    if (!detail) return;
    await onDecide(detail.id, "reject", reason.trim() || undefined);
    onClose();
  }

  const isPending = detail?.status === "PENDING";
  const st = detail ? (STATUS_MAP[detail.status] ?? STATUS_MAP.PENDING) : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 py-8">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Sticky header ─────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-white rounded-t-3xl">
          {st && (
            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0", st.bg, st.text)}>
              {st.label}
            </span>
          )}
          <h2 className="flex-1 font-bold text-slate-900 text-base truncate min-w-0">
            {detail?.title ?? "Төслийн дэлгэрэнгүй"}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Loading */}
          {loadSt === "loading" && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Error */}
          {loadSt === "error" && (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <AlertTriangle className="w-10 h-10 text-red-400 mb-3" strokeWidth={1.5} />
              <p className="font-bold text-slate-900 mb-1">Мэдээлэл ачааллахад алдаа гарлаа</p>
              <p className="text-sm text-slate-400 mb-5">Дахин оролдоно уу.</p>
              <button
                onClick={() => { setLoadSt("loading"); fetch(`/admin-api/projects/${projectId}`).then(r => r.ok ? r.json() : Promise.reject()).then(d => { setDetail(d.project); setLoadSt("ok"); }).catch(() => setLoadSt("error")); }}
                className="flex items-center gap-2 bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl"
              >
                <RefreshCw className="w-4 h-4" />
                Дахин ачаалах
              </button>
            </div>
          )}

          {/* Content */}
          {loadSt === "ok" && detail && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

              {/* ── Left: Story + Rewards + Bank ────────────────── */}
              <div className="lg:col-span-2 p-6 space-y-7">

                {/* Cover image */}
                {detail.coverImage && (
                  <FullImageFrame
                    src={detail.coverImage}
                    alt={detail.title}
                    className="h-72 w-full sm:h-80"
                  />
                )}

                {(detail.galleryImages.length > 0 || detail.videoUrl) && (
                  <Section icon={ImageIcon} title="Кампанийн медиа">
                    <div className="space-y-3">
                      {detail.videoUrl && (
                        <a
                          href={detail.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:border-blue-300"
                        >
                          <span className="min-w-0 truncate">Видео холбоос: {detail.videoUrl}</span>
                          <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={2} />
                        </a>
                      )}
                      {detail.galleryImages.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {detail.galleryImages.map((image, index) => (
                            <div key={`${image}-${index}`} className="space-y-1.5">
                              <FullImageFrame
                                src={image}
                                alt={`${detail.title} зураг ${index + 1}`}
                                className="h-44"
                              />
                              <p className="text-[11px] font-semibold text-slate-400">
                                Зураг {index + 1}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Section>
                )}

                {/* Description */}
                <Section icon={FolderKanban} title="Товч тайлбар">
                  <p className="text-sm text-slate-600 leading-relaxed">{detail.description}</p>
                </Section>

                {/* Full story */}
                <Section icon={BookOpen} title="Бүтэн түүх / Хэрхэн зарцуулах">
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap border border-slate-100 rounded-xl p-4 bg-slate-50">
                    {detail.story || <span className="italic text-slate-400">Мэдээлэл байхгүй</span>}
                  </div>
                </Section>

                {detail.storyBlocks.length > 0 && (
                  <Section icon={BookOpen} title={`Зурагтай дэлгэрэнгүй мэдээлэл (${detail.storyBlocks.length})`}>
                    <div className="space-y-4">
                      {detail.storyBlocks.map((block, index) => (
                        <article key={block.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                          <FullImageFrame
                            src={block.image}
                            alt={block.title}
                            className="h-56"
                          />
                          <div className="p-4">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
                              Дэлгэрэнгүй #{index + 1}
                            </p>
                            <h4 className="mt-1 text-sm font-black text-slate-950">{block.title}</h4>
                            {block.caption && (
                              <p className="mt-2 text-xs font-semibold text-slate-500">{block.caption}</p>
                            )}
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{block.body}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </Section>
                )}

                <Section icon={FileText} title="Дэлгэрэнгүй хэсгүүд">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailTextCard title="Төслийн зорилго" content={detail.purpose} />
                    <DetailTextCard title="Хөрөнгийн ашиглалт" content={detail.fundingUsage} />
                    <DetailTextCard title="Багийн тухай" content={detail.teamInfo} />
                    <DetailTextCard title="Эрсдэлүүд болон сорилтууд" content={detail.risks} />
                  </div>
                </Section>

                {detail.faq.length > 0 && (
                  <Section icon={HelpCircle} title={`FAQ (${detail.faq.length})`}>
                    <div className="space-y-2.5">
                      {detail.faq.map((item, index) => (
                        <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="text-[11px] font-bold text-blue-700">Асуулт #{index + 1}</p>
                          <h4 className="mt-1 text-sm font-bold text-slate-950">{item.question}</h4>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {detail.timeline.length > 0 && (
                  <Section icon={Clock} title={`Timeline (${detail.timeline.length})`}>
                    <div className="space-y-3">
                      {detail.timeline.map((item, index) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-700 text-[11px] font-bold text-white">
                              {index + 1}
                            </span>
                            {index < detail.timeline.length - 1 && <span className="h-full w-px bg-slate-200" />}
                          </div>
                          <div className="pb-3">
                            <h4 className="text-sm font-bold text-slate-950">{item.title}</h4>
                            <p className="mt-1 text-xs font-semibold text-slate-400">{formatTimelineDate(item.date)}</p>
                            {item.description && (
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {socialLinkItems(detail.socialLinks).length > 0 && (
                  <Section icon={Link2} title="Төслийн холбоосууд">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {socialLinkItems(detail.socialLinks).map((link) => (
                        <a
                          key={link.key}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50"
                        >
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-slate-900">{link.label}</span>
                            <span className="block truncate text-xs text-slate-400">{link.display}</span>
                          </span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                        </a>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Reward tiers */}
                {detail.rewards.length > 0 && (
                  <Section icon={Award} title="Шагналын үе шат (Хөрөнгийн хуваарилалт)">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {detail.rewards.map(r => (
                        <div key={r.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                          {r.image ? (
                            <FullImageFrame
                              src={r.image}
                              alt={r.title}
                              className="h-40 rounded-none border-0"
                            />
                          ) : (
                            <div className="flex h-24 items-center justify-center bg-blue-600">
                              <span className="text-white text-sm font-bold">{formatMNT(r.amount)}</span>
                            </div>
                          )}
                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-bold text-slate-900">{r.title}</span>
                              <span className="shrink-0 text-sm font-black text-blue-700">{formatMNT(r.amount)}</span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-500">{r.description}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                              <span>Хүргэлт: {r.estimatedDelivery}</span>
                              <span>{r.backerCount} дэмжигч</span>
                              {r.isLimited && r.remaining !== null && (
                                <span className="text-amber-600 font-semibold">
                                  {r.remaining} үлдсэн
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Bank info — critical for verification */}
                <Section icon={Building2} title="Банкны мэдээлэл (Баталгаажуулалтад)">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2.5">
                    <InfoRow label="Банк" value={
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {detail.bankName}
                      </span>
                    } />
                    <InfoRow label="Дансны дугаар" value={
                      <span className="flex items-center gap-1.5 font-mono">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {detail.bankAccount}
                      </span>
                    } />
                    <InfoRow label="Дансны нэр" value={detail.bankAccountName} />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Баталгаажуулахаасаа өмнө банкны мэдээллийг бүтээгчтэй тулгана уу.
                  </p>
                </Section>

              </div>

              {/* ── Right: Creator + Stats ───────────────────────── */}
              <div className="p-6 space-y-6 bg-slate-50/50 lg:rounded-r-3xl">

                {/* Creator card */}
                <Section icon={User} title="Бүтээгчийн мэдээлэл">
                  <div className="space-y-3">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {detail.creator.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{detail.creator.name}</p>
                        {detail.creator.isVerified && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                            Баталгаажсан
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-2 pt-1">
                      {detail.creator.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="break-all">{detail.creator.email}</span>
                        </div>
                      )}
                      {detail.creator.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{detail.creator.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          Бүртгүүлсэн: {new Date(detail.creator.createdAt).toLocaleDateString("mn-MN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <FolderKanban className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{detail.creator._count.projects} төсөл нийтлэлтэй</span>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Project stats */}
                <Section icon={Banknote} title="Санхүүжилтийн мэдээлэл">
                  <div className="space-y-2.5">
                    <InfoRow label="Зорилго" value={`${detail.goal.toLocaleString()}₮`} />
                    <InfoRow label="Цугласан" value={`${detail.raised.toLocaleString()}₮`} />
                    <InfoRow label="Дэмжигч" value={`${detail.backers} хүн`} />
                    <InfoRow label="Хандивлалт" value={`${detail._count.donations} удаа`} />
                    {detail.goal > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Явц</span>
                          <span className="font-bold text-slate-600">
                            {Math.min(100, Math.round((detail.raised / detail.goal) * 100))}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (detail.raised / detail.goal) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Section>

                <Section icon={CreditCard} title="Дэмжсэн хүмүүс">
                  {detail.donations.length > 0 ? (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700 font-semibold">
                        Нийт {detail._count.donations} баталгаажсан дэмжлэг ·{" "}
                        {formatMNT(detail.donations.reduce((sum, donation) => sum + donation.amount, 0))}
                      </div>
                      {detail.donations.map((donation) => (
                        <div key={donation.id} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {donorLabel(donation)}
                              </p>
                              <p className="text-xs text-slate-400">
                                {donationDate(donation)}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-black text-blue-700">
                              {formatMNT(donation.amount)}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1 text-xs text-slate-500">
                            {donation.user?.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span>{donation.user.phone}</span>
                              </div>
                            )}
                            {donation.user?.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3 w-3 text-slate-400" />
                                <span className="truncate">{donation.user.email}</span>
                              </div>
                            )}
                            {donation.rewardTier && (
                              <div className="flex items-center gap-1.5">
                                <Award className="h-3 w-3 text-slate-400" />
                                <span className="truncate">{donation.rewardTier.title}</span>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-500">
                                {donation.paymentMethod}
                              </span>
                              {donation.qpayPaymentId && (
                                <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                                  {donation.qpayPaymentId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Одоогоор төлбөр нь баталгаажсан дэмжлэг алга.
                      </p>
                    </div>
                  )}
                </Section>

                {/* Project meta */}
                <Section icon={Clock} title="Төслийн мэдээлэл">
                  <div className="space-y-2.5">
                    <InfoRow
                      label="Категори"
                      value={
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {detail.category}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Байршил"
                      value={
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {detail.location}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Дуусах огноо"
                      value={new Date(detail.endsAt).toLocaleDateString("mn-MN")}
                    />
                    <InfoRow
                      label="Илгээсэн"
                      value={new Date(detail.createdAt).toLocaleDateString("mn-MN")}
                    />
                  </div>
                </Section>

                {/* Documents section */}
                <Section icon={FileText} title="Баримт бичиг">
                  {detail.documents.length > 0 ? (
                    <div className="space-y-2">
                      {detail.documents.map((document, index) => (
                        <a
                          key={`${document}-${index}`}
                          href={document}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                            <FileText className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-slate-900">
                              Баримт {index + 1}
                            </span>
                            <span className="block truncate text-xs text-slate-400">
                              {documentName(document, index)}
                            </span>
                          </span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Баримт бичиг хавсаргаагүй байна.
                      </p>
                    </div>
                  )}
                </Section>

              </div>
            </div>
          )}
        </div>

        {/* ── Sticky action footer (only for PENDING) ────────────── */}
        {loadSt === "ok" && detail && isPending && (
          <div className="sticky bottom-0 border-t border-slate-100 bg-white rounded-b-3xl px-6 py-4">

            {showReject ? (
              /* Reject with reason */
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Татгалзах шалтгаан (заавал биш)
                </label>
                <textarea
                  autoFocus
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Жишээ нь: Мэдээлэл дутуу, баримт бичиг байхгүй..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReject}
                    disabled={acting}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {acting
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <XCircle className="w-4 h-4" />
                    }
                    Татгалзах
                  </button>
                  <button
                    onClick={() => { setShowRej(false); setReason(""); }}
                    className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Цуцлах
                  </button>
                </div>
              </div>
            ) : (
              /* Approve / Reject buttons */
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleApprove}
                  disabled={acting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {acting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />
                  }
                  Батлах
                </button>
                <button
                  onClick={() => setShowRej(true)}
                  disabled={acting}
                  className="flex items-center gap-2 border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Татгалзах
                </button>
                <button
                  onClick={onClose}
                  className="ml-auto text-sm text-slate-400 hover:text-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Хаах
                </button>
              </div>
            )}
          </div>
        )}

        {/* Close button for non-pending projects */}
        {loadSt === "ok" && detail && !isPending && (
          <div className="border-t border-slate-100 px-6 py-4 flex justify-end bg-white rounded-b-3xl">
            <button
              onClick={onClose}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Хаах
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
