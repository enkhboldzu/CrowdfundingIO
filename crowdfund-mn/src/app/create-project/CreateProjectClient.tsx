"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Gift,
  ImagePlus,
  Info,
  Loader2,
  Rocket,
  Send,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { createProject, updateOwnProject } from "@/lib/actions/projects";
import {
  ACCEPTED_DOCUMENT_INPUT,
  ACCEPTED_DOCUMENT_TYPE_SET,
  ACCEPTED_IMAGE_INPUT,
  ACCEPTED_IMAGE_TYPE_SET,
  MAX_DOCUMENT_UPLOAD_BYTES,
  MAX_DOCUMENT_UPLOAD_MB,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_MB,
} from "@/lib/upload";
import { uploadErrorMessage } from "@/lib/upload-client";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface RewardTier {
  id: string;
  title: string;
  amount: string;
  description: string;
  image: string;
}

interface SelectedProjectImage {
  id: string;
  preview: string;
  url: string;
}

interface SelectedProjectDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface StoryBlock {
  id: string;
  title: string;
  body: string;
  image: string;
  caption: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface TimelineItem {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface SocialLinks {
  website: string;
  facebook: string;
  instagram: string;
  discord: string;
  twitter: string;
}

export interface EditableProjectSeed {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  category: string;
  location: string;
  goal: number;
  duration: number;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  story: string;
  videoUrl?: string | null;
  images: string[];
  documents: string[];
  storyBlocks?: Array<{
    id?: string | null;
    title: string;
    body: string;
    image?: string | null;
    caption?: string | null;
  }>;
  faq?: Array<{ id?: string | null; question: string; answer: string }>;
  timeline?: Array<{ id?: string | null; title: string; date: string; description: string }>;
  socialLinks?: {
    website?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    discord?: string | null;
    twitter?: string | null;
  };
  rewards: Array<{
    id: string;
    title: string;
    amount: number;
    description: string;
    image?: string | null;
  }>;
}

interface FormValues {
  title: string;
  blurb: string;
  category: string;
  location: string;
  goal: string;
  duration: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  story: string;
  videoUrl: string;
  storyBlocks: StoryBlock[];
  faq: FaqItem[];
  timeline: TimelineItem[];
  socialLinks: SocialLinks;
  rewards: RewardTier[];
}

type StringKey = keyof Omit<FormValues, "rewards" | "storyBlocks" | "faq" | "timeline" | "socialLinks">;
type ErrMap = Record<string, string>;

/* ── Constants ──────────────────────────────────────────────────────────── */

const MAX_PROJECT_IMAGES = 8;
const MAX_PROJECT_DOCUMENTS = 5;
const MIN_STORY_BLOCKS = 4;
const MAX_STORY_BLOCKS = 10;
const MIN_PROJECT_GOAL = 10;
const MIN_REWARD_AMOUNT = 10;

function isSupportedVideoUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.toLowerCase();
    return (
      host === "youtu.be" ||
      host.endsWith("youtube.com") ||
      host.endsWith("vimeo.com") ||
      /\.(mp4|webm|mov|m4v)$/.test(path)
    );
  } catch {
    return false;
  }
}

const CATEGORIES = [
  { value: "", label: "Ангилал сонгоно уу..." },
  { value: "technology", label: "Технологи & Гаджет" },
  { value: "arts", label: "Бүтээлч урлаг" },
  { value: "film", label: "Кино & Видео" },
  { value: "environment", label: "Байгаль & Ногоон эрчим хүч" },
  { value: "games", label: "Тоглоом" },
  { value: "health", label: "Эрүүл мэнд & Сайн сайхан" },
  { value: "education", label: "Боловсрол" },
  { value: "community", label: "Нийгмийн төсөл" },
  { value: "food", label: "Хоол & Ундаа" },
  { value: "fashion", label: "Загвар хувцас" },
  { value: "music", label: "Хөгжим" },
  { value: "publishing", label: "Хэвлэл & Ном" },
];

const DURATIONS = [
  { value: "", label: "Хугацаа сонгоно уу..." },
  { value: "7", label: "7 хоног" },
  { value: "14", label: "14 хоног" },
  { value: "21", label: "21 хоног" },
  { value: "30", label: "30 хоног — санал болгох" },
  { value: "45", label: "45 хоног" },
  { value: "60", label: "60 хоног" },
];

const BANKS = [
  { value: "", label: "Банк сонгоно уу..." },
  { value: "khan", label: "Хаан банк" },
  { value: "golomt", label: "Голомт банк" },
  { value: "xac", label: "Хас банк" },
  { value: "state", label: "Төрийн банк" },
  { value: "capitron", label: "Капитрон банк" },
  { value: "most", label: "Мост мани банк" },
  { value: "arig", label: "Ариг банк" },
];

const STEPS = [
  { num: 1, label: "Үндсэн", short: "Гарчиг, ангилал", icon: Sparkles },
  { num: 2, label: "Санхүүжилт", short: "Дүн, данс", icon: WalletCards },
  { num: 3, label: "Түүх", short: "Story, FAQ", icon: BookOpenText },
  { num: 4, label: "Медиа", short: "Зураг, видео", icon: ImagePlus },
  { num: 5, label: "Урамшуулал", short: "Reward cards", icon: Gift },
];

const STEP_HEADINGS = [
  "Кампанийн нүүрээ бэлдэх",
  "Санхүүжилтээ тодорхойлох",
  "Түүх, story blocks, FAQ, timeline",
  "Видео, зураг, баримт",
  "Дэмжигчдэд өгөх үнэ цэн",
];

const STEP_DESCRIPTIONS = [
  "Гарчиг, tagline, ангилал нь project card болон detail hero дээр шууд харагдана.",
  "Зорилтот дүн, хугацаа, банкны мэдээлэл тодорхой байх тусам баталгаажуулалт хурдан явна.",
  "Markdown тайлбар, story blocks, FAQ, timeline болон социал холбоосоо нэмнэ.",
  "Кампанийн зургийн цомог, танилцуулга видео болон баримт бичгийг хавсаргана.",
  "Сайн урамшуулал нь дэмжигчид оролцож байгаа мэдрэмж өгдөг.",
];

const STEP_TIPS = [
  ["Гарчиг богино, шууд ойлгогдох байвал сайн.", "Tagline дээр хэнд ямар үнэ цэн өгөхөө бич.", "Байршил нь итгэл нэмдэг жижиг detail."],
  ["Зорилтот дүнгээ бодит хэрэгцээнд тулгуурла.", "30 хоног ихэнх кампанид тохиромжтой.", "Дансны нэр яг банк дээрхтэй адил байх ёстой."],
  ["Эхлэл, асуудал, шийдэл, багийн тухайгаа дарааллаар бич.", "Story block бүр зураг + гарчиг + тайлбартай байх ёстой.", "FAQ, timeline нь заавал биш ч итгэл нэмнэ."],
  ["Эхний зураг project card дээр cover болно.", "Видео заавал биш, гэхдээ богино байвал хүчтэй.", "Баримт бичиг админ шалгалтад тусална."],
  ["Reward бүр зурагтай байвал илүү татдаг.", "Дэмжигч яг юу авах нь тодорхой байх хэрэгтэй.", "Дүнг багаас их рүү логиктой байрлуул."],
];

function emptyStoryBlock(index: number): StoryBlock {
  return { id: `sb-${index}-${Date.now()}`, title: "", body: "", image: "", caption: "" };
}

function initialStoryBlocks(): StoryBlock[] {
  return Array.from({ length: MIN_STORY_BLOCKS }, (_, index) => emptyStoryBlock(index));
}

function emptyFaqItem(index: number): FaqItem {
  return { id: `faq-${index}-${Date.now()}`, question: "", answer: "" };
}

function emptyTimelineItem(index: number): TimelineItem {
  return { id: `tl-${index}-${Date.now()}`, title: "", date: "", description: "" };
}

const EMPTY_SOCIAL: SocialLinks = { website: "", facebook: "", instagram: "", discord: "", twitter: "" };

const EMPTY: FormValues = {
  title: "", blurb: "", category: "", location: "",
  goal: "", duration: "", bankName: "", bankAccount: "", bankAccountName: "",
  story: "", videoUrl: "",
  storyBlocks: initialStoryBlocks(),
  faq: [],
  timeline: [],
  socialLinks: { ...EMPTY_SOCIAL },
  rewards: [{ id: "r1", title: "", amount: "", description: "", image: "" }],
};

function formValuesFromSeed(seed?: EditableProjectSeed): FormValues {
  if (!seed) {
    return {
      ...EMPTY,
      storyBlocks: initialStoryBlocks(),
      faq: [],
      timeline: [],
      socialLinks: { ...EMPTY_SOCIAL },
      rewards: [{ id: "r1", title: "", amount: "", description: "", image: "" }],
    };
  }

  const seededStoryBlocks = seed.storyBlocks?.length
    ? seed.storyBlocks.slice(0, MAX_STORY_BLOCKS).map((b, i) => ({
        id: b.id || `sb-${i}`,
        title: b.title,
        body: b.body,
        image: b.image ?? "",
        caption: b.caption ?? "",
      }))
    : [];
  const paddedStoryBlocks = seededStoryBlocks.length > 0
    ? [
        ...seededStoryBlocks,
        ...Array.from(
          { length: Math.max(0, MIN_STORY_BLOCKS - seededStoryBlocks.length) },
          (_, index) => emptyStoryBlock(seededStoryBlocks.length + index)
        ),
      ]
    : initialStoryBlocks();

  return {
    title: seed.title,
    blurb: seed.blurb,
    category: seed.category,
    location: seed.location,
    goal: String(seed.goal),
    duration: String(seed.duration),
    bankName: seed.bankName,
    bankAccount: seed.bankAccount,
    bankAccountName: seed.bankAccountName,
    story: seed.story,
    videoUrl: seed.videoUrl ?? "",
    storyBlocks: paddedStoryBlocks,
    faq: seed.faq?.length
      ? seed.faq.map((f, i) => ({
          id: f.id || `faq-${i}`,
          question: f.question,
          answer: f.answer,
        }))
      : [],
    timeline: seed.timeline?.length
      ? seed.timeline.map((t, i) => ({
          id: t.id || `tl-${i}`,
          title: t.title,
          date: t.date,
          description: t.description,
        }))
      : [],
    socialLinks: {
      website: seed.socialLinks?.website ?? "",
      facebook: seed.socialLinks?.facebook ?? "",
      instagram: seed.socialLinks?.instagram ?? "",
      discord: seed.socialLinks?.discord ?? "",
      twitter: seed.socialLinks?.twitter ?? "",
    },
    rewards: seed.rewards.length > 0
      ? seed.rewards.map((r) => ({
          id: r.id,
          title: r.title,
          amount: String(r.amount),
          description: r.description,
          image: r.image ?? "",
        }))
      : EMPTY.rewards,
  };
}

function imagesFromSeed(seed?: EditableProjectSeed): SelectedProjectImage[] {
  return (seed?.images ?? []).map((url, i) => ({
    id: `existing-${i}-${url}`,
    preview: url,
    url,
  }));
}

function documentsFromSeed(seed?: EditableProjectSeed): SelectedProjectDocument[] {
  return (seed?.documents ?? []).map((url, i) => {
    const filename = (() => {
      try {
        const u = new URL(url, "https://crowdfund.local");
        return u.pathname.split("/").filter(Boolean).pop() ?? `document-${i + 1}`;
      } catch {
        return `document-${i + 1}`;
      }
    })();
    return { id: `existing-doc-${i}-${url}`, name: filename, size: 0, type: "", url };
  });
}

/* ── Validation ─────────────────────────────────────────────────────────── */

function validate(step: number, d: FormValues, projectImages: SelectedProjectImage[]): ErrMap {
  const e: ErrMap = {};

  if (step === 1) {
    if (!d.title.trim()) e.title = "Төслийн нэр заавал бөглөх шаардлагатай";
    else if (d.title.trim().length < 5) e.title = "Нэр хэтэрхий богино (хамгийн багадаа 5 тэмдэгт)";
    if (!d.blurb.trim()) e.blurb = "Товч тайлбар заавал бөглөх шаардлагатай";
    else if (d.blurb.trim().length < 20) e.blurb = "Тайлбар хэтэрхий богино (хамгийн багадаа 20 тэмдэгт)";
    if (!d.category) e.category = "Ангилал сонгоно уу";
    if (!d.location.trim()) e.location = "Байршил заавал бөглөх шаардлагатай";
  }

  if (step === 2) {
    if (!d.goal) e.goal = "Санхүүжилтийн зорилго заавал бөглөх шаардлагатай";
    else if (isNaN(Number(d.goal)) || Number(d.goal) < MIN_PROJECT_GOAL)
      e.goal = "Хамгийн бага зорилго ₮10 байна";
    if (!d.duration) e.duration = "Хугацаа сонгоно уу";
    if (!d.bankName) e.bankName = "Банк сонгоно уу";
    if (!d.bankAccount.trim()) e.bankAccount = "Дансны дугаар заавал бөглөх шаардлагатай";
    else if (!/^\d{8,16}$/.test(d.bankAccount.replace(/\s/g, "")))
      e.bankAccount = "Дансны дугаар буруу (8–16 тоон тэмдэгт)";
    if (!d.bankAccountName.trim()) e.bankAccountName = "Данс эзэмшигчийн нэр заавал бөглөх шаардлагатай";
  }

  if (step === 3) {
    if (!d.story.trim()) e.story = "Дэлгэрэнгүй тайлбар заавал бөглөх шаардлагатай";
    else if (d.story.trim().length < 50) e.story = "Тайлбар хэтэрхий богино (хамгийн багадаа 50 тэмдэгт)";
    if (d.storyBlocks.length < MIN_STORY_BLOCKS) {
      e.storyBlocks = `Хамгийн багадаа ${MIN_STORY_BLOCKS} зурагтай мэдээллийн блок оруулна уу`;
    }
    if (d.storyBlocks.length > MAX_STORY_BLOCKS) {
      e.storyBlocks = `Хамгийн ихдээ ${MAX_STORY_BLOCKS} зурагтай мэдээллийн блок оруулна уу`;
    }
    d.storyBlocks.forEach((block, i) => {
      if (!block.image.trim()) e[`sbImage${i}`] = "Зураг оруулна уу";
      if (!block.title.trim()) e[`sbTitle${i}`] = "Гарчиг оруулна уу";
      else if (block.title.trim().length < 3) e[`sbTitle${i}`] = "Гарчиг арай богино байна";
      if (!block.body.trim()) e[`sbBody${i}`] = "Мэдээлэл оруулна уу";
      else if (block.body.trim().length < 20) e[`sbBody${i}`] = "Мэдээллээ арай дэлгэрэнгүй бичнэ үү";
    });
    d.faq.forEach((f, i) => {
      if (!f.question.trim()) e[`faqQ${i}`] = "Асуулт бичнэ үү";
      if (!f.answer.trim()) e[`faqA${i}`] = "Хариулт бичнэ үү";
    });
    d.timeline.forEach((t, i) => {
      if (!t.title.trim()) e[`tlTitle${i}`] = "Гарчиг бичнэ үү";
    });
  }

  if (step === 4) {
    if (projectImages.length === 0) e.coverImages = "1-8 зураг оруулна уу";
    if (d.videoUrl.trim() && !isSupportedVideoUrl(d.videoUrl))
      e.videoUrl = "YouTube, Vimeo эсвэл шууд MP4/WEBM видео линк оруулна уу";
  }

  if (step === 5) {
    d.rewards.forEach((r, i) => {
      if (!r.image.trim()) e[`ri${i}`] = "Урамшууллын зураг оруулна уу";
      if (!r.title.trim()) e[`rt${i}`] = "Урамшуулалын нэр оруулна уу";
      if (!r.amount) e[`ra${i}`] = "Дүн оруулна уу";
      else if (isNaN(Number(r.amount)) || Number(r.amount) < MIN_REWARD_AMOUNT)
        e[`ra${i}`] = "Хамгийн бага дүн ₮10";
      if (!r.description.trim()) e[`rd${i}`] = "Тайлбар оруулна уу";
    });
  }

  return e;
}

function getCompletionItems(d: FormValues, projectImages: SelectedProjectImage[]) {
  const storyBlocksReady =
    d.storyBlocks.length >= MIN_STORY_BLOCKS &&
    d.storyBlocks.every(block => block.image.trim() && block.title.trim() && block.body.trim().length >= 20);

  const rewardsReady =
    d.rewards.length > 0 &&
    d.rewards.every(reward =>
      reward.image.trim() &&
      reward.title.trim() &&
      Number(reward.amount) >= MIN_REWARD_AMOUNT &&
      reward.description.trim()
    );

  return [
    {
      label: "Үндсэн мэдээлэл",
      done: Boolean(d.title.trim() && d.blurb.trim() && d.category && d.location.trim()),
    },
    {
      label: "Санхүүжилт ба данс",
      done: Boolean(d.goal && d.duration && d.bankName && d.bankAccount.trim() && d.bankAccountName.trim()),
    },
    {
      label: "Түүх ба story blocks",
      done: Boolean(d.story.trim().length >= 50 && storyBlocksReady),
    },
    {
      label: "Зураг, медиа",
      done: projectImages.length > 0,
    },
    {
      label: "Урамшуулал",
      done: rewardsReady,
    },
  ];
}

/* ── UI Primitives ──────────────────────────────────────────────────────── */

function Label({ htmlFor, children, required }: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-slate-400 mt-1.5">
      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
      </svg>
      {children}
    </p>
  );
}

function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1.5">
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  );
}

const base = [
  "w-full px-4 py-3 rounded-xl border text-sm text-slate-900",
  "placeholder:text-slate-400 transition-colors duration-150",
  "focus:outline-none focus:ring-2 focus:ring-offset-0",
].join(" ");
const ok = "border-slate-200 bg-white hover:border-blue-300 focus:ring-blue-500 focus:border-transparent";
const bad = "border-red-300 bg-red-50/60 focus:ring-red-400 focus:border-transparent";

function FInput({ id, type = "text", value, onChange, placeholder, error, prefix }: {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  prefix?: string;
}) {
  return (
    <div className={prefix ? "relative" : undefined}>
      {prefix && (
        <span className="absolute inset-y-0 left-4 flex items-center text-slate-500 text-sm font-semibold pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(base, error ? bad : ok, prefix && "pl-10")} />
    </div>
  );
}

function FSelect({ id, value, onChange, options, error }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="relative">
      <select id={id} value={value} onChange={e => onChange(e.target.value)}
        className={cn(base, error ? bad : ok, "pr-10 appearance-none cursor-pointer")}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 20 20">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 8l4 4 4-4" stroke="currentColor" />
        </svg>
      </span>
    </div>
  );
}

function FTextarea({ id, value, onChange, placeholder, error, rows = 6 }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <textarea id={id} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      className={cn(base, error ? bad : ok, "resize-y")} />
  );
}

/* ── Markdown Editor ────────────────────────────────────────────────────── */

function MarkdownEditor({ id, value, onChange, placeholder, error }: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insert(before: string, after = "", defaultText = "") {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || defaultText;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    setTimeout(() => {
      ta.focus();
      const cursor = start + before.length + selected.length;
      ta.setSelectionRange(cursor, cursor);
    }, 0);
  }

  function insertLine(prefix: string) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  }

  const toolBtn = "px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors";

  return (
    <div>
      <div className={cn(
        "flex flex-wrap gap-0.5 px-2 py-1.5 border border-b-0 rounded-t-xl bg-slate-50",
        error ? "border-red-300" : "border-slate-200"
      )}>
        <button type="button" onClick={() => insert("**", "**", "bold текст")} className={cn(toolBtn, "font-black")}>B</button>
        <button type="button" onClick={() => insertLine("## ")} className={toolBtn}>H2</button>
        <button type="button" onClick={() => insertLine("### ")} className={toolBtn}>H3</button>
        <div className="w-px h-5 bg-slate-200 self-center mx-1" />
        <button type="button" onClick={() => insertLine("- ")} className={toolBtn}>• Жагсаалт</button>
        <button type="button" onClick={() => insertLine("1. ")} className={toolBtn}>1. Дугаар</button>
        <div className="w-px h-5 bg-slate-200 self-center mx-1" />
        <button type="button" onClick={() => insert("[", "](https://)", "линк текст")} className={toolBtn}>Линк</button>
      </div>
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={9}
        className={cn(
          base, error ? bad : ok, "resize-y rounded-t-none",
          "font-mono text-sm"
        )}
      />
    </div>
  );
}

/* ── SingleImageUpload ──────────────────────────────────────────────────── */

function SingleImageUpload({ id, value, onChange, emptyLabel = "Зураг оруулах", badgeLabel = "Зураг" }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  emptyLabel?: string;
  badgeLabel?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPE_SET.has(file.type)) { setLocalError("Зөвхөн PNG, JPG, WEBP зураг оруулна уу."); return; }
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) { setLocalError(`Нэг зураг ${MAX_IMAGE_UPLOAD_MB} MB-аас их байна.`); return; }
    setLocalError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await uploadErrorMessage(res));
      const json = await res.json() as { url: string };
      onChange(json.url);
    } catch (err) {
      setLocalError(err instanceof Error && err.message !== "Upload failed" ? err.message : "Зураг upload хийхэд алдаа гарлаа.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input ref={ref} id={id} type="file" accept={ACCEPTED_IMAGE_INPUT} disabled={uploading} className="hidden" onChange={handleFileSelect} />
      {value ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
          <div className="relative aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/85 to-transparent p-3">
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-700">{badgeLabel}</span>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm disabled:opacity-60">Солих</button>
                <button type="button" onClick={() => onChange("")} disabled={uploading} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm disabled:opacity-60">Устгах</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="grid aspect-[4/3] w-full place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition hover:border-blue-300 hover:bg-blue-50/50 disabled:opacity-70">
          <span>
            <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 19.5h16.5A1.5 1.5 0 0021.75 18V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
              </svg>
            </span>
            <span className="block text-sm font-bold text-slate-700">{uploading ? "Зураг хуулж байна..." : emptyLabel}</span>
            <span className="mt-1 block text-xs text-slate-400">PNG, JPG, WEBP</span>
          </span>
        </button>
      )}
      <ErrMsg msg={localError ?? undefined} />
    </div>
  );
}

/* ── GalleryUpload (1-8 images) ─────────────────────────────────────────── */

type UploadMode = { type: "append" } | { type: "replaceAll" } | { type: "replaceOne"; index: number };

function GalleryUpload({ images, error, uploading, onChange, onUploadingChange }: {
  images: SelectedProjectImage[];
  error?: string;
  uploading: boolean;
  onChange: (images: SelectedProjectImage[]) => void;
  onUploadingChange: (v: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const modeRef = useRef<UploadMode>({ type: "append" });
  const [localError, setLocalError] = useState<string | null>(null);

  function openPicker(mode: UploadMode) {
    modeRef.current = mode;
    ref.current?.click();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const mode = modeRef.current;
    modeRef.current = { type: "append" };
    const maxFiles = mode.type === "replaceOne" ? 1 : mode.type === "replaceAll" ? MAX_PROJECT_IMAGES : MAX_PROJECT_IMAGES - images.length;
    const files = Array.from(e.target.files ?? []);
    let nextError: string | null = null;
    const valid = files.filter(f => {
      if (!ACCEPTED_IMAGE_TYPE_SET.has(f.type)) { nextError ??= "Зөвхөн PNG, JPG, WEBP зураг оруулна уу."; return false; }
      if (f.size > MAX_IMAGE_UPLOAD_BYTES) { nextError ??= `Нэг зураг ${MAX_IMAGE_UPLOAD_MB} MB-аас их байна.`; return false; }
      return true;
    });
    setLocalError(nextError);
    e.target.value = "";
    const toUpload = valid.slice(0, maxFiles);
    if (!toUpload.length) return;
    onUploadingChange(true);
    try {
      const uploaded = await Promise.all(toUpload.map(async file => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await uploadErrorMessage(res));
        const json = await res.json() as { url: string };
        return { id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, preview: json.url, url: json.url };
      }));
      if (mode.type === "replaceAll") onChange(uploaded.slice(0, MAX_PROJECT_IMAGES));
      else if (mode.type === "replaceOne") onChange(images.map((img, i) => i === mode.index ? uploaded[0] : img));
      else onChange([...images, ...uploaded].slice(0, MAX_PROJECT_IMAGES));
    } catch (err) {
      setLocalError(err instanceof Error && err.message !== "Upload failed" ? err.message : "Зураг upload хийхэд алдаа гарлаа.");
    } finally {
      onUploadingChange(false);
    }
  }

  function handleRemove(id: string) {
    onChange(images.filter(img => img.id !== id));
  }

  function handleMakeCover(i: number) {
    if (i <= 0) return;
    onChange([images[i], ...images.filter((_, ci) => ci !== i)]);
  }

  const displayError = localError ?? error;

  return (
    <>
      <input ref={ref} id="galleryUpload" type="file" multiple accept={ACCEPTED_IMAGE_INPUT} disabled={uploading} className="hidden" onChange={handleFileSelect} />
      {uploading && <p className="mb-2 text-xs font-semibold text-blue-600 animate-pulse">Зураг хуулж байна...</p>}
      {images.length > 0 ? (
        <div className={cn("rounded-2xl border-2 overflow-hidden bg-slate-50", displayError ? "border-red-300" : "border-emerald-200")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0].preview} alt="Нүүр зураг" className="w-full h-56 object-cover" />
          <div className="p-3">
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group/thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <span className="absolute left-1 top-1 rounded-full bg-blue-700 px-1.5 py-0.5 text-[9px] font-bold text-white">{i === 0 ? "Нүүр" : i + 1}</span>
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                    {i > 0 && (
                      <button type="button" onClick={() => handleMakeCover(i)} className="w-full rounded bg-white/90 py-0.5 text-[10px] font-bold text-blue-700">Нүүр</button>
                    )}
                    <button type="button" onClick={() => openPicker({ type: "replaceOne", index: i })} disabled={uploading} className="w-full rounded bg-white/90 py-0.5 text-[10px] font-bold text-slate-700">Солих</button>
                    <button type="button" onClick={() => handleRemove(img.id)} disabled={uploading} className="w-full rounded bg-red-600 py-0.5 text-[10px] font-bold text-white">Устгах</button>
                  </div>
                </div>
              ))}
              {images.length < MAX_PROJECT_IMAGES && (
                <button type="button" onClick={() => openPicker({ type: "append" })} disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-blue-500">
                  <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-[10px] font-bold">Нэмэх</span>
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-emerald-700">{images.length} / {MAX_PROJECT_IMAGES} зураг</span>
              <button type="button" onClick={() => openPicker({ type: "replaceAll" })} disabled={uploading} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Бүгдийг солих</button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => openPicker({ type: "append" })} disabled={uploading}
          className={cn("w-full border-2 border-dashed rounded-2xl p-10 text-center transition-all group", displayError ? "border-red-300 bg-red-50/40" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30")}>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">1–{MAX_PROJECT_IMAGES} зураг оруулахын тулд дарна уу</p>
            <p className="text-xs text-slate-400">PNG, JPG, WEBP · нэг зураг {MAX_IMAGE_UPLOAD_MB} MB хүртэл</p>
          </div>
        </button>
      )}
      <ErrMsg msg={displayError} />
    </>
  );
}

/* ── DocumentUpload ─────────────────────────────────────────────────────── */

function formatFileSize(size: number): string {
  if (size <= 0) return "Хадгалсан файл";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentUpload({ documents, error, uploading, onChange, onUploadingChange }: {
  documents: SelectedProjectDocument[];
  error?: string;
  uploading: boolean;
  onChange: (docs: SelectedProjectDocument[]) => void;
  onUploadingChange: (v: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const remaining = MAX_PROJECT_DOCUMENTS - documents.length;
    const files = Array.from(e.target.files ?? []);
    let nextError: string | null = null;
    const valid = files.filter(f => {
      if (!ACCEPTED_DOCUMENT_TYPE_SET.has(f.type)) { nextError ??= "PDF, DOC, DOCX, PNG, JPG, WEBP баримт оруулна уу."; return false; }
      if (f.size > MAX_DOCUMENT_UPLOAD_BYTES) { nextError ??= `Нэг файл ${MAX_DOCUMENT_UPLOAD_MB} MB-аас их байна.`; return false; }
      return true;
    });
    setLocalError(nextError);
    e.target.value = "";
    const toUpload = valid.slice(0, remaining);
    if (!toUpload.length) return;
    onUploadingChange(true);
    try {
      const uploaded = await Promise.all(toUpload.map(async file => {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload/document", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await uploadErrorMessage(res));
        const json = await res.json() as { url: string; name?: string; size?: number; type?: string };
        return { id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, name: json.name ?? file.name, size: json.size ?? file.size, type: json.type ?? file.type, url: json.url };
      }));
      onChange([...documents, ...uploaded]);
    } catch (err) {
      setLocalError(err instanceof Error && err.message !== "Upload failed" ? err.message : "Баримт upload хийхэд алдаа гарлаа.");
    } finally {
      onUploadingChange(false);
    }
  }

  const displayError = localError ?? error;

  return (
    <>
      <input ref={ref} id="projectDocuments" type="file" multiple accept={ACCEPTED_DOCUMENT_INPUT} disabled={uploading} className="hidden" onChange={handleFileSelect} />
      {uploading && <p className="mb-2 text-xs font-semibold text-blue-600">Баримт хуулж байна...</p>}
      {documents.length > 0 ? (
        <div className={cn("rounded-2xl border bg-slate-50 p-3 space-y-2", displayError ? "border-red-300" : "border-slate-200")}>
          {documents.map((doc, i) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v6h6" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{i + 1}. {doc.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(doc.size)}</p>
              </div>
              <button type="button" onClick={() => onChange(documents.filter(d => d.id !== doc.id))} className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700">Устгах</button>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <span className="text-xs font-semibold text-slate-500">{documents.length} / {MAX_PROJECT_DOCUMENTS} баримт</span>
            {documents.length < MAX_PROJECT_DOCUMENTS && (
              <button type="button" onClick={() => ref.current?.click()} disabled={uploading} className="text-xs font-bold text-blue-600 hover:text-blue-800">Баримт нэмэх</button>
            )}
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className={cn("w-full rounded-2xl border-2 border-dashed px-4 py-5 text-left transition-colors", displayError ? "border-red-300 bg-red-50/60" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40")}>
          <span className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-800">Баримт бичиг хавсаргах</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">PDF, DOC, DOCX эсвэл зураг · нэг файл {MAX_DOCUMENT_UPLOAD_MB} MB хүртэл.</span>
            </span>
          </span>
        </button>
      )}
      <ErrMsg msg={displayError ?? undefined} />
    </>
  );
}

/* ── Stepper (5 steps) ──────────────────────────────────────────────────── */

function Stepper({ current }: { current: number }) {
  const currentStep = STEPS[current - 1];
  const CurrentIcon = currentStep.icon;

  return (
    <div className="mb-6">
      <div className="sm:hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <CurrentIcon className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Алхам {current} / {STEPS.length}</p>
              <p className="mt-0.5 truncate text-base font-black text-slate-950">{currentStep.label}</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{Math.round((current / STEPS.length) * 100)}%</span>
        </div>
        <div className="mt-4 flex gap-1">
          {STEPS.map(s => (
            <div key={s.num} className={cn("h-1.5 flex-1 rounded-full transition-colors", s.num <= current ? "bg-blue-700" : "bg-slate-200")} />
          ))}
        </div>
      </div>

      <div className="hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:grid sm:grid-cols-5 sm:gap-2">
        {STEPS.map(s => {
          const Icon = s.icon;
          const active = s.num === current;
          const done = s.num < current;

          return (
            <div
              key={s.num}
              className={cn(
                "relative rounded-2xl border px-3 py-3 transition-colors",
                active
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : done
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-transparent bg-slate-50 text-slate-400",
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black",
                  active ? "bg-white text-blue-800 shadow-sm" : done ? "bg-white text-emerald-700 shadow-sm" : "bg-white text-slate-400",
                )}>
                {s.num < current ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <Icon className="h-4 w-4" strokeWidth={2.4} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{s.label}</p>
                  <p className="mt-0.5 truncate text-[11px] font-semibold opacity-70">{s.short}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 1 — Үндсэн мэдээлэл ──────────────────────────────────────────── */

function Step1({ d, set, e }: { d: FormValues; set: (k: StringKey, v: string) => void; e: ErrMap }) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title" required>Кампанийн гарчиг</Label>
        <FInput id="title" value={d.title} onChange={v => set("title", v)} placeholder="Жишээ: DreamFrame богино кино" error={e.title} />
        <ErrMsg msg={e.title} />
        {!e.title && <Hint>Project card болон detail дэлгэц дээр хамгийн томоор харагдана.</Hint>}
      </div>
      <div>
        <Label htmlFor="blurb" required>Tagline / товч тайлбар</Label>
        <FInput id="blurb" value={d.blurb} onChange={v => set("blurb", v)} placeholder="Нэг өгүүлбэрт: юуг, хэнд, яагаад бүтээж байна вэ?" error={e.blurb} />
        <ErrMsg msg={e.blurb} />
        {!e.blurb && <Hint>Hero болон project card дээр хамгийн түрүүнд уншигдана.</Hint>}
      </div>
      <div>
        <Label htmlFor="category" required>Ангилал</Label>
        <FSelect id="category" value={d.category} onChange={v => set("category", v)} options={CATEGORIES} error={e.category} />
        <ErrMsg msg={e.category} />
      </div>
      <div>
        <Label htmlFor="location" required>Байршил</Label>
        <FInput id="location" value={d.location} onChange={v => set("location", v)} placeholder="Жишээ нь: Улаанбаатар, Монгол" error={e.location} />
        <ErrMsg msg={e.location} />
        {!e.location && <Hint>Баг хаанаас ажиллаж байгааг бичнэ үү.</Hint>}
      </div>
    </div>
  );
}

/* ── Step 2 — Санхүүжилт ────────────────────────────────────────────────── */

function Step2({ d, set, e }: { d: FormValues; set: (k: StringKey, v: string) => void; e: ErrMap }) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="goal" required>Санхүүжилтийн зорилго</Label>
        <FInput id="goal" type="number" value={d.goal} onChange={v => set("goal", v)} placeholder="10" error={e.goal} prefix="₮" />
        <ErrMsg msg={e.goal} />
        {!e.goal && <Hint>Хэрэгжүүлэхэд үнэхээр хэрэгтэй дүнгээ тавь. Бодитой байх тусам итгэл төрнө.</Hint>}
      </div>
      <div>
        <Label htmlFor="duration" required>Кампанит ажлын хугацаа</Label>
        <FSelect id="duration" value={d.duration} onChange={v => set("duration", v)} options={DURATIONS} error={e.duration} />
        <ErrMsg msg={e.duration} />
        {!e.duration && <Hint>14–30 хоног ихэнх төсөлд тохиромжтой.</Hint>}
      </div>
      <div className="bg-slate-50 rounded-2xl p-5 space-y-5 border border-slate-100">
        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Банкны мэдээлэл
        </p>
        <div>
          <Label htmlFor="bankName" required>Банкны нэр</Label>
          <FSelect id="bankName" value={d.bankName} onChange={v => set("bankName", v)} options={BANKS} error={e.bankName} />
          <ErrMsg msg={e.bankName} />
        </div>
        <div>
          <Label htmlFor="bankAccount" required>Дансны дугаар</Label>
          <FInput id="bankAccount" value={d.bankAccount} onChange={v => set("bankAccount", v)} placeholder="1234567890" error={e.bankAccount} />
          <ErrMsg msg={e.bankAccount} />
        </div>
        <div>
          <Label htmlFor="bankAccountName" required>Данс эзэмшигчийн нэр</Label>
          <FInput id="bankAccountName" value={d.bankAccountName} onChange={v => set("bankAccountName", v)} placeholder="Данс дээрх нэртэй яг адил бичнэ" error={e.bankAccountName} />
          <ErrMsg msg={e.bankAccountName} />
          <Hint>Админ шалгахдаа энэ мэдээллийг тулгана.</Hint>
        </div>
      </div>
    </div>
  );
}

/* ── Story Blocks ───────────────────────────────────────────────────────── */

function StoryBlocksFields({ blocks, errors, setBlock, addBlock, removeBlock, moveUp, moveDown }: {
  blocks: StoryBlock[];
  errors: ErrMap;
  setBlock: (i: number, k: keyof StoryBlock, v: string) => void;
  addBlock: () => void;
  removeBlock: (i: number) => void;
  moveUp: (i: number) => void;
  moveDown: (i: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Дэлгэрэнгүй story</p>
          <h3 className="mt-1 font-display text-xl font-bold text-slate-950">4-10 зурагтай мэдээллийн блок</h3>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Төслийн доод хэсэгт дарааллаараа харагдах зураг, гарчиг, мэдээлэл. Хамгийн багадаа 4, ихдээ 10 блок оруулна.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{blocks.length} / {MAX_STORY_BLOCKS}</span>
      </div>

      <ErrMsg msg={errors.storyBlocks} />

      <div className="space-y-4">
        {blocks.map((block, i) => (
          <div key={block.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-4 py-3">
              <span className="text-xs font-bold text-blue-700">Блок #{i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition-colors" title="Дээш">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button type="button" onClick={() => moveDown(i)} disabled={i === blocks.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition-colors" title="Доош">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button type="button" onClick={() => removeBlock(i)} disabled={blocks.length <= MIN_STORY_BLOCKS}
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="Устгах">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="grid gap-4 p-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <Label htmlFor={`sbImg${i}`} required>Зураг</Label>
                <SingleImageUpload id={`sbImg${i}`} value={block.image} onChange={v => setBlock(i, "image", v)} emptyLabel="Story зураг оруулах" badgeLabel="Story зураг" />
                <ErrMsg msg={errors[`sbImage${i}`]} />
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`sbTitle${i}`} required>Гарчиг</Label>
                  <FInput id={`sbTitle${i}`} value={block.title} onChange={v => setBlock(i, "title", v)} placeholder="Жишээ: Туршилтын явц, эхний загвар..." error={errors[`sbTitle${i}`]} />
                  <ErrMsg msg={errors[`sbTitle${i}`]} />
                </div>
                <div>
                  <Label htmlFor={`sbBody${i}`} required>Мэдээлэл</Label>
                  <FTextarea id={`sbBody${i}`} value={block.body} onChange={v => setBlock(i, "body", v)} placeholder="Энэ зурагтай холбоотой дэлгэрэнгүй мэдээллээ бичнэ үү." error={errors[`sbBody${i}`]} rows={4} />
                  <ErrMsg msg={errors[`sbBody${i}`]} />
                </div>
                <div>
                  <Label htmlFor={`sbCaption${i}`}>Зургийн тайлбар</Label>
                  <FInput id={`sbCaption${i}`} value={block.caption} onChange={v => setBlock(i, "caption", v)} placeholder="Заавал биш. Зураг дээр харагдах 1 богино өгүүлбэр." />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {blocks.length < MAX_STORY_BLOCKS && (
        <button type="button" onClick={addBlock}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 py-4 text-sm font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Блок нэмэх
        </button>
      )}
    </div>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────────────── */

function FaqFields({ faq, errors, setFaq, addFaq, removeFaq }: {
  faq: FaqItem[];
  errors: ErrMap;
  setFaq: (i: number, k: keyof FaqItem, v: string) => void;
  addFaq: () => void;
  removeFaq: (i: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">FAQ</p>
        <h3 className="mt-1 font-display text-xl font-bold text-slate-950">Түгээмэл асуулт, хариулт</h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">Дэмжигчдийн гаргах асуулт, хариултыг эндээс нэмнэ. Заавал биш.</p>
      </div>
      <div className="space-y-4">
        {faq.map((f, i) => (
          <div key={f.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-4 py-2.5">
              <span className="text-xs font-bold text-emerald-700">Асуулт #{i + 1}</span>
              <button type="button" onClick={() => removeFaq(i)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <Label htmlFor={`faqQ${i}`} required>Асуулт</Label>
                <FInput id={`faqQ${i}`} value={f.question} onChange={v => setFaq(i, "question", v)} placeholder="Жишээ: Хэзээ хүргэлт хийх вэ?" error={errors[`faqQ${i}`]} />
                <ErrMsg msg={errors[`faqQ${i}`]} />
              </div>
              <div>
                <Label htmlFor={`faqA${i}`} required>Хариулт</Label>
                <FTextarea id={`faqA${i}`} value={f.answer} onChange={v => setFaq(i, "answer", v)} placeholder="Дэлгэрэнгүй хариулт бичнэ үү..." error={errors[`faqA${i}`]} rows={3} />
                <ErrMsg msg={errors[`faqA${i}`]} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {faq.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center mb-4">
          <p className="text-sm text-slate-500">FAQ одоохондоо хоосон байна</p>
        </div>
      )}
      <button type="button" onClick={addFaq}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-200 py-3.5 text-sm font-bold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        FAQ нэмэх
      </button>
    </div>
  );
}

/* ── Timeline ────────────────────────────────────────────────────────────── */

function TimelineFields({ timeline, errors, setTimeline, addTimeline, removeTimeline }: {
  timeline: TimelineItem[];
  errors: ErrMap;
  setTimeline: (i: number, k: keyof TimelineItem, v: string) => void;
  addTimeline: () => void;
  removeTimeline: (i: number) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Хуанли</p>
        <h3 className="mt-1 font-display text-xl font-bold text-slate-950">Төслийн timeline</h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">Прототип, бета, launch гэх мэт чухал үе шатуудыг нэмнэ. Заавал биш.</p>
      </div>
      <div className="space-y-3">
        {timeline.map((t, i) => (
          <div key={t.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-white px-4 py-2.5">
              <span className="text-xs font-bold text-violet-700">Milestone #{i + 1}</span>
              <button type="button" onClick={() => removeTimeline(i)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_160px]">
              <div>
                <Label htmlFor={`tlTitle${i}`} required>Нэр</Label>
                <FInput id={`tlTitle${i}`} value={t.title} onChange={v => setTimeline(i, "title", v)} placeholder="Жишээ: Прототип, Бета тест, Нийтлэл..." error={errors[`tlTitle${i}`]} />
                <ErrMsg msg={errors[`tlTitle${i}`]} />
              </div>
              <div>
                <Label htmlFor={`tlDate${i}`}>Огноо</Label>
                <FInput id={`tlDate${i}`} type="date" value={t.date} onChange={v => setTimeline(i, "date", v)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`tlDesc${i}`}>Тайлбар</Label>
                <FInput id={`tlDesc${i}`} value={t.description} onChange={v => setTimeline(i, "description", v)} placeholder="Энэ үе шатны зорилго, гол ажил..." />
              </div>
            </div>
          </div>
        ))}
      </div>
      {timeline.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center mb-4">
          <p className="text-sm text-slate-500">Timeline одоохондоо хоосон байна</p>
        </div>
      )}
      <button type="button" onClick={addTimeline}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-200 py-3.5 text-sm font-bold text-violet-700 transition hover:border-violet-400 hover:bg-violet-50">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Milestone нэмэх
      </button>
    </div>
  );
}

/* ── Social Links ───────────────────────────────────────────────────────── */

function SocialLinksFields({ links, setLink }: {
  links: SocialLinks;
  setLink: (k: keyof SocialLinks, v: string) => void;
}) {
  const fields: { key: keyof SocialLinks; label: string; placeholder: string; icon: React.ReactNode }[] = [
    { key: "website", label: "Вэбсайт", placeholder: "https://yourproject.com", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> },
    { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg> },
    { key: "discord", label: "Discord", placeholder: "https://discord.gg/yourserver", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg> },
    { key: "twitter", label: "X / Twitter", placeholder: "https://twitter.com/yourhandle", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Холбоос</p>
        <h3 className="mt-1 font-display text-xl font-bold text-slate-950">Нийгмийн сүлжээ & Вэбсайт</h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">Заавал биш. Дэмжигчид таны community-тэй холбогдоход тусална.</p>
      </div>
      <div className="space-y-4">
        {fields.map(({ key, label, placeholder, icon }) => (
          <div key={key}>
            <Label htmlFor={`social-${key}`}>{label}</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none">{icon}</span>
              <input
                id={`social-${key}`}
                type="url"
                value={links[key]}
                onChange={e => setLink(key, e.target.value)}
                placeholder={placeholder}
                className={cn(base, ok, "pl-10")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 3 — Түүх ──────────────────────────────────────────────────────── */

function Step3({ d, set, e, setBlock, addBlock, removeBlock, moveBlockUp, moveBlockDown, setFaq, addFaq, removeFaq, setTimeline, addTimeline, removeTimeline, setLink }: {
  d: FormValues;
  set: (k: StringKey, v: string) => void;
  e: ErrMap;
  setBlock: (i: number, k: keyof StoryBlock, v: string) => void;
  addBlock: () => void;
  removeBlock: (i: number) => void;
  moveBlockUp: (i: number) => void;
  moveBlockDown: (i: number) => void;
  setFaq: (i: number, k: keyof FaqItem, v: string) => void;
  addFaq: () => void;
  removeFaq: (i: number) => void;
  setTimeline: (i: number, k: keyof TimelineItem, v: string) => void;
  addTimeline: () => void;
  removeTimeline: (i: number) => void;
  setLink: (k: keyof SocialLinks, v: string) => void;
}) {
  const charCount = d.story.length;

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="story" required>Кампанийн тайлбар</Label>
        <MarkdownEditor
          id="story"
          value={d.story}
          onChange={v => set("story", v)}
          placeholder="Энэ санаа хаанаас эхэлсэн, хэнд хэрэгтэй, дэмжлэг авснаар юу өөрчлөгдөхийг бичээрэй.&#10;&#10;**Тод бичих** — ## Гарчиг — - Жагсаалт"
          error={e.story}
        />
        <div className="flex items-start justify-between mt-1.5">
          <ErrMsg msg={e.story} />
          <span className={cn("text-xs font-semibold ml-auto shrink-0", charCount >= 50 ? "text-emerald-600" : "text-slate-400")}>
            {charCount} / 50+ тэмдэгт
          </span>
        </div>
        {!e.story && <Hint>Toolbar ашиглан **bold**, ## гарчиг, - жагсаалт оруулж болно.</Hint>}
      </div>

      <StoryBlocksFields
        blocks={d.storyBlocks}
        errors={e}
        setBlock={setBlock}
        addBlock={addBlock}
        removeBlock={removeBlock}
        moveUp={moveBlockUp}
        moveDown={moveBlockDown}
      />

      <FaqFields faq={d.faq} errors={e} setFaq={setFaq} addFaq={addFaq} removeFaq={removeFaq} />

      <TimelineFields timeline={d.timeline} errors={e} setTimeline={setTimeline} addTimeline={addTimeline} removeTimeline={removeTimeline} />

      <SocialLinksFields links={d.socialLinks} setLink={setLink} />
    </div>
  );
}

/* ── Step 4 — Медиа ─────────────────────────────────────────────────────── */

function Step4({ d, set, e, projectImages, projectImagesUploading, onProjectImagesChange, onProjectImagesUploadingChange, projectDocuments, projectDocumentsUploading, onProjectDocumentsChange, onProjectDocumentsUploadingChange }: {
  d: FormValues;
  set: (k: StringKey, v: string) => void;
  e: ErrMap;
  projectImages: SelectedProjectImage[];
  projectImagesUploading: boolean;
  onProjectImagesChange: (images: SelectedProjectImage[]) => void;
  onProjectImagesUploadingChange: (v: boolean) => void;
  projectDocuments: SelectedProjectDocument[];
  projectDocumentsUploading: boolean;
  onProjectDocumentsChange: (docs: SelectedProjectDocument[]) => void;
  onProjectDocumentsUploadingChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="galleryUpload" required>Кампанийн зургийн цомог</Label>
        <GalleryUpload
          images={projectImages}
          error={e.coverImages}
          uploading={projectImagesUploading}
          onChange={onProjectImagesChange}
          onUploadingChange={onProjectImagesUploadingChange}
        />
        <Hint>1–{MAX_PROJECT_IMAGES} бодит зураг оруулна. Эхний зураг cover болон project card дээр харагдана.</Hint>
      </div>

      <div>
        <Label htmlFor="videoUrl">Богино танилцуулга видео линк</Label>
        <FInput id="videoUrl" value={d.videoUrl} onChange={v => set("videoUrl", v)}
          placeholder="https://youtube.com/watch?v=... эсвэл https://.../intro.mp4"
          error={e.videoUrl} />
        <ErrMsg msg={e.videoUrl} />
        <Hint>Заавал биш. YouTube, Vimeo, эсвэл шууд MP4/WEBM линк.</Hint>
      </div>

      <div>
        <Label htmlFor="projectDocuments">Баримт бичиг</Label>
        <DocumentUpload
          documents={projectDocuments}
          error={e.documents}
          uploading={projectDocumentsUploading}
          onChange={onProjectDocumentsChange}
          onUploadingChange={onProjectDocumentsUploadingChange}
        />
        <Hint>Гэрчилгээ, зөвшөөрөл, танилцуулга зэрэг итгэл нэмэх баримтаа хавсаргаж болно.</Hint>
      </div>
    </div>
  );
}

/* ── Step 5 — Урамшуулал ────────────────────────────────────────────────── */

function Step5({ d, e, setReward, addReward, removeReward }: {
  d: FormValues;
  e: ErrMap;
  setReward: (i: number, k: keyof RewardTier, v: string) => void;
  addReward: () => void;
  removeReward: (i: number) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500 leading-relaxed">
        Хүмүүс зөвхөн мөнгө өгөхөөс гадна таны ажилд оролцож байгаа мэдрэмж авахыг хүсдэг.{" "}
        <span className="text-slate-600 font-medium">Жишээ:</span>{" "}
        10₮ → нэрийг талархлын жагсаалтад оруулах, 50₮ → урьдчилсан эрх авах.
      </p>
      <div className="space-y-4">
        {d.rewards.map((r, i) => (
          <div key={r.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
              <span className="inline-flex text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">Урамшуулал #{i + 1}</span>
              {d.rewards.length > 1 && (
                <button type="button" onClick={() => removeReward(i)} className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Устгах
                </button>
              )}
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-[200px_minmax(0,1fr)]">
              <div>
                <Label htmlFor={`ri${i}`} required>Урамшууллын зураг</Label>
                <SingleImageUpload id={`ri${i}`} value={r.image} onChange={v => setReward(i, "image", v)} emptyLabel="Шагналын зураг оруулах" badgeLabel="Шагналын зураг" />
                <ErrMsg msg={e[`ri${i}`]} />
                <Hint>Бодит бүтээгдэхүүн, postcard, teaser зураг оруулбал сайн.</Hint>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
                  <div>
                    <Label htmlFor={`rt${i}`} required>Урамшууллын нэр</Label>
                    <FInput id={`rt${i}`} value={r.title} onChange={v => setReward(i, "title", v)} placeholder="Жишээ: Эрт дэмжигч" error={e[`rt${i}`]} />
                    <ErrMsg msg={e[`rt${i}`]} />
                  </div>
                  <div>
                    <Label htmlFor={`ra${i}`} required>Дэмжлэгийн дүн</Label>
                    <FInput id={`ra${i}`} type="number" value={r.amount} onChange={v => setReward(i, "amount", v)} placeholder="10" error={e[`ra${i}`]} prefix="₮" />
                    <ErrMsg msg={e[`ra${i}`]} />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`rd${i}`} required>Урамшууллын тайлбар</Label>
                  <FTextarea id={`rd${i}`} value={r.description} onChange={v => setReward(i, "description", v)} placeholder="Дэмжигч яг юу авах, хэзээ авахыг тодорхой бичнэ үү." error={e[`rd${i}`]} rows={4} />
                  <ErrMsg msg={e[`rd${i}`]} />
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Харагдах байдал</p>
                  <p className="mt-1 font-display text-xl font-bold text-slate-950">{r.amount ? `${r.amount}₮` : "Дүн"}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{r.title || "Урамшууллын нэр"}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{r.description || "Дэмжигчид авах зүйлээ эндээс ойлгоно."}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {d.rewards.length < 6 && (
        <button type="button" onClick={addReward}
          className="w-full border-2 border-dashed border-blue-200 rounded-2xl py-4 text-sm font-semibold text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Урамшуулал нэмэх
        </button>
      )}
    </div>
  );
}

/* ── Create Project Guide ───────────────────────────────────────────────── */

function CreateProjectGuide({
  step,
  data,
  projectImages,
  projectImagesUploading,
  projectDocumentsUploading,
}: {
  step: number;
  data: FormValues;
  projectImages: SelectedProjectImage[];
  projectImagesUploading: boolean;
  projectDocumentsUploading: boolean;
}) {
  const items = getCompletionItems(data, projectImages);
  const doneCount = items.filter(item => item.done).length;
  const percent = Math.round((doneCount / items.length) * 100);
  const current = STEPS[step - 1];
  const CurrentIcon = current.icon;
  const categoryLabel = data.category ? CATEGORIES.find(item => item.value === data.category)?.label : "";

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Бөглөлтийн явц</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{doneCount} / {items.length} хэсэг бэлэн</p>
          </div>
          <span className="text-2xl font-black text-blue-700">{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-700 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-4 space-y-2">
          {items.map(item => (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                item.done ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-300 ring-1 ring-slate-200",
              )}>
                {item.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
              <span className={cn("text-sm font-bold", item.done ? "text-slate-800" : "text-slate-400")}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
            <CurrentIcon className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Одоогийн алхам</p>
            <h3 className="mt-1 font-display text-lg font-black text-slate-950">{current.label}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{STEP_DESCRIPTIONS[step - 1]}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {STEP_TIPS[step - 1].map(tip => (
            <div key={tip} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
              <Info className="mt-1 h-3.5 w-3.5 shrink-0 text-blue-600" strokeWidth={2.4} />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Товч preview</p>
        <h3 className="mt-2 line-clamp-2 font-display text-lg font-black text-slate-950">
          {data.title || "Төслийн нэр хараахан ороогүй"}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {data.blurb || "Project card дээр харагдах богино тайлбар эндээс бүрдэнэ."}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <p className="font-bold text-slate-400">Ангилал</p>
            <p className="mt-1 truncate font-black text-slate-800">{categoryLabel || "Сонгоогүй"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <p className="font-bold text-slate-400">Зорилго</p>
            <p className="mt-1 truncate font-black text-slate-800">{data.goal ? `${Number(data.goal).toLocaleString("mn-MN")}₮` : "Оруулаагүй"}</p>
          </div>
        </div>
        {(projectImagesUploading || projectDocumentsUploading) && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Файл upload хийж байна
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── Success Screen ─────────────────────────────────────────────────────── */

function SuccessScreen({ title, editing }: { title: string; editing: boolean }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="h-10 w-10" strokeWidth={2.3} />
      </div>
      <h2 className="mb-3 font-display text-3xl font-black tracking-tight text-slate-950">
        {editing ? "Төсөл шинэчлэгдэж дахин илгээгдлээ!" : "Төсөл амжилттай илгээгдлээ!"}
      </h2>
      <p className="mx-auto mb-1 max-w-lg text-sm leading-6 text-slate-600">
        <span className="font-semibold">&ldquo;{title}&rdquo;</span>{" "}
        {editing ? "төсөл дахин хянуулахаар илгээгдлээ." : "төсөл хянуулахаар илгээгдлээ."}
      </p>
      <div className="my-8 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-left">
        <p className="mb-3 flex items-center gap-2 text-sm font-black text-blue-800">
          <Clock3 className="h-4 w-4" strokeWidth={2.4} />
          Дараагийн алхам
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            "Админ баг 24-48 цагийн дотор хянана.",
            "Батлагдвал төсөл автоматаар нийтлэгдэнэ.",
            "Засвар шаардвал профайлаас дахин илгээнэ.",
          ].map((item, index) => (
            <div key={item} className="rounded-2xl bg-white p-3 text-sm leading-6 text-slate-700 shadow-sm">
              <span className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-xs font-black text-white">{index + 1}</span>
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/profile?tab=projects" className={buttonVariants({ variant: "primary", size: "lg" })}>
          Миний төслүүд харах
          <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
        </Link>
        <Link href="/" className={buttonVariants({ variant: "secondary", size: "lg" })}>Нүүр хуудас руу буцах</Link>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */

export function CreateProjectClient({ initialProject }: { initialProject?: EditableProjectSeed }) {
  const editing = Boolean(initialProject);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormValues>(() => formValuesFromSeed(initialProject));
  const [errors, setErrors] = useState<ErrMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const [projectImages, setProjectImages] = useState<SelectedProjectImage[]>(() => imagesFromSeed(initialProject));
  const [projectImagesUploading, setProjectImagesUploading] = useState(false);
  const [projectDocuments, setProjectDocuments] = useState<SelectedProjectDocument[]>(() => documentsFromSeed(initialProject));
  const [projectDocumentsUploading, setProjectDocumentsUploading] = useState(false);

  function set(k: StringKey, v: string) {
    setData(d => ({ ...d, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  function setLink(k: keyof SocialLinks, v: string) {
    setData(d => ({ ...d, socialLinks: { ...d.socialLinks, [k]: v } }));
  }

  /* Story blocks */
  function setBlock(i: number, k: keyof StoryBlock, v: string) {
    setData(d => ({ ...d, storyBlocks: d.storyBlocks.map((b, ci) => ci === i ? { ...b, [k]: v } : b) }));
    const ek = k === "image" ? `sbImage${i}` : k === "title" ? `sbTitle${i}` : k === "body" ? `sbBody${i}` : "";
    if (ek && errors[ek]) setErrors(e => { const n = { ...e }; delete n[ek]; return n; });
  }
  function addBlock() {
    setData(d => (
      d.storyBlocks.length >= MAX_STORY_BLOCKS
        ? d
        : { ...d, storyBlocks: [...d.storyBlocks, emptyStoryBlock(d.storyBlocks.length)] }
    ));
  }
  function removeBlock(i: number) {
    setData(d => (
      d.storyBlocks.length <= MIN_STORY_BLOCKS
        ? d
        : { ...d, storyBlocks: d.storyBlocks.filter((_, ci) => ci !== i) }
    ));
  }
  function moveBlockUp(i: number) {
    if (i <= 0) return;
    setData(d => {
      const next = [...d.storyBlocks];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return { ...d, storyBlocks: next };
    });
  }
  function moveBlockDown(i: number) {
    setData(d => {
      if (i >= d.storyBlocks.length - 1) return d;
      const next = [...d.storyBlocks];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return { ...d, storyBlocks: next };
    });
  }

  /* FAQ */
  function setFaq(i: number, k: keyof FaqItem, v: string) {
    setData(d => ({ ...d, faq: d.faq.map((f, ci) => ci === i ? { ...f, [k]: v } : f) }));
    const ek = k === "question" ? `faqQ${i}` : k === "answer" ? `faqA${i}` : "";
    if (ek && errors[ek]) setErrors(e => { const n = { ...e }; delete n[ek]; return n; });
  }
  function addFaq() {
    setData(d => ({ ...d, faq: [...d.faq, emptyFaqItem(d.faq.length)] }));
  }
  function removeFaq(i: number) {
    setData(d => ({ ...d, faq: d.faq.filter((_, ci) => ci !== i) }));
  }

  /* Timeline */
  function setTimeline(i: number, k: keyof TimelineItem, v: string) {
    setData(d => ({ ...d, timeline: d.timeline.map((t, ci) => ci === i ? { ...t, [k]: v } : t) }));
    const ek = k === "title" ? `tlTitle${i}` : "";
    if (ek && errors[ek]) setErrors(e => { const n = { ...e }; delete n[ek]; return n; });
  }
  function addTimeline() {
    setData(d => ({ ...d, timeline: [...d.timeline, emptyTimelineItem(d.timeline.length)] }));
  }
  function removeTimeline(i: number) {
    setData(d => ({ ...d, timeline: d.timeline.filter((_, ci) => ci !== i) }));
  }

  /* Rewards */
  function setReward(i: number, k: keyof RewardTier, v: string) {
    setData(d => ({ ...d, rewards: d.rewards.map((r, ci) => ci === i ? { ...r, [k]: v } : r) }));
    const ek =
      k === "image" ? `ri${i}` :
      k === "title" ? `rt${i}` :
      k === "amount" ? `ra${i}` :
      k === "description" ? `rd${i}` :
      "";
    if (ek && errors[ek]) setErrors(e => { const n = { ...e }; delete n[ek]; return n; });
  }
  function addReward() {
    setData(d => ({ ...d, rewards: [...d.rewards, { id: String(Date.now()), title: "", amount: "", description: "", image: "" }] }));
  }
  function removeReward(i: number) {
    setData(d => ({ ...d, rewards: d.rewards.filter((_, ci) => ci !== i) }));
  }

  function handleProjectImagesChange(images: SelectedProjectImage[]) {
    setProjectImages(images);
    if (errors.coverImages) setErrors(e => { const n = { ...e }; delete n.coverImages; return n; });
  }

  async function handleNext() {
    if (submitting) return;
    const errs = validate(step, data, projectImages);
    if (step === 4 && projectImagesUploading) errs.coverImages = "Зураг upload хийж байна. Түр хүлээнэ үү.";
    if (step === 4 && projectDocumentsUploading) errs.documents = "Баримт upload хийж байна. Түр хүлээнэ үү.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setErrors({});
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (step < STEPS.length) {
      setStep(s => s + 1);
      return;
    }

    setSubmitting(true);
    const uploadedImages = projectImages.map(img => img.url).filter(Boolean);
    const uploadedDocuments = projectDocuments.map(doc => doc.url).filter(Boolean);

    if (uploadedImages.length === 0) {
      setSubmitting(false);
      setErrors({ submit: "Зураг upload хийгдээгүй байна. Медиа хэсэгт дахин зураг сонгоно уу." });
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const payload = {
      title: data.title,
      blurb: data.blurb,
      category: data.category,
      location: data.location,
      goal: Number(data.goal),
      duration: Number(data.duration),
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      bankAccountName: data.bankAccountName,
      story: data.story,
      videoUrl: data.videoUrl,
      coverImage: uploadedImages[0],
      galleryImages: uploadedImages,
      documents: uploadedDocuments,
      storyBlocks: data.storyBlocks.map(b => ({ id: b.id, title: b.title, body: b.body, image: b.image, caption: b.caption })),
      faq: data.faq.map(f => ({ id: f.id, question: f.question, answer: f.answer })),
      timeline: data.timeline.map(t => ({ id: t.id, title: t.title, date: t.date, description: t.description })),
      socialLinks: data.socialLinks,
      rewards: data.rewards.map(r => ({ title: r.title, amount: Number(r.amount), description: r.description, image: r.image })),
    };

    const result = editing && initialProject
      ? await updateOwnProject({ projectId: initialProject.id, ...payload })
      : await createProject(payload);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setErrors({ submit: result.error ?? "Алдаа гарлаа. Дахин оролдоно уу." });
    }
  }

  function handleBack() {
    setErrors({});
    setStep(s => s - 1);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 pt-16">
        <div className="border-b border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eaf2ff_100%)] py-10 sm:py-14">
          <div className="container-page">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-blue-700 shadow-sm">
                  {editing ? <FileCheck2 className="h-3.5 w-3.5" strokeWidth={2.4} /> : <Rocket className="h-3.5 w-3.5" strokeWidth={2.4} />}
                  {editing ? "Төсөл засах" : "Шинэ төсөл"}
                </span>
                <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                  {editing ? "Төслөө илүү тодорхой болгох" : "Төслөө эхлүүлэх"}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  {editing
                    ? "Зассан мэдээллээ илгээхээс өмнө алхам бүрийг дахин нягтлаарай."
                    : "Гарчиг, санхүүжилт, story, медиа, урамшууллаа нэг нэгээр нь бөглөөд админд хянуулаарай."}
                </p>
              </div>
              <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Товч процесс</p>
                <div className="mt-4 space-y-3">
                  {[
                    ["1", "Мэдээллээ бөглөх"],
                    ["2", "Зураг, reward нэмэх"],
                    ["3", "Админаар хянуулах"],
                  ].map(([num, label]) => (
                    <div key={num} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">{num}</span>
                      <span className="text-sm font-bold text-slate-700">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={topRef} className="container-page py-8 lg:py-12">
          <div className={cn("mx-auto", submitted ? "max-w-3xl" : "max-w-6xl")}>
            {submitted ? (
              <div className="animate-fade-up rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <SuccessScreen title={data.title} editing={editing} />
              </div>
            ) : (
              <>
                <Stepper current={step} />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,760px)_340px] lg:items-start">
                  <div key={step} className="animate-fade-up rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
                    <div className="mb-7 border-b border-slate-100 pb-6">
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">Алхам {step} / {STEPS.length}</p>
                      <h2 className="font-display text-2xl font-black tracking-tight text-slate-950">{STEP_HEADINGS[step - 1]}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{STEP_DESCRIPTIONS[step - 1]}</p>
                    </div>

                    {step === 1 && <Step1 d={data} set={set} e={errors} />}
                    {step === 2 && <Step2 d={data} set={set} e={errors} />}
                    {step === 3 && (
                      <Step3
                        d={data} set={set} e={errors}
                        setBlock={setBlock} addBlock={addBlock} removeBlock={removeBlock}
                        moveBlockUp={moveBlockUp} moveBlockDown={moveBlockDown}
                        setFaq={setFaq} addFaq={addFaq} removeFaq={removeFaq}
                        setTimeline={setTimeline} addTimeline={addTimeline} removeTimeline={removeTimeline}
                        setLink={setLink}
                      />
                    )}
                    {step === 4 && (
                      <Step4
                        d={data} set={set} e={errors}
                        projectImages={projectImages}
                        projectImagesUploading={projectImagesUploading}
                        onProjectImagesChange={handleProjectImagesChange}
                        onProjectImagesUploadingChange={setProjectImagesUploading}
                        projectDocuments={projectDocuments}
                        projectDocumentsUploading={projectDocumentsUploading}
                        onProjectDocumentsChange={setProjectDocuments}
                        onProjectDocumentsUploadingChange={setProjectDocumentsUploading}
                      />
                    )}
                    {step === 5 && (
                      <Step5 d={data} e={errors} setReward={setReward} addReward={addReward} removeReward={removeReward} />
                    )}

                    {errors.submit && (
                      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                        <ErrMsg msg={errors.submit} />
                      </div>
                    )}

                    <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
                      <div>
                        {step > 1 && (
                          <button type="button" onClick={handleBack} className={buttonVariants({ variant: "secondary", size: "md" })}>
                            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
                            Буцах
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={submitting}
                        className={cn(buttonVariants({ variant: "primary", size: "md" }), "min-w-[132px]")}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Илгээж байна
                          </>
                        ) : step === STEPS.length ? (
                          <>
                            {editing ? "Шинэчлэн илгээх" : "Илгээх"}
                            <Send className="h-4 w-4" strokeWidth={2.4} />
                          </>
                        ) : (
                          <>
                            Үргэлжлэх
                            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <CreateProjectGuide
                    step={step}
                    data={data}
                    projectImages={projectImages}
                    projectImagesUploading={projectImagesUploading}
                    projectDocumentsUploading={projectDocumentsUploading}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
