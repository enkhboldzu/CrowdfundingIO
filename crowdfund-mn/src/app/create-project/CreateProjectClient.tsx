"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Footer }           from "@/components/landing/Footer";
import { buttonVariants }   from "@/lib/button-variants";
import { cn }               from "@/lib/utils";
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
  id:          string;
  title:       string;
  amount:      string;
  description: string;
}

interface SelectedProjectImage {
  id:      string;
  preview: string;
  url:     string;
}

interface SelectedProjectDocument {
  id:   string;
  name: string;
  size: number;
  type: string;
  url:  string;
}

export interface EditableProjectSeed {
  id:              string;
  slug:            string;
  title:           string;
  blurb:           string;
  category:        string;
  location:        string;
  goal:            number;
  duration:        number;
  bankName:        string;
  bankAccount:     string;
  bankAccountName: string;
  story:           string;
  images:          string[];
  documents:       string[];
  rewards:         Array<{
    id:          string;
    title:       string;
    amount:      number;
    description: string;
  }>;
}

interface FormValues {
  title:           string;
  blurb:           string;
  category:        string;
  location:        string;
  goal:            string;
  duration:        string;
  bankName:        string;
  bankAccount:     string;
  bankAccountName: string;
  story:           string;
  coverImageName:  string;
  rewards:         RewardTier[];
}

type StringKey = keyof Omit<FormValues, "rewards">;
type ErrMap    = Record<string, string>;

const MAX_PROJECT_IMAGES = 3;
const MAX_PROJECT_DOCUMENTS = 5;
const MIN_PROJECT_GOAL = 10;
const MIN_REWARD_AMOUNT = 10;

/* ── Constants ──────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { value: "",             label: "Ангилал сонгоно уу..." },
  { value: "technology",  label: "💻  Технологи & Гаджет" },
  { value: "arts",        label: "🎨  Бүтээлч урлаг" },
  { value: "film",        label: "🎬  Кино & Видео" },
  { value: "environment", label: "🌿  Байгаль & Ногоон эрчим хүч" },
  { value: "games",       label: "🎮  Тоглоом" },
  { value: "health",      label: "❤️  Эрүүл мэнд & Сайн сайхан" },
  { value: "education",   label: "📚  Боловсрол" },
  { value: "community",   label: "🤝  Нийгмийн төсөл" },
  { value: "food",        label: "🍜  Хоол & Ундаа" },
  { value: "fashion",     label: "👗  Загвар хувцас" },
  { value: "music",       label: "🎵  Хөгжим" },
  { value: "publishing",  label: "📖  Хэвлэл & Ном" },
];

const DURATIONS = [
  { value: "",   label: "Хугацаа сонгоно уу..." },
  { value: "7",  label: "7 хоног" },
  { value: "14", label: "14 хоног" },
  { value: "21", label: "21 хоног" },
  { value: "30", label: "30 хоног — санал болгох" },
  { value: "45", label: "45 хоног" },
  { value: "60", label: "60 хоног" },
];

const BANKS = [
  { value: "",         label: "Банк сонгоно уу..." },
  { value: "khan",     label: "Хаан банк" },
  { value: "golomt",   label: "Голомт банк" },
  { value: "xac",      label: "Хас банк" },
  { value: "state",    label: "Төрийн банк" },
  { value: "capitron", label: "Капитрон банк" },
  { value: "most",     label: "Мост мани банк" },
  { value: "arig",     label: "Ариг банк" },
];

const STEPS = [
  { num: 1, label: "Үндсэн мэдээлэл" },
  { num: 2, label: "Санхүүжилт" },
  { num: 3, label: "Агуулга" },
  { num: 4, label: "Урамшуулал" },
];

const EMPTY: FormValues = {
  title: "", blurb: "", category: "", location: "",
  goal: "", duration: "", bankName: "", bankAccount: "", bankAccountName: "",
  story: "", coverImageName: "",
  rewards: [{ id: "r1", title: "", amount: "", description: "" }],
};

function formValuesFromSeed(seed?: EditableProjectSeed): FormValues {
  if (!seed) return EMPTY;

  return {
    title:           seed.title,
    blurb:           seed.blurb,
    category:        seed.category,
    location:        seed.location,
    goal:            String(seed.goal),
    duration:        String(seed.duration),
    bankName:        seed.bankName,
    bankAccount:     seed.bankAccount,
    bankAccountName: seed.bankAccountName,
    story:           seed.story,
    coverImageName:  "",
    rewards:         seed.rewards.length > 0
      ? seed.rewards.map((reward) => ({
          id:          reward.id,
          title:       reward.title,
          amount:      String(reward.amount),
          description: reward.description,
        }))
      : EMPTY.rewards,
  };
}

function imagesFromSeed(seed?: EditableProjectSeed): SelectedProjectImage[] {
  return (seed?.images ?? []).map((url, index) => ({
    id: `existing-image-${index}-${url}`,
    preview: url,
    url,
  }));
}

function fileNameFromUrl(src: string, index: number): string {
  try {
    const url = new URL(src, "https://crowdfund.local");
    const filename = url.pathname.split("/").filter(Boolean).pop();
    return filename ? decodeURIComponent(filename) : `document-${index + 1}`;
  } catch {
    return `document-${index + 1}`;
  }
}

function documentsFromSeed(seed?: EditableProjectSeed): SelectedProjectDocument[] {
  return (seed?.documents ?? []).map((url, index) => ({
    id:   `existing-document-${index}-${url}`,
    name: fileNameFromUrl(url, index),
    size: 0,
    type: "",
    url,
  }));
}

/* ── Validation ─────────────────────────────────────────────────────────── */

function validate(step: number, d: FormValues): ErrMap {
  const e: ErrMap = {};

  if (step === 1) {
    if (!d.title.trim())                                    e.title    = "Төслийн нэр заавал бөглөх шаардлагатай";
    else if (d.title.trim().length < 5)                     e.title    = "Нэр хэтэрхий богино (хамгийн багадаа 5 тэмдэгт)";
    if (!d.blurb.trim())                                    e.blurb    = "Товч тайлбар заавал бөглөх шаардлагатай";
    else if (d.blurb.trim().length < 20)                    e.blurb    = "Тайлбар хэтэрхий богино (хамгийн багадаа 20 тэмдэгт)";
    if (!d.category)                                        e.category = "Ангилал сонгоно уу";
    if (!d.location.trim())                                 e.location = "Байршил заавал бөглөх шаардлагатай";
  }

  if (step === 2) {
    if (!d.goal)                                            e.goal            = "Санхүүжилтийн зорилго заавал бөглөх шаардлагатай";
    else if (isNaN(Number(d.goal)) || Number(d.goal) < MIN_PROJECT_GOAL)
                                                            e.goal            = "Хамгийн бага зорилго ₮10 байна";
    if (!d.duration)                                        e.duration        = "Хугацаа сонгоно уу";
    if (!d.bankName)                                        e.bankName        = "Банк сонгоно уу";
    if (!d.bankAccount.trim())                              e.bankAccount     = "Дансны дугаар заавал бөглөх шаардлагатай";
    else if (!/^\d{8,16}$/.test(d.bankAccount.replace(/\s/g, "")))
                                                            e.bankAccount     = "Дансны дугаар буруу (8–16 тоон тэмдэгт)";
    if (!d.bankAccountName.trim())                          e.bankAccountName = "Данс эзэмшигчийн нэр заавал бөглөх шаардлагатай";
  }

  if (step === 3) {
    if (!d.story.trim())                                    e.story = "Дэлгэрэнгүй тайлбар заавал бөглөх шаардлагатай";
    else if (d.story.trim().length < 100)                   e.story = "Тайлбар хэтэрхий богино (хамгийн багадаа 100 тэмдэгт)";
  }

  if (step === 4) {
    d.rewards.forEach((r, i) => {
      if (!r.title.trim())      e[`rt${i}`] = "Урамшуулалын нэр оруулна уу";
      if (!r.amount)            e[`ra${i}`] = "Дүн оруулна уу";
      else if (isNaN(Number(r.amount)) || Number(r.amount) < MIN_REWARD_AMOUNT)
                                e[`ra${i}`] = "Хамгийн бага дүн ₮10";
      if (!r.description.trim()) e[`rd${i}`] = "Тайлбар оруулна уу";
    });
  }

  return e;
}

/* ── Primitive UI components ────────────────────────────────────────────── */

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
const ok  = "border-slate-200 bg-white hover:border-blue-300 focus:ring-blue-500 focus:border-transparent";
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
  const cls = cn(base, error ? bad : ok, prefix && "pl-10");
  return (
    <div className={prefix ? "relative" : undefined}>
      {prefix && (
        <span className="absolute inset-y-0 left-4 flex items-center text-slate-500 text-sm font-semibold pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input id={id} type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder} className={cls} />
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

/* ── Image upload with live preview ─────────────────────────────────────── */

interface ImageUploadProps {
  images: SelectedProjectImage[];
  error?: string;
  uploading: boolean;
  onChange: (images: SelectedProjectImage[]) => void;
  onUploadingChange: (uploading: boolean) => void;
}

type ImageUploadMode =
  | { type: "append" }
  | { type: "replaceAll" }
  | { type: "replaceOne"; index: number };

function ImageUpload({ images, error, uploading, onChange, onUploadingChange }: ImageUploadProps) {
  const ref = useRef<HTMLInputElement>(null);
  const uploadModeRef = useRef<ImageUploadMode>({ type: "append" });
  const [localError, setLocalError] = useState<string | null>(null);

  function openPicker(mode: ImageUploadMode) {
    uploadModeRef.current = mode;
    ref.current?.click();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const mode = uploadModeRef.current;
    uploadModeRef.current = { type: "append" };

    const maxFiles =
      mode.type === "replaceOne" ? 1 :
      mode.type === "replaceAll" ? MAX_PROJECT_IMAGES :
      MAX_PROJECT_IMAGES - images.length;
    const files = Array.from(e.target.files ?? []);
    let nextError: string | null = null;

    const validFiles = files.filter((file) => {
      if (!ACCEPTED_IMAGE_TYPE_SET.has(file.type)) {
        nextError ??= "Зөвхөн PNG, JPG, WEBP зураг оруулна уу.";
        return false;
      }

      if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        nextError ??= `Нэг зураг ${MAX_IMAGE_UPLOAD_MB} MB-аас их байна.`;
        return false;
      }

      return true;
    });

    setLocalError(nextError);
    e.target.value = "";

    const filesToUpload = validFiles.slice(0, maxFiles);
    if (filesToUpload.length === 0) return;

    onUploadingChange(true);

    try {
      const uploaded = await Promise.all(filesToUpload.map(async (file) => {
        const fd = new FormData();
        fd.append("file", file);

        try {
          const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
          if (!uploadRes.ok) {
            throw new Error(await uploadErrorMessage(uploadRes));
          }

          const json = await uploadRes.json() as { url: string };
          return {
            id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
            preview: json.url,
            url: json.url,
          };
        } catch (err) {
          throw err;
        }
      }));

      if (mode.type === "replaceAll") {
        images.forEach((image) => {
          if (image.preview.startsWith("blob:")) URL.revokeObjectURL(image.preview);
        });
        onChange(uploaded.slice(0, MAX_PROJECT_IMAGES));
      } else if (mode.type === "replaceOne") {
        const replaced = images[mode.index];
        if (replaced?.preview.startsWith("blob:")) URL.revokeObjectURL(replaced.preview);
        onChange(images.map((image, index) => index === mode.index ? uploaded[0] : image));
      } else {
        onChange([...images, ...uploaded].slice(0, MAX_PROJECT_IMAGES));
      }
    } catch (err) {
      const message = err instanceof Error && err.message !== "Upload failed"
        ? err.message
        : "Зураг upload хийхэд алдаа гарлаа. Дахин оролдоно уу.";
      setLocalError(message);
    } finally {
      onUploadingChange(false);
    }
  }

  function handleRemove(id: string) {
    const removed = images.find((image) => image.id === id);
    if (removed?.preview.startsWith("blob:")) URL.revokeObjectURL(removed.preview);
    onChange(images.filter((image) => image.id !== id));
  }

  function handleMakeCover(index: number) {
    if (index <= 0) return;
    const selected = images[index];
    onChange([selected, ...images.filter((_, currentIndex) => currentIndex !== index)]);
  }

  function handleClearAll() {
    images.forEach((image) => {
      if (image.preview.startsWith("blob:")) URL.revokeObjectURL(image.preview);
    });
    onChange([]);
  }

  const displayError = localError ?? error;

  return (
    <>
      <input
        ref={ref}
        id="coverImages"
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_INPUT}
        disabled={uploading}
        className="hidden"
        onChange={handleFileSelect}
      />

      {uploading && (
        <p className="mb-2 text-xs font-semibold text-blue-600">Зураг хуулж байна...</p>
      )}

      {images.length > 0 ? (
        /* ── Preview state ── */
        <div className={cn(
          "rounded-2xl border-2 bg-slate-50 p-3",
          displayError ? "border-red-300" : "border-emerald-200"
        )}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]?.preview ?? ""}
            alt="Нүүр зургийн урьдчилан харах"
            className="w-full h-52 object-cover"
          />
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-white">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100 group/thumb"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.preview} alt="" className="w-full h-full object-cover" />
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-bold text-white">
                    {index === 0 ? "Нүүр" : index + 1}
                  </span>
                  <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover/thumb:opacity-100 group-focus-within/thumb:opacity-100">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMakeCover(index)}
                        className="rounded-md bg-white/95 px-1.5 py-1 text-[10px] font-bold text-blue-700 shadow-sm"
                      >
                        Нүүр
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openPicker({ type: "replaceOne", index })}
                      disabled={uploading}
                      className="rounded-md bg-white/95 px-1.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm disabled:opacity-50"
                    >
                      Солих
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(image.id)}
                      disabled={uploading}
                      className="rounded-md bg-red-600 px-1.5 py-1 text-[10px] font-bold text-white shadow-sm disabled:opacity-50"
                    >
                      Устгах
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Footer bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border-t border-emerald-100">
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-semibold text-emerald-700 truncate">
                {images.length} / {MAX_PROJECT_IMAGES} зураг сонгосон
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {images.length < MAX_PROJECT_IMAGES && (
                <button
                  type="button"
                  onClick={() => openPicker({ type: "append" })}
                  disabled={uploading}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Зураг нэмэх
                </button>
              )}
              <button
                type="button"
                onClick={() => openPicker({ type: "replaceAll" })}
                disabled={uploading}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Зураг солих
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={uploading}
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
              >
                Бүгдийг устгах
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Empty / pick state ── */
        <button
          type="button"
          onClick={() => openPicker({ type: "append" })}
          disabled={uploading}
          className="w-full border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-2xl p-8 text-center transition-all duration-200 group"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">1-3 зураг оруулахын тулд дарна уу</p>
            <p className="text-xs text-slate-400">PNG, JPG, WEBP · нэг зураг {MAX_IMAGE_UPLOAD_MB} MB хүртэл</p>
          </div>
        </button>
      )}
      <ErrMsg msg={displayError} />
    </>
  );
}

interface DocumentUploadProps {
  documents: SelectedProjectDocument[];
  error?: string;
  uploading: boolean;
  onChange: (documents: SelectedProjectDocument[]) => void;
  onUploadingChange: (uploading: boolean) => void;
}

function formatFileSize(size: number): string {
  if (size <= 0) return "Хадгалсан файл";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function DocumentUpload({
  documents,
  error,
  uploading,
  onChange,
  onUploadingChange,
}: DocumentUploadProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const remaining = MAX_PROJECT_DOCUMENTS - documents.length;
    const files = Array.from(e.target.files ?? []);
    let nextError: string | null = null;

    const validFiles = files.filter((file) => {
      if (!ACCEPTED_DOCUMENT_TYPE_SET.has(file.type)) {
        nextError ??= "PDF, DOC, DOCX, PNG, JPG, WEBP баримт оруулна уу.";
        return false;
      }

      if (file.size > MAX_DOCUMENT_UPLOAD_BYTES) {
        nextError ??= `Нэг файл ${MAX_DOCUMENT_UPLOAD_MB} MB-аас их байна.`;
        return false;
      }

      return true;
    });

    setLocalError(nextError);
    e.target.value = "";

    const filesToUpload = validFiles.slice(0, remaining);
    if (filesToUpload.length === 0) return;

    onUploadingChange(true);

    try {
      const uploaded = await Promise.all(filesToUpload.map(async (file) => {
        const fd = new FormData();
        fd.append("file", file);

        const uploadRes = await fetch("/api/upload/document", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          throw new Error(await uploadErrorMessage(uploadRes));
        }

        const json = await uploadRes.json() as {
          url: string;
          name?: string;
          size?: number;
          type?: string;
        };

        return {
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
          name: json.name ?? file.name,
          size: json.size ?? file.size,
          type: json.type ?? file.type,
          url: json.url,
        };
      }));

      onChange([...documents, ...uploaded]);
    } catch (err) {
      const message = err instanceof Error && err.message !== "Upload failed"
        ? err.message
        : "Баримт upload хийхэд алдаа гарлаа. Дахин оролдоно уу.";
      setLocalError(message);
    } finally {
      onUploadingChange(false);
    }
  }

  function handleRemove(id: string) {
    onChange(documents.filter((document) => document.id !== id));
  }

  const displayError = localError ?? error;

  return (
    <>
      <input
        ref={ref}
        id="projectDocuments"
        type="file"
        multiple
        accept={ACCEPTED_DOCUMENT_INPUT}
        disabled={uploading}
        className="hidden"
        onChange={handleFileSelect}
      />

      {uploading && (
        <p className="mb-2 text-xs font-semibold text-blue-600">Баримт хуулж байна...</p>
      )}

      {documents.length > 0 ? (
        <div className={cn(
          "rounded-2xl border bg-slate-50 p-3 space-y-3",
          displayError ? "border-red-300" : "border-slate-200"
        )}>
          <div className="space-y-2">
            {documents.map((document, index) => (
              <div
                key={document.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2v6h6" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {index + 1}. {document.name}
                  </p>
                  <p className="text-xs text-slate-400">{formatFileSize(document.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(document.id)}
                  className="shrink-0 text-xs font-semibold text-red-500 hover:text-red-700"
                >
                  Устгах
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <span className="text-xs font-semibold text-slate-500">
              {documents.length} / {MAX_PROJECT_DOCUMENTS} баримт хавсаргасан
            </span>
            {documents.length < MAX_PROJECT_DOCUMENTS && (
              <button
                type="button"
                onClick={() => ref.current?.click()}
                disabled={uploading}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-60"
              >
                Баримт нэмэх
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full rounded-2xl border-2 border-dashed px-4 py-5 text-left transition-colors",
            displayError
              ? "border-red-300 bg-red-50/60"
              : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
          )}
        >
          <span className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-800">Баримт бичиг хавсаргах</span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                PDF, DOC, DOCX эсвэл зураг хэлбэрийн нотолгоо оруулна. Нэг файл {MAX_DOCUMENT_UPLOAD_MB} MB хүртэл.
              </span>
            </span>
          </span>
        </button>
      )}

      <ErrMsg msg={displayError ?? undefined} />
    </>
  );
}

/* ── Progress stepper ───────────────────────────────────────────────────── */

function Stepper({ current }: { current: number }) {
  return (
    <div className="mb-6">
      {/* Mobile — pill progress */}
      <div className="sm:hidden bg-white rounded-2xl px-5 py-4 shadow-card flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Алхам {current} / {STEPS.length}
          </p>
          <p className="text-base font-bold text-slate-900 mt-0.5">
            {STEPS[current - 1].label}
          </p>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map(s => (
            <div key={s.num} className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              s.num < current  ? "bg-blue-800 w-6" :
              s.num === current ? "bg-blue-600 w-10" :
              "bg-slate-200 w-6"
            )} />
          ))}
        </div>
      </div>

      {/* Desktop — circle stepper */}
      <div className="hidden sm:flex items-center bg-white rounded-2xl px-8 py-5 shadow-card">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex-1 flex items-center">
            <div className="flex flex-col items-center shrink-0">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300",
                s.num < current
                  ? "bg-blue-800 border-blue-800 text-white"
                  : s.num === current
                  ? "bg-white border-blue-800 text-blue-800 shadow-md"
                  : "bg-white border-slate-200 text-slate-400"
              )}>
                {s.num < current ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.num}
              </div>
              <span className={cn(
                "mt-2 text-xs font-semibold whitespace-nowrap",
                s.num === current ? "text-blue-800" :
                s.num < current  ? "text-slate-500" : "text-slate-400"
              )}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-3 mb-5">
                <div className={cn(
                  "h-0.5 rounded-full transition-all duration-500",
                  s.num < current ? "bg-blue-800" : "bg-slate-200"
                )} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Step 1 — Үндсэн мэдээлэл ───────────────────────────────────────────── */

function Step1({ d, set, e }: { d: FormValues; set: (k: StringKey, v: string) => void; e: ErrMap }) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title" required>Төслийн нэр</Label>
        <FInput id="title" value={d.title} onChange={v => set("title", v)}
          placeholder="Жишээ нь: Монгол AI туслагч апп" error={e.title} />
        <ErrMsg msg={e.title} />
        {!e.title && <Hint>Товч бөгөөд ойлгомжтой байх хэрэгтэй. Хамгийн ихдээ 60 тэмдэгт.</Hint>}
      </div>

      <div>
        <Label htmlFor="blurb" required>Товч тайлбар</Label>
        <FInput id="blurb" value={d.blurb} onChange={v => set("blurb", v)}
          placeholder="1–2 өгүүлбэрт төслийн мөн чанарыг гаргаарай" error={e.blurb} />
        <ErrMsg msg={e.blurb} />
        {!e.blurb && <Hint>Энэхүү тайлбар хайлтын үр дүн болон картын тайлбарт харагдана.</Hint>}
      </div>

      <div>
        <Label htmlFor="category" required>Ангилал</Label>
        <FSelect id="category" value={d.category} onChange={v => set("category", v)}
          options={CATEGORIES} error={e.category} />
        <ErrMsg msg={e.category} />
      </div>

      <div>
        <Label htmlFor="location" required>Байршил</Label>
        <FInput id="location" value={d.location} onChange={v => set("location", v)}
          placeholder="Жишээ нь: Улаанбаатар, Монгол" error={e.location} />
        <ErrMsg msg={e.location} />
        {!e.location && <Hint>Хот болон улсын нэрийг оруулна уу.</Hint>}
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
        <FInput id="goal" type="number" value={d.goal} onChange={v => set("goal", v)}
          placeholder="10" error={e.goal} prefix="₮" />
        <ErrMsg msg={e.goal} />
        {!e.goal && <Hint>Хамгийн бага зорилго ₮10. Бодитой тоо тавихад амжилтын магадлал нэмэгдэнэ.</Hint>}
      </div>

      <div>
        <Label htmlFor="duration" required>Кампанит ажлын хугацаа</Label>
        <FSelect id="duration" value={d.duration} onChange={v => set("duration", v)}
          options={DURATIONS} error={e.duration} />
        <ErrMsg msg={e.duration} />
        {!e.duration && <Hint>30 хоног нь дундажаар хамгийн үр дүнтэй хугацаа байдаг.</Hint>}
      </div>

      {/* Bank info card */}
      <div className="bg-slate-50 rounded-2xl p-5 space-y-5 border border-slate-100">
        <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Банкны мэдээлэл
        </p>

        <div>
          <Label htmlFor="bankName" required>Банкны нэр</Label>
          <FSelect id="bankName" value={d.bankName} onChange={v => set("bankName", v)}
            options={BANKS} error={e.bankName} />
          <ErrMsg msg={e.bankName} />
        </div>

        <div>
          <Label htmlFor="bankAccount" required>Дансны дугаар</Label>
          <FInput id="bankAccount" value={d.bankAccount} onChange={v => set("bankAccount", v)}
            placeholder="1234567890" error={e.bankAccount} />
          <ErrMsg msg={e.bankAccount} />
        </div>

        <div>
          <Label htmlFor="bankAccountName" required>Данс эзэмшигчийн нэр</Label>
          <FInput id="bankAccountName" value={d.bankAccountName}
            onChange={v => set("bankAccountName", v)}
            placeholder="Та нарын нэр" error={e.bankAccountName} />
          <ErrMsg msg={e.bankAccountName} />
          <Hint>Баталгаажуулалт ажлын 1–2 өдөрт дуусна.</Hint>
        </div>
      </div>
    </div>
  );
}

/* ── Step 3 — Агуулга ───────────────────────────────────────────────────── */

function Step3({
  d, set, e,
  projectImages, projectImagesUploading, onProjectImagesChange, onProjectImagesUploadingChange,
  projectDocuments, projectDocumentsUploading, onProjectDocumentsChange, onProjectDocumentsUploadingChange,
}: {
  d: FormValues;
  set: (k: StringKey, v: string) => void;
  e: ErrMap;
  projectImages: SelectedProjectImage[];
  projectImagesUploading: boolean;
  onProjectImagesChange: (images: SelectedProjectImage[]) => void;
  onProjectImagesUploadingChange: (uploading: boolean) => void;
  projectDocuments: SelectedProjectDocument[];
  projectDocumentsUploading: boolean;
  onProjectDocumentsChange: (documents: SelectedProjectDocument[]) => void;
  onProjectDocumentsUploadingChange: (uploading: boolean) => void;
}) {
  const charCount = d.story.length;
  const charOk    = charCount >= 100;

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="story" required>Төслийн тухай дэлгэрэнгүй</Label>
        <FTextarea id="story" value={d.story} onChange={v => set("story", v)}
          placeholder="Яагаад энэ төсөл хэрэгтэй вэ? Хэнд зориулсан бэ? Хэрхэн хэрэгжүүлэх вэ? ..."
          error={e.story} rows={9} />
        <div className="flex items-start justify-between mt-1.5">
          <ErrMsg msg={e.story} />
          <span className={cn(
            "text-xs font-semibold ml-auto shrink-0",
            charOk ? "text-emerald-600" : "text-slate-400"
          )}>
            {charCount} / 100+ тэмдэгт
          </span>
        </div>
        {!e.story && <Hint>Дэлгэрэнгүй, итгэл үнэмшилтэй тайлбар нь илүү олон дэмжигч татдаг.</Hint>}
      </div>

      <div>
        <Label htmlFor="coverImages" required>Төслийн зураг</Label>
        <ImageUpload
          images={projectImages}
          error={e.coverImages}
          uploading={projectImagesUploading}
          onChange={onProjectImagesChange}
          onUploadingChange={onProjectImagesUploadingChange}
        />
        <Hint>1-3 бодит зураг оруулна. Эхний зураг нүүрэнд гарч, карт дээр зургууд хажуу тийш гулсаж солигдоно.</Hint>
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
        <Hint>Админ шалгах үед гэрчилгээ, зөвшөөрөл, танилцуулга зэрэг нотолгоог эндээс үзнэ.</Hint>
      </div>
    </div>
  );
}

/* ── Step 4 — Урамшуулал ────────────────────────────────────────────────── */

function Step4({ d, e, setReward, addReward, removeReward }: {
  d: FormValues;
  e: ErrMap;
  setReward:    (i: number, k: keyof RewardTier, v: string) => void;
  addReward:    () => void;
  removeReward: (i: number) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500 leading-relaxed">
        Дэмжигчдэд санал болгох урамшуулалын түвшин нэмнэ үү.{" "}
        <span className="text-slate-600 font-medium">Жишээ нь:</span>{" "}
        ₮10,000 → &ldquo;Баярын захидал&rdquo;, ₮50,000 → &ldquo;Урьдчилсан захиалга&rdquo;.
      </p>

      <div className="space-y-4">
        {d.rewards.map((r, i) => (
          <div key={r.id} className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
                Урамшуулал #{i + 1}
              </span>
              {d.rewards.length > 1 && (
                <button type="button" onClick={() => removeReward(i)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Устгах
                </button>
              )}
            </div>

            <div>
              <Label htmlFor={`rt${i}`} required>Урамшуулалын нэр</Label>
              <FInput id={`rt${i}`} value={r.title} onChange={v => setReward(i, "title", v)}
                placeholder="Жишээ нь: Эрт дэмжигч" error={e[`rt${i}`]} />
              <ErrMsg msg={e[`rt${i}`]} />
            </div>

            <div>
              <Label htmlFor={`ra${i}`} required>Дэмжлэгийн дүн</Label>
              <FInput id={`ra${i}`} type="number" value={r.amount}
                onChange={v => setReward(i, "amount", v)}
                placeholder="10" error={e[`ra${i}`]} prefix="₮" />
              <ErrMsg msg={e[`ra${i}`]} />
            </div>

            <div>
              <Label htmlFor={`rd${i}`} required>Урамшуулалын тайлбар</Label>
              <FTextarea id={`rd${i}`} value={r.description}
                onChange={v => setReward(i, "description", v)}
                placeholder="Дэмжигч юу авах вэ? Хэзээ хүргэгдэх вэ?"
                error={e[`rd${i}`]} rows={3} />
              <ErrMsg msg={e[`rd${i}`]} />
            </div>
          </div>
        ))}
      </div>

      {d.rewards.length < 6 && (
        <button type="button" onClick={addReward}
          className="w-full border-2 border-dashed border-blue-200 rounded-2xl py-4 text-sm font-semibold text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Урамшуулал нэмэх
        </button>
      )}
    </div>
  );
}

/* ── Success screen ─────────────────────────────────────────────────────── */

function SuccessScreen({ title, editing }: { title: string; editing: boolean }) {
  return (
    <div className="text-center py-10 px-4 max-w-lg mx-auto">
      {/* Pending icon — clock, not checkmark */}
      <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </div>

      <h2 className="font-display font-bold text-2xl text-slate-900 mb-3">
        {editing ? "Төсөл шинэчлэгдэж дахин илгээгдлээ!" : "Төсөл амжилттай илгээгдлээ!"}
      </h2>

      <p className="text-slate-600 text-sm leading-relaxed mb-1">
        <span className="font-semibold">&ldquo;{title}&rdquo;</span>{" "}
        {editing ? "төсөл дахин хянуулахаар илгээгдлээ." : "төсөл хянуулахаар илгээгдлээ."}
      </p>

      {/* 24-48h review notice */}
      <div className="mt-5 mb-8 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-left space-y-2">
        <p className="text-sm font-bold text-amber-800">Дараагийн алхам</p>
        <ul className="text-sm text-amber-700 space-y-1.5 list-none">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500 font-bold">1.</span>
            Манай админ баг таны мэдээллийг <span className="font-semibold">24–48 цагийн</span> дотор хянана.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500 font-bold">2.</span>
            Батлагдвал таны төсөл автоматаар нийтлэгдэж дэмжигчдэд харагдана.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-500 font-bold">3.</span>
            Татгалзагдвал шалтгааныг мэдэгдэх тул засаад дахин илгээж болно.
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/profile?tab=projects" className={buttonVariants({ variant: "primary", size: "lg" })}>
          Миний төслүүд харах
        </Link>
        <Link href="/" className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Нүүр хуудас руу буцах
        </Link>
      </div>
    </div>
  );
}

/* ── Main export ────────────────────────────────────────────────────────── */

export function CreateProjectClient({ initialProject }: { initialProject?: EditableProjectSeed }) {
  const editing = Boolean(initialProject);
  const [step,        setStep]        = useState(1);
  const [data,        setData]        = useState<FormValues>(() => formValuesFromSeed(initialProject));
  const [errors,      setErrors]      = useState<ErrMap>({});
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const [projectImages, setProjectImages] = useState<SelectedProjectImage[]>(() => imagesFromSeed(initialProject));
  const [projectImagesUploading, setProjectImagesUploading] = useState(false);
  const [projectDocuments, setProjectDocuments] = useState<SelectedProjectDocument[]>(() => documentsFromSeed(initialProject));
  const [projectDocumentsUploading, setProjectDocumentsUploading] = useState(false);

  function handleProjectImagesChange(images: SelectedProjectImage[]) {
    setProjectImages(images);
    if (errors.coverImages) {
      setErrors((e) => {
        const n = { ...e };
        delete n.coverImages;
        return n;
      });
    }
  }

  function handleProjectDocumentsChange(documents: SelectedProjectDocument[]) {
    setProjectDocuments(documents);
    if (errors.documents) {
      setErrors((e) => {
        const n = { ...e };
        delete n.documents;
        return n;
      });
    }
  }

  /* Field setters */
  function set(k: StringKey, v: string) {
    setData(d => ({ ...d, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  }

  function setReward(i: number, k: keyof RewardTier, v: string) {
    setData(d => ({ ...d, rewards: d.rewards.map((r, idx) => idx === i ? { ...r, [k]: v } : r) }));
    const ek = k === "title" ? `rt${i}` : k === "amount" ? `ra${i}` : `rd${i}`;
    if (errors[ek]) setErrors(e => { const n = { ...e }; delete n[ek]; return n; });
  }

  function addReward() {
    setData(d => ({
      ...d,
      rewards: [...d.rewards, { id: String(Date.now()), title: "", amount: "", description: "" }],
    }));
  }

  function removeReward(i: number) {
    setData(d => ({ ...d, rewards: d.rewards.filter((_, idx) => idx !== i) }));
  }

  /* Navigation */
  async function handleNext() {
    if (submitting) return;

    const errs = validate(step, data);
    if (step === 3 && projectImages.length === 0) {
      errs.coverImages = "1-3 зураг оруулна уу";
    }
    if (step === 3 && projectImagesUploading) {
      errs.coverImages = "Зураг upload хийж байна. Түр хүлээнэ үү.";
    }
    if (step === 3 && projectDocumentsUploading) {
      errs.documents = "Баримт upload хийж байна. Түр хүлээнэ үү.";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setErrors({});
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (step < 4) {
      setStep(s => s + 1);
      return;
    }

    setSubmitting(true);

    const uploadedImages = projectImages
      .map((image) => image.url)
      .filter((url): url is string => Boolean(url));
    const uploadedDocuments = projectDocuments
      .map((document) => document.url)
      .filter((url): url is string => Boolean(url));

    if (uploadedImages.length === 0) {
      setSubmitting(false);
      setErrors({ submit: "Зураг upload хийгдээгүй байна. Дахин зураг сонгоно уу." });
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const payload = {
      title:           data.title,
      blurb:           data.blurb,
      category:        data.category,
      location:        data.location,
      goal:            Number(data.goal),
      duration:        Number(data.duration),
      bankName:        data.bankName,
      bankAccount:     data.bankAccount,
      bankAccountName: data.bankAccountName,
      story:           data.story,
      coverImage:      uploadedImages[0],
      galleryImages:   uploadedImages,
      documents:       uploadedDocuments,
      rewards:         data.rewards.map(r => ({
        title:       r.title,
        amount:      Number(r.amount),
        description: r.description,
      })),
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

  const stepHeadings = ["Үндсэн мэдээлэл", "Санхүүжилт", "Агуулга", "Урамшуулал"];

  return (
    <>
      <main className="min-h-screen bg-slate-50 pt-16">

        {/* ── Page hero ─────────────────────────────── */}
        <div className="gradient-brand-hero py-10 sm:py-14">
          <div className="container-page text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              {editing ? "Төсөл засах" : "🚀 Шинэ Төсөл"}
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
              {editing ? "Төслөө засварлах" : "Краудфандинг Кампани Эхлүүлэх"}
            </h1>
            <p className="text-blue-200 text-sm sm:text-base max-w-lg mx-auto">
              {editing
                ? "Мэдээллээ шинэчлээд төслөө дахин хянуулахаар илгээнэ."
                : "Дөрвөн алхамт хялбар бүртгэлийн дамжуулалтаар өөрийн төслийг нийтэлж дэмжигчид олоорой."}
            </p>
          </div>
        </div>

        {/* ── Form area ─────────────────────────────── */}
        <div ref={topRef} className="container-page py-8 lg:py-12">
          <div className="max-w-2xl mx-auto">

            {submitted ? (
              <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 animate-fade-up">
                <SuccessScreen title={data.title} editing={editing} />
              </div>
            ) : (
              <>
                <Stepper current={step} />

                <div key={step} className="bg-white rounded-2xl shadow-card p-6 sm:p-8 animate-fade-up">

                  {/* Step heading */}
                  <div className="mb-6 pb-5 border-b border-slate-100">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                      Алхам {step} / {STEPS.length}
                    </p>
                    <h2 className="font-display font-bold text-xl text-slate-900">
                      {stepHeadings[step - 1]}
                    </h2>
                  </div>

                  {/* Step content */}
                  {step === 1 && <Step1 d={data} set={set} e={errors} />}
                  {step === 2 && <Step2 d={data} set={set} e={errors} />}
                  {step === 3 && (
                    <Step3
                      d={data} set={set} e={errors}
                      projectImages={projectImages}
                      projectImagesUploading={projectImagesUploading}
                      onProjectImagesChange={handleProjectImagesChange}
                      onProjectImagesUploadingChange={setProjectImagesUploading}
                      projectDocuments={projectDocuments}
                      projectDocumentsUploading={projectDocumentsUploading}
                      onProjectDocumentsChange={handleProjectDocumentsChange}
                      onProjectDocumentsUploadingChange={setProjectDocumentsUploading}
                    />
                  )}
                  {step === 4 && (
                    <Step4 d={data} e={errors}
                      setReward={setReward} addReward={addReward} removeReward={removeReward} />
                  )}

                  {errors.submit && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                      <ErrMsg msg={errors.submit} />
                    </div>
                  )}

                  {/* Navigation row */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 gap-3">
                    <div>
                      {step > 1 && (
                        <button type="button" onClick={handleBack}
                          className={buttonVariants({ variant: "secondary", size: "md" })}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 10H5m5 5l-5-5 5-5" stroke="currentColor" />
                          </svg>
                          Өмнөх
                        </button>
                      )}
                    </div>

                    <button type="button" onClick={handleNext} disabled={submitting || projectImagesUploading || projectDocumentsUploading}
                      className={cn(
                        buttonVariants({ variant: "primary", size: "md" }),
                        (submitting || projectImagesUploading || projectDocumentsUploading) && "opacity-70 cursor-wait pointer-events-none"
                      )}>
                      {step < 4 ? (
                        <>
                          Дараах
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M5 10h10m-5-5l5 5-5 5" stroke="currentColor" />
                          </svg>
                        </>
                      ) : (
                        <>
                          {submitting ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a8 8 0 00-8 8h4z" />
                              </svg>
                              {editing ? "Хадгалж байна..." : "Нийтэлж байна..."}
                            </>
                          ) : (
                            <>
                              {editing ? "Өөрчлөлт хадгалах" : "Төслийг илгээх"}
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>

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
