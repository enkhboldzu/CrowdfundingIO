"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GuardedLink } from "@/components/ui/GuardedLink";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  Eye,
  FolderOpen,
  Heart,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Plus,
  ReceiptText,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn, daysLeftLabel, fundingPercent } from "@/lib/utils";
import type { Project } from "@/types";
import { updateProfile } from "@/lib/actions/user";
import {
  ACCEPTED_IMAGE_INPUT,
  ACCEPTED_IMAGE_TYPE_SET,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_MB,
} from "@/lib/upload";
import { uploadErrorMessage } from "@/lib/upload-client";

type ProfileTab = "backed" | "projects" | "settings";

export interface ProfileUser {
  id: string;
  name: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface DonationStats {
  totalAmount: number;
  count: number;
}

export interface BackedDonation {
  id: string;
  amount: number;
  createdAt: string;
  project: Project;
}

interface ProfileClientProps {
  user: ProfileUser;
  donationStats: DonationStats;
  backedDonations: BackedDonation[];
  createdProjects: Project[];
  initialTab?: ProfileTab;
}

const CATEGORY_LABELS: Record<string, string> = {
  technology: "Технологи",
  arts: "Урлаг",
  film: "Кино",
  environment: "Байгаль",
  games: "Тоглоом",
  health: "Эрүүл мэнд",
  education: "Боловсрол",
  community: "Нийгэм",
  food: "Хоол",
  fashion: "Загвар",
  music: "Хөгжим",
  publishing: "Хэвлэл",
  social: "Нийгэм",
  startups: "Стартап",
};

const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-cyan-600",
];

const BACKED_STATUS_CONFIG = {
  active: {
    label: "Идэвхтэй",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  funded: {
    label: "Санхүүжсэн",
    dot: "bg-blue-600",
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  ended: {
    label: "Дууссан",
    dot: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
};

const CREATED_STATUS_CONFIG = {
  PENDING: {
    label: "Хянагдаж байна",
    hint: "Админ шалгаж дуусмагц нийтлэгдэх боломжтой.",
    icon: Clock,
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  ACTIVE: {
    label: "Нийтлэгдсэн",
    hint: "Төсөл дэмжлэг авч байна.",
    icon: CheckCircle2,
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  FUNDED: {
    label: "Санхүүжсэн",
    hint: "Зорилгодоо хүрсэн төсөл.",
    icon: CheckCircle2,
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  REJECTED: {
    label: "Татгалзсан",
    hint: "Засвар оруулаад дахин илгээх боломжтой.",
    icon: XCircle,
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  FAILED: {
    label: "Дууссан",
    hint: "Хугацаа дууссан төсөл.",
    icon: AlertCircle,
    text: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
  CANCELLED: {
    label: "Цуцлагдсан",
    hint: "Төсөл идэвхгүй болсон.",
    icon: XCircle,
    text: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
} as const;

function getDisplayName(user: ProfileUser): string {
  if (user.name?.trim()) return user.name.trim();
  if (user.email) return user.email.split("@")[0];
  if (user.phone) return user.phone;
  return "Шинэ дэмжигч";
}

function formatMoney(amount: number): string {
  return `${amount.toLocaleString("mn-MN")}₮`;
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

function formatMemberSince(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сараас`;
}

function getProfileScore(user: ProfileUser): number {
  return [
    Boolean(user.name?.trim()),
    Boolean(user.bio?.trim()),
    Boolean(user.avatar),
    Boolean(user.email || user.phone),
  ].filter(Boolean).length;
}

function updateTabUrl(tab: ProfileTab) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (tab === "backed") url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function InitialAvatar({ name, className }: { name: string; className?: string }) {
  const char = (name.trim().charAt(0) || "?").toUpperCase();
  const color = AVATAR_COLORS[char.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div className={cn("flex items-center justify-center font-bold text-white select-none", color, className)}>
      {char}
    </div>
  );
}

export function ProfileClient({
  user: initialUser,
  donationStats,
  backedDonations,
  createdProjects,
  initialTab = "backed",
}: ProfileClientProps) {
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const [user, setUser] = useState<ProfileUser>(initialUser);
  const displayName = getDisplayName(user);
  const profileScore = getProfileScore(user);
  const profilePercent = Math.round((profileScore / 4) * 100);
  const isProfileComplete = profileScore >= 4;

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "backed", label: "Дэмжсэн төслүүд", icon: Heart, count: donationStats.count },
    { id: "projects", label: "Миний төслүүд", icon: FolderOpen, count: createdProjects.length },
    { id: "settings", label: "Тохиргоо", icon: Shield },
  ];

  function selectTab(nextTab: ProfileTab) {
    setTab(nextTab);
    updateTabUrl(nextTab);
  }

  function handleProfileUpdate(updates: Partial<ProfileUser>) {
    setUser(prev => ({ ...prev, ...updates }));
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white pt-24">
          <div className="container-page">
            <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#eff6ff_100%)] p-5 shadow-sm sm:p-7 lg:p-8">
              <div className={cn(
                "grid gap-7 lg:items-end",
                !isProfileComplete && "lg:grid-cols-[minmax(0,1fr)_360px]",
              )}>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.4rem] border border-white bg-slate-100 shadow-sm ring-1 ring-slate-200">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={displayName} fill className="object-cover" sizes="96px" priority />
                    ) : (
                      <InitialAvatar name={displayName} className="h-full w-full text-3xl" />
                    )}
                    {user.isVerified && (
                      <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white" title="Баталгаажсан">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        <Sparkles className="h-3.5 w-3.5" strokeWidth={2.4} />
                        Миний профайл
                      </span>
                      {user.isVerified && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.4} />
                          Баталгаажсан
                        </span>
                      )}
                      {isProfileComplete ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                          Профайл бүрэн
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.4} />
                          Профайл дутуу
                        </span>
                      )}
                    </div>

                    <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                      {displayName}
                    </h1>
                    <p className={cn("mt-3 max-w-2xl text-sm leading-6", user.bio ? "text-slate-600" : "text-slate-400")}>
                      {user.bio || "Өөрийн тухай товч танилцуулга нэмбэл бусад хэрэглэгч таныг илүү амархан танина."}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                      {(user.email || user.phone) && (
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <Mail className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                          <span className="truncate">{user.email ?? user.phone}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" strokeWidth={2} />
                        {formatMemberSince(user.createdAt)} гишүүн
                      </span>
                    </div>
                  </div>
                </div>

                {!isProfileComplete && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Профайл бэлэн байдал</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{profileScore} / 4 мэдээлэл бүрэн</p>
                      </div>
                      <span className="text-2xl font-black text-blue-700">{profilePercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-700 transition-all duration-500" style={{ width: `${profilePercent}%` }} />
                    </div>
                    <button
                      type="button"
                      onClick={() => selectTab("settings")}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2.4} />
                      Профайл засах
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 py-5 sm:grid-cols-3">
              <ProfileStat
                icon={Wallet}
                label="Нийт дэмжсэн"
                value={formatMoney(donationStats.totalAmount)}
                tone="blue"
              />
              <ProfileStat
                icon={Heart}
                label="Дэмжсэн төсөл"
                value={`${donationStats.count.toLocaleString("mn-MN")}`}
                tone="rose"
              />
              <ProfileStat
                icon={TrendingUp}
                label="Үүсгэсэн төсөл"
                value={`${createdProjects.length.toLocaleString("mn-MN")}`}
                tone="emerald"
              />
            </div>

            <div className="-mb-px flex gap-2 overflow-x-auto pb-px">
              {tabs.map(item => {
                const Icon = item.icon;
                const active = tab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectTab(item.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-t-2xl border border-b-0 px-4 py-3 text-sm font-bold transition-colors",
                      active
                        ? "border-slate-200 bg-slate-50 text-blue-800"
                        : "border-transparent bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={active ? 2.6 : 2.2} />
                    {item.label}
                    {item.count !== undefined && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-black",
                        active ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500",
                      )}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="container-page py-8">
          {tab === "backed" && <BackedTab donations={backedDonations} />}
          {tab === "projects" && <ProjectsTab projects={createdProjects} />}
          {tab === "settings" && (
            <SettingsTab
              user={user}
              createdProjects={createdProjects}
              onProfileUpdate={handleProfileUpdate}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function ProfileStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone: "blue" | "rose" | "emerald";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  }[tone];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border", toneClass)}>
        <Icon className="h-5 w-5" strokeWidth={2.3} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-1 truncate text-xl font-black text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function InlineField({
  label,
  value,
  placeholder,
  multiline = false,
  onSave,
}: {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  onSave: (value: string) => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  async function save() {
    if (draft.trim() === value.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const ok = await onSave(draft.trim());
    setSaving(false);
    if (ok) setEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") cancel();
    if (event.key === "Enter" && !multiline) {
      event.preventDefault();
      void save();
    }
  }

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      {editing ? (
        <div className="space-y-3">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder={placeholder}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2.5} />}
              Хадгалах
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              Болих
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="group flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/60"
        >
          <span className={cn("min-w-0 flex-1 text-sm leading-6", value ? "text-slate-800" : "text-slate-400")}>
            {value || placeholder}
          </span>
          <Pencil className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-blue-700" strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}

function SettingsTab({
  user,
  createdProjects,
  onProfileUpdate,
}: {
  user: ProfileUser;
  createdProjects: Project[];
  onProfileUpdate: (updates: Partial<ProfileUser>) => void;
}) {
  const { user: authUser, role, login: authLogin } = useAuth();
  const { show: showToast } = useToast();

  async function handleSaveField(field: "name" | "bio", value: string): Promise<boolean> {
    const result = await updateProfile({ [field]: value });
    if (!result.success) {
      showToast(result.error ?? "Хадгалахад алдаа гарлаа.", "error");
      return false;
    }

    onProfileUpdate({ [field]: value || null });
    showToast("Амжилттай хадгалагдлаа.", "info");

    if (field === "name" && role) {
      authLogin(role, {
        name: value.trim() || authUser?.name || "",
        email: authUser?.email ?? null,
        avatar: authUser?.avatar ?? null,
      });
    }

    return true;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <IdentityPanel user={user} onSaveField={handleSaveField} onProfileUpdate={onProfileUpdate} />
        <SecurityPanel />
      </div>
      <div className="space-y-6">
        <ProfileChecklist user={user} />
        <FinancialPanel createdProjects={createdProjects} />
      </div>
    </div>
  );
}

function IdentityPanel({
  user,
  onSaveField,
  onProfileUpdate,
}: {
  user: ProfileUser;
  onSaveField: (field: "name" | "bio", value: string) => Promise<boolean>;
  onProfileUpdate: (updates: Partial<ProfileUser>) => void;
}) {
  const { user: authUser, role, login: authLogin } = useAuth();
  const { show: showToast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const displayName = getDisplayName(user);

  async function handleAvatarSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (!ACCEPTED_IMAGE_TYPE_SET.has(file.type)) {
      showToast("PNG, JPG эсвэл WEBP зураг оруулна уу.", "error");
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      showToast(`Зураг ${MAX_IMAGE_UPLOAD_MB} MB-аас их байна.`, "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(previewUrl);
    setAvatarUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await uploadErrorMessage(res));

      const { url } = await res.json() as { url: string };
      const result = await updateProfile({ avatar: url });
      if (!result.success) throw new Error(result.error ?? "Профайл зураг хадгалахад алдаа гарлаа.");

      setAvatarPreview(url);
      onProfileUpdate({ avatar: url });
      if (role) {
        authLogin(role, {
          name: authUser?.name ?? displayName,
          email: authUser?.email ?? null,
          avatar: url,
        });
      }
      showToast("Профайл зураг шинэчлэгдлээ.", "info");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Зураг хуулахад алдаа гарлаа.", "error");
      setAvatarPreview(user.avatar ?? "");
    } finally {
      setAvatarUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  }

  return (
    <Panel
      eyebrow="Профайл"
      title="Хувийн мэдээлэл"
      description="Энэ мэдээлэл таны үүсгэсэн төсөл болон хэрэглэгчийн хэсэгт харагдана."
      icon={BadgeCheck}
    >
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <InitialAvatar name={displayName} className="h-full w-full text-2xl" />
          )}
          {avatarUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">Профайл зураг</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">Нүүр танигдахуйц, цэвэр зураг оруулбал илүү итгэлтэй харагдана.</p>
        </div>

        <div>
          <input ref={avatarInputRef} type="file" accept={ACCEPTED_IMAGE_INPUT} className="hidden" onChange={handleAvatarSelect} />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 disabled:opacity-60"
          >
            {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" strokeWidth={2.4} />}
            {avatarUploading ? "Хуулж байна" : "Зураг солих"}
          </button>
          <p className="mt-1.5 text-xs text-slate-400">PNG, JPG, WEBP · {MAX_IMAGE_UPLOAD_MB} MB хүртэл</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <InlineField
          label="Нэр"
          value={user.name ?? ""}
          placeholder="Таны нэрийг бичнэ үү"
          onSave={value => onSaveField("name", value)}
        />
        <InlineField
          label="Товч танилцуулга"
          value={user.bio ?? ""}
          placeholder="Та хэн бэ, ямар төсөл сонирхдог вэ?"
          multiline
          onSave={value => onSaveField("bio", value)}
        />
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Холбоо барих</p>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Mail className="h-4 w-4 text-slate-400" strokeWidth={2.2} />
            <span className="min-w-0 flex-1 break-all text-sm font-semibold text-slate-700">{user.email ?? user.phone ?? "Холбоо барих мэдээлэл байхгүй"}</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-400 ring-1 ring-slate-200">Бүртгэлийн мэдээлэл</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function SecurityPanel() {
  const { show: showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (passwords.next !== passwords.confirm) {
      showToast("Шинэ нууц үг таарахгүй байна.", "error");
      return;
    }

    if (passwords.next.length < 8) {
      showToast("Шинэ нууц үг 8-аас дээш тэмдэгттэй байх ёстой.", "error");
      return;
    }

    setSaving(true);
    const result = await updateProfile({
      currentPassword: passwords.current,
      newPassword: passwords.next,
    });
    setSaving(false);

    if (!result.success) {
      showToast(result.error ?? "Нууц үг солиход алдаа гарлаа.", "error");
      return;
    }

    showToast("Нууц үг амжилттай солигдлоо.", "info");
    setPasswords({ current: "", next: "", confirm: "" });
    setOpen(false);
  }

  return (
    <Panel
      eyebrow="Аюулгүй байдал"
      title="Нэвтрэх хамгаалалт"
      description="Нууц үгээ тогтмол шинэчилж, бүртгэлээ хамгаалалттай байлгаарай."
      icon={KeyRound}
    >
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 ring-1 ring-slate-200">
            <Shield className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-900">Нууц үг солих</span>
            <span className="mt-0.5 block text-sm text-slate-500">Одоогийн нууц үгээ баталгаажуулаад шинэ нууц үг хадгална.</span>
          </span>
        </span>
        <ChevronRight className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform", open && "rotate-90")} strokeWidth={2.2} />
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          {[
            { id: "current" as const, label: "Одоогийн нууц үг", placeholder: "Одоогийн нууц үг" },
            { id: "next" as const, label: "Шинэ нууц үг", placeholder: "8-аас дээш тэмдэгт" },
            { id: "confirm" as const, label: "Шинэ нууц үг давтах", placeholder: "Шинэ нууц үгээ давтана" },
          ].map(field => (
            <label key={field.id} className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{field.label}</span>
              <input
                type="password"
                value={passwords[field.id]}
                onChange={event => setPasswords(prev => ({ ...prev, [field.id]: event.target.value }))}
                placeholder={field.placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          ))}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2.6} />}
              Нууц үг хадгалах
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPasswords({ current: "", next: "", confirm: "" });
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              Болих
            </button>
          </div>
        </form>
      )}
    </Panel>
  );
}

function ProfileChecklist({ user }: { user: ProfileUser }) {
  const items = [
    { label: "Нэр бичсэн", done: Boolean(user.name?.trim()) },
    { label: "Танилцуулга нэмсэн", done: Boolean(user.bio?.trim()) },
    { label: "Профайл зурагтай", done: Boolean(user.avatar) },
    { label: "Холбоо барих мэдээлэлтэй", done: Boolean(user.email || user.phone) },
  ];
  const doneCount = items.filter(item => item.done).length;

  if (doneCount >= items.length) return null;

  return (
    <Panel
      eyebrow="Бэлэн байдал"
      title="Профайл checklist"
      description="Дутуу зүйлээ гүйцээвэл таны профайл илүү итгэлтэй харагдана."
      icon={ReceiptText}
      compact
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-black text-slate-950">{doneCount}/4</p>
          <p className="text-sm text-slate-500">мэдээлэл бүрэн</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">{Math.round((doneCount / 4) * 100)}%</span>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", item.done ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-300 ring-1 ring-slate-200")}>
              {item.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <span className={cn("text-sm font-semibold", item.done ? "text-slate-800" : "text-slate-400")}>{item.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function FinancialPanel({ createdProjects }: { createdProjects: Project[] }) {
  const uniqueBanks = Array.from(
    new Map(
      createdProjects
        .filter(project => (project as unknown as Record<string, unknown>).bankName)
        .map(project => {
          const raw = project as unknown as Record<string, unknown>;
          return [
            `${raw.bankName}-${raw.bankAccount}`,
            {
              bankName: raw.bankName as string,
              bankAccount: raw.bankAccount as string,
              bankAccountName: raw.bankAccountName as string | undefined,
              projectTitle: project.title,
              projectSlug: project.slug,
            },
          ];
        }),
    ).values(),
  );

  return (
    <Panel
      eyebrow="Санхүү"
      title="Төслийн данс"
      description="Дансны мэдээлэл төсөл бүрийн тохиргооноос авна."
      icon={CreditCard}
      compact
    >
      {uniqueBanks.length > 0 ? (
        <div className="space-y-3">
          {uniqueBanks.map(bank => (
            <Link
              key={`${bank.bankName}-${bank.bankAccount}`}
              href={`/projects/${bank.projectSlug}/edit`}
              className="group block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">{bank.bankName}</p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-500">{bank.bankAccount}</p>
                  {bank.bankAccountName && (
                    <p className="mt-1 truncate text-xs font-semibold text-slate-400">{bank.bankAccountName}</p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-700" strokeWidth={2.3} />
              </div>
              <p className="mt-3 line-clamp-1 text-xs text-slate-400">{bank.projectTitle}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <CircleDollarSign className="mx-auto h-8 w-8 text-slate-300" strokeWidth={1.8} />
          <p className="mt-3 text-sm font-bold text-slate-800">Одоогоор данс холбогдоогүй</p>
          <p className="mx-auto mt-1 max-w-60 text-sm leading-6 text-slate-500">Төсөл үүсгэх үед банкны мэдээллээ оруулна.</p>
          <GuardedLink href="/create-project" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Төсөл эхлүүлэх
          </GuardedLink>
        </div>
      )}
    </Panel>
  );
}

function Panel({
  eyebrow,
  title,
  description,
  icon: Icon,
  compact = false,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ElementType;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={cn("flex items-start gap-4 border-b border-slate-100", compact ? "p-5" : "p-6")}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <Icon className="h-5 w-5" strokeWidth={2.3} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
          <h2 className="mt-1 font-display text-xl font-black tracking-tight text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
      <div className={compact ? "p-5" : "p-6"}>{children}</div>
    </section>
  );
}

function BackedTab({ donations }: { donations: BackedDonation[] }) {
  if (donations.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Дэмжсэн төсөл алга байна"
        description="Та төсөл дэмжмэгц төлсөн дүн, огноо, төслийн явц энд нэг дор харагдана."
        action={
          <Link href="/explore" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800">
            Дэмжих төсөл хайх
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Дэмжсэн төслүүд"
        description="Таны амжилттай төлсөн дэмжлэгүүд болон тухайн төслийн явц."
        action={
          <Link href="/explore" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800">
            Илүү төсөл үзэх
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {donations.map(donation => <BackedCard key={donation.id} item={donation} />)}
      </div>
    </div>
  );
}

function BackedCard({ item }: { item: BackedDonation }) {
  const { amount, createdAt, project } = item;
  const percent = fundingPercent(project.raised, project.goal);
  const status = project.status ?? "ACTIVE";
  const statusKey: keyof typeof BACKED_STATUS_CONFIG = status === "FUNDED" ? "funded" : status === "ACTIVE" ? "active" : "ended";
  const cfg = BACKED_STATUS_CONFIG[statusKey];

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-card-hover">
      <div className="grid sm:grid-cols-[170px_minmax(0,1fr)]">
        <Link href={`/projects/${project.slug}`} className="relative block h-44 bg-slate-100 sm:h-full">
          <Image src={project.coverImage} alt={project.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 170px" />
        </Link>
        <div className="flex min-w-0 flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black", cfg.bg, cfg.text, cfg.border)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
              {cfg.label}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{formatDate(createdAt)}</span>
          </div>

          <Link href={`/projects/${project.slug}`} className="line-clamp-2 text-base font-black leading-snug text-slate-950 transition-colors hover:text-blue-800">
            {project.title}
          </Link>
          <p className="mt-2 text-sm font-semibold text-slate-500">{CATEGORY_LABELS[project.category] ?? project.category}</p>

          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Таны дэмжлэг</span>
              <span className="text-sm font-black text-blue-700">{formatMoney(amount)}</span>
            </div>
            <ProgressBar value={percent} raised={project.raised} goal={project.goal} />
          </div>
        </div>
      </div>
    </article>
  );
}

function ProjectsTab({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Үүсгэсэн төсөл алга байна"
        description="Санаагаа оруулаад илгээсний дараа хяналтын төлөв, нийтлэгдсэн эсэх, дэмжлэгийн явцаа эндээс харна."
        action={
          <GuardedLink href="/create-project" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-800">
            Төсөл эхлэх
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </GuardedLink>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionToolbar
        title="Миний төслүүд"
        description="Үүсгэсэн төслүүдийн төлөв, явц, засах болон харах холбоосууд."
        action={
          <GuardedLink href="/create-project" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-800">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Шинэ төсөл
          </GuardedLink>
        }
      />
      <div className="grid gap-4">
        {projects.map(project => <CreatedProjectCard key={project.id} project={project} />)}
      </div>
    </div>
  );
}

function CreatedProjectCard({ project }: { project: Project }) {
  const percent = fundingPercent(project.raised, project.goal);
  const statusKey = project.status ?? "ACTIVE";
  const cfg = CREATED_STATUS_CONFIG[statusKey];
  const StatusIcon = cfg.icon;
  const isPublic = statusKey === "ACTIVE" || statusKey === "FUNDED";
  const canEdit = statusKey === "PENDING" || statusKey === "REJECTED" || statusKey === "ACTIVE";

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-card-hover">
      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="relative h-56 bg-slate-100 lg:h-auto">
          <Image src={project.coverImage} alt={project.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 260px" />
          <span className={cn("absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black backdrop-blur", cfg.bg, cfg.text, cfg.border)}>
            <StatusIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            {cfg.label}
          </span>
        </div>

        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-blue-100">
                {CATEGORY_LABELS[project.category] ?? project.category}
              </span>
              <h3 className="mt-3 font-display text-xl font-black leading-tight tracking-tight text-slate-950">
                {project.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{project.description}</p>
            </div>

            <div className="flex shrink-0 gap-2">
              {isPublic && (
                <Link href={`/projects/${project.slug}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800" title="Төсөл харах">
                  <Eye className="h-4 w-4" strokeWidth={2.3} />
                </Link>
              )}
              {canEdit && (
                <Link href={`/projects/${project.slug}/edit`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800" title="Төсөл засах">
                  <Pencil className="h-4 w-4" strokeWidth={2.3} />
                </Link>
              )}
            </div>
          </div>

          {(statusKey === "PENDING" || statusKey === "REJECTED") && (
            <div className={cn("mt-4 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm leading-6", cfg.bg, cfg.text, cfg.border)}>
              <StatusIcon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} />
              <span>
                {statusKey === "REJECTED" ? (
                  <>
                    <span className="font-black">Татгалзсан шалтгаан: </span>
                    {project.rejectionReason ?? "Дэлгэрэнгүй тайлбар байхгүй байна."}
                  </>
                ) : (
                  cfg.hint
                )}
              </span>
            </div>
          )}

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <ProgressBar value={percent} raised={project.raised} goal={project.goal} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" strokeWidth={2.2} />
                {project.backers.toLocaleString("mn-MN")} дэмжигч
              </span>
              {isPublic && typeof project.daysLeft === "number" && (
                <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                  <Clock className="h-4 w-4" strokeWidth={2.2} />
                  {daysLeftLabel(project.daysLeft)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-black text-blue-700">
                <Target className="h-4 w-4" strokeWidth={2.2} />
                {percent.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SectionToolbar({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Профайл</p>
        <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
        <Icon className="h-7 w-7" strokeWidth={2.2} />
      </div>
      <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  );
}
