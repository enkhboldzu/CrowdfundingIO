"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { GuardedLink } from "@/components/ui/GuardedLink";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  Calendar, Check, Plus, Heart, FolderOpen,
  Mail, Lock, Wallet, TrendingUp, Users,
  Eye, Pencil, Clock, AlertCircle, CheckCircle2, XCircle,
  Loader2, Shield, ChevronRight, CreditCard, Globe,
  ArrowRight, Pen,
} from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { fundingPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { updateProfile } from "@/lib/actions/user";
import {
  ACCEPTED_IMAGE_INPUT,
  ACCEPTED_IMAGE_TYPE_SET,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_MB,
} from "@/lib/upload";
import { uploadErrorMessage } from "@/lib/upload-client";

/* ── Types ──────────────────────────────────────────────────────────── */

type ProfileTab = "backed" | "projects" | "settings";

export interface ProfileUser {
  id:         string;
  name:       string | null;
  bio:        string | null;
  email:      string | null;
  phone:      string | null;
  avatar:     string | null;
  isVerified: boolean;
  createdAt:  string;
}

export interface DonationStats {
  totalAmount: number;
  count:       number;
}

export interface BackedDonation {
  id:        string;
  amount:    number;
  createdAt: string;
  project:   Project;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function getDisplayName(user: ProfileUser): string {
  if (user.name?.trim()) return user.name;
  if (user.email) return user.email.split("@")[0];
  if (user.phone) return user.phone;
  return "Шинэ Дэмжигч";
}

function formatMemberSince(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()} оны ${d.getMonth() + 1}-р сараас`;
}

const CATEGORY_LABELS: Record<string, string> = {
  technology: "Технологи", arts: "Урлаг",       film: "Кино",        environment: "Байгаль",
  games:      "Тоглоом",   health: "Эрүүл мэнд", education: "Боловсрол", community: "Нийгэм",
  food:       "Хоол",       fashion: "Загвар",    music: "Хөгжим",     publishing: "Хэвлэл",
};

const AVATAR_COLORS = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-cyan-500"];

function InitialAvatar({ name, className }: { name: string; className?: string }) {
  const char = (name.trim().charAt(0) || "?").toUpperCase();
  const color = AVATAR_COLORS[char.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={cn("flex items-center justify-center font-bold text-white select-none", color, className)}>
      {char}
    </div>
  );
}

/* ── Status configs ──────────────────────────────────────────────────── */

const BACKED_STATUS_CONFIG = {
  active: { label: "Идэвхтэй",   dot: "bg-green-400",  text: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"  },
  funded: { label: "Санхүүжсэн", dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"   },
  ended:  { label: "Дууссан",    dot: "bg-slate-400",  text: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-200"  },
};

const CREATED_STATUS_CONFIG = {
  PENDING:   { label: "Хянагдаж байна", icon: Clock,        dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   },
  ACTIVE:    { label: "Нийтлэгдсэн",   icon: CheckCircle2, dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  FUNDED:    { label: "Санхүүжсэн",    icon: CheckCircle2, dot: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200"    },
  REJECTED:  { label: "Татгалзсан",    icon: XCircle,      dot: "bg-red-500",     text: "text-red-700",     bg: "bg-red-50",     border: "border-red-200"     },
  FAILED:    { label: "Дууссан",       icon: AlertCircle,  dot: "bg-slate-400",   text: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200"   },
  CANCELLED: { label: "Цуцлагдсан",   icon: XCircle,      dot: "bg-slate-400",   text: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200"   },
} as const;

/* ── InlineField — click to edit ─────────────────────────────────────── */

function InlineField({ label, value, placeholder, multiline = false, onSave, saving }: {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  onSave: (v: string) => Promise<void>;
  saving?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [localSaving, setLocalSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  function startEdit() {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function save() {
    if (draft === value) { setEditing(false); return; }
    setLocalSaving(true);
    await onSave(draft.trim());
    setLocalSaving(false);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !multiline) { e.preventDefault(); save(); }
    if (e.key === "Escape") cancel();
  }

  const isBusy = localSaving || saving;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
      {editing ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent resize-none bg-white"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent bg-white"
            />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            >
              {localSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" strokeWidth={2.5} />}
              Хадгалах
            </button>
            <button type="button" onClick={cancel} className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              Болих
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className="group flex items-start gap-2 w-full text-left hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
        >
          <span className={cn("text-sm leading-relaxed flex-1", value ? "text-gray-900" : "text-gray-400 italic")}>
            {value || placeholder}
          </span>
          <Pen className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-600 mt-0.5 shrink-0 transition-colors" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

/* ── Root component ──────────────────────────────────────────────────── */

interface ProfileClientProps {
  user:            ProfileUser;
  donationStats:   DonationStats;
  backedDonations: BackedDonation[];
  createdProjects: Project[];
  initialTab?:     ProfileTab;
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

  function handleProfileUpdate(updates: Partial<ProfileUser>) {
    setUser(prev => ({ ...prev, ...updates }));
  }

  const displayName = getDisplayName(user);
  const isNameEmpty = !user.name?.trim();

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "backed",   label: "Дэмжсэн",      icon: Heart,      count: donationStats.count    },
    { id: "projects", label: "Төслүүд",       icon: FolderOpen, count: createdProjects.length },
    { id: "settings", label: "Command Center", icon: Shield                                    },
  ];

  return (
    <>
      <main className="min-h-screen bg-gray-50">

        {/* ── Command Center Header ─────────────────────────────── */}
        <section className="bg-white border-b border-gray-200 pt-20 pb-0">
          <div className="container-page">

            {/* Top row: avatar + identity + metrics */}
            <div className="py-8 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-10 items-start">

              {/* Avatar (circle, strict) */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-200">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={displayName} width={80} height={80} className="object-cover w-full h-full" />
                    ) : (
                      <InitialAvatar name={displayName} className="w-full h-full text-2xl" />
                    )}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center ring-2 ring-white" title="Баталгаажсан">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>

              {/* Identity block */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className={cn("font-bold text-2xl leading-tight", isNameEmpty ? "text-gray-400 italic" : "text-gray-900")}>
                    {displayName}
                  </h1>
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} />
                      Баталгаажсан
                    </span>
                  )}
                  {isNameEmpty && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Профайл тохируулаарай
                    </span>
                  )}
                </div>
                {user.bio ? (
                  <p className="text-sm text-gray-500 leading-relaxed">{user.bio}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Товч танилцуулга нэм...</p>
                )}
                <div className="flex items-center gap-4 pt-1 flex-wrap">
                  {(user.email || user.phone) && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Mail className="w-3.5 h-3.5" strokeWidth={2} />
                      {user.email ?? user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                    {formatMemberSince(user.createdAt)} гишүүн
                  </span>
                </div>
              </div>

              {/* Edit button */}
              <div className="hidden lg:block">
                <button
                  onClick={() => setTab("settings")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 hover:border-blue-800 hover:text-blue-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <Pen className="w-3.5 h-3.5" strokeWidth={2} />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* ── Impact Metrics strip ── */}
            <div className="grid grid-cols-3 border-t border-gray-100 -mx-4 sm:mx-0">
              {/* Total Contributed */}
              <div className="px-4 sm:px-6 py-4 border-r border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Wallet className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Нийт дэмжсэн</span>
                </div>
                {donationStats.totalAmount > 0 ? (
                  <p className="font-bold text-xl text-gray-900">₮{donationStats.totalAmount.toLocaleString()}</p>
                ) : (
                  <button onClick={() => setTab("backed")} className="group flex items-center gap-1 text-sm font-semibold text-blue-800 hover:text-blue-900 mt-0.5">
                    Анхны төслөө дэмжээрэй
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Projects Backed */}
              <div className="px-4 sm:px-6 py-4 border-r border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Heart className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Дэмжсэн</span>
                </div>
                {donationStats.count > 0 ? (
                  <p className="font-bold text-xl text-gray-900">{donationStats.count} <span className="text-sm font-normal text-gray-500">төсөл</span></p>
                ) : (
                  <Link href="/explore" className="group flex items-center gap-1 text-sm font-semibold text-blue-800 hover:text-blue-900 mt-0.5">
                    Судлах
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                  </Link>
                )}
              </div>

              {/* Created Projects */}
              <div className="px-4 sm:px-6 py-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Үүсгэсэн</span>
                </div>
                {createdProjects.length > 0 ? (
                  <p className="font-bold text-xl text-gray-900">{createdProjects.length} <span className="text-sm font-normal text-gray-500">төсөл</span></p>
                ) : (
                  <GuardedLink href="/create-project" className="group flex items-center gap-1 text-sm font-semibold text-blue-800 hover:text-blue-900 mt-0.5">
                    Төсөл эхлүүлэх
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                  </GuardedLink>
                )}
              </div>
            </div>

            {/* ── Tab bar ── */}
            <div className="flex gap-0 -mb-px overflow-x-auto">
              {tabs.map(t => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                      active
                        ? "border-blue-800 text-blue-800"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300",
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                    {t.label}
                    {t.count !== undefined && (
                      <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-full", active ? "bg-blue-800 text-white" : "bg-gray-100 text-gray-500")}>
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Tab Content ───────────────────────────────────────────── */}
        <div className="container-page py-8">
          {tab === "backed"   && <BackedTab donations={backedDonations} />}
          {tab === "projects" && <ProjectsTab projects={createdProjects} />}
          {tab === "settings" && (
            <CommandCenterSettings
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

/* ── Command Center Settings ─────────────────────────────────────────── */

function CommandCenterSettings({
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

  async function handleSaveField(field: "name" | "bio", value: string) {
    const result = await updateProfile({ [field]: value });
    if (result.success) {
      onProfileUpdate({ [field]: value || null });
      showToast("Хадгалагдлаа.", "info");
      if (field === "name" && role) {
        authLogin(role, { name: value.trim() || authUser?.name || "", email: authUser?.email ?? null, avatar: authUser?.avatar ?? null });
      }
    } else {
      showToast(result.error ?? "Алдаа гарлаа.", "error");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <IdentityCluster user={user} onSaveField={handleSaveField} onProfileUpdate={onProfileUpdate} />
      <SecurityCluster user={user} />
      <FinancialCluster user={user} createdProjects={createdProjects} />
    </div>
  );
}

/* ── Identity Cluster ────────────────────────────────────────────────── */

function IdentityCluster({
  user,
  onSaveField,
  onProfileUpdate,
}: {
  user: ProfileUser;
  onSaveField: (field: "name" | "bio", value: string) => Promise<void>;
  onProfileUpdate: (updates: Partial<ProfileUser>) => void;
}) {
  const { show: showToast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!ACCEPTED_IMAGE_TYPE_SET.has(file.type)) { showToast("PNG, JPG, WEBP зураг оруулна уу.", "error"); return; }
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) { showToast(`Зураг ${MAX_IMAGE_UPLOAD_MB} MB-аас их байна.`, "error"); return; }
    if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await uploadErrorMessage(res));
      const { url } = await res.json() as { url: string };
      setAvatarUrl(url);
      const result = await updateProfile({ avatar: url });
      if (result.success) {
        onProfileUpdate({ avatar: url });
        showToast("Профайл зураг шинэчлэгдлээ.", "info");
      } else {
        showToast(result.error ?? "Алдаа гарлаа.", "error");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Зураг хуулахад алдаа гарлаа.", "error");
      setAvatarPreview(user.avatar ?? "");
      setAvatarUrl(user.avatar ?? null);
    } finally {
      setAvatarUploading(false);
    }
  }

  const displayName = getDisplayName(user);

  return (
    <ClusterCard
      badge="Identity"
      title="Хувийн мэдээлэл"
      description="Таны нэр болон танилцуулга кампанийн хуудсанд харагдана."
    >
      {/* Avatar row */}
      <div className="flex items-center gap-5 pb-5 mb-5 border-b border-gray-100">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-gray-200">
            {(avatarPreview || avatarUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview || avatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <InitialAvatar name={displayName} className="w-full h-full text-xl" />
            )}
          </div>
          {avatarUploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
        </div>
        <div>
          <input ref={avatarInputRef} type="file" accept={ACCEPTED_IMAGE_INPUT} className="hidden" onChange={handleAvatarSelect} />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="text-sm font-semibold text-gray-700 border border-gray-200 hover:border-blue-800 hover:text-blue-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {avatarUploading ? "Хуулж байна..." : "Зураг солих"}
          </button>
          <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, WEBP · {MAX_IMAGE_UPLOAD_MB} MB хүртэл</p>
        </div>
      </div>

      {/* Name inline field */}
      <div className="space-y-5">
        <InlineField
          label="Нэр"
          value={user.name ?? ""}
          placeholder="Таны нэрийг бичнэ үү..."
          onSave={v => onSaveField("name", v)}
        />
        <InlineField
          label="Товч танилцуулга"
          value={user.bio ?? ""}
          placeholder="Та хэн бэ? Хоббийн тухай, ажлын чиглэл..."
          multiline
          onSave={v => onSaveField("bio", v)}
        />

        {/* Read-only contact */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">И-мэйл / Утас</p>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
            <span className="text-sm text-gray-500 flex-1">{user.email ?? user.phone ?? "—"}</span>
            <span className="text-[11px] text-gray-400">Өөрчлөх боломжгүй</span>
          </div>
        </div>
      </div>
    </ClusterCard>
  );
}

/* ── Security Cluster ────────────────────────────────────────────────── */

function SecurityCluster({ user }: { user: ProfileUser }) {
  const { show: showToast } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  /* Security score */
  const score = [
    true,               // password always set
    Boolean(user.avatar),
    user.isVerified,
  ].filter(Boolean).length;
  const scoreLabels = ["Сул", "Дундаж", "Хүчтэй"];
  const scoreColors = ["bg-red-400", "bg-amber-400", "bg-emerald-500"];
  const scoreLabel  = scoreLabels[score - 1] ?? scoreLabels[0];
  const scoreColor  = scoreColors[score - 1] ?? scoreColors[0];

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) { showToast("Нууц үг таарахгүй байна.", "error"); return; }
    if (!pwd.next || pwd.next.length < 8) { showToast("8+ тэмдэгт нууц үг оруулна уу.", "error"); return; }
    setSaving(true);
    const result = await updateProfile({ currentPassword: pwd.current, newPassword: pwd.next });
    setSaving(false);
    if (result.success) {
      showToast("Нууц үг амжилттай солигдлоо.", "info");
      setPwd({ current: "", next: "", confirm: "" });
      setShowPasswordForm(false);
    } else {
      showToast(result.error ?? "Алдаа гарлаа.", "error");
    }
  }

  const scoreItems = [
    { label: "Нууц үг тогтоосон", done: true },
    { label: "Профайл зураг нэмсэн", done: Boolean(user.avatar) },
    { label: "Холбоо барих баталгаажсан", done: user.isVerified },
  ];

  return (
    <ClusterCard badge="Security" title="Аюулгүй байдлын тохиргоо" description="Бүртгэлийнхээ хамгаалалтыг бэхжүүлнэ үү.">

      {/* Security score bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500">Хамгаалалтын түвшин</span>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full text-white", scoreColor)}>
            {scoreLabel}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", scoreColor)}
            style={{ width: `${(score / 3) * 100}%` }}
          />
        </div>
        <div className="mt-3 space-y-1.5">
          {scoreItems.map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", item.done ? "bg-emerald-100" : "bg-gray-100")}>
                {item.done
                  ? <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} />
                  : <span className="w-1.5 h-1.5 rounded-full bg-gray-300 block" />
                }
              </div>
              <span className={cn("text-xs", item.done ? "text-gray-700" : "text-gray-400")}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 divide-y divide-gray-100">
        {/* Password change */}
        <div>
          <button
            type="button"
            onClick={() => setShowPasswordForm(v => !v)}
            className="w-full flex items-center justify-between py-3.5 text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Нууц үг солих</p>
                <p className="text-xs text-gray-400">Хүчтэй нууц үг ашиглаарай</p>
              </div>
            </div>
            <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", showPasswordForm && "rotate-90")} strokeWidth={2} />
          </button>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSave} className="pb-4 space-y-3">
              {([
                { id: "current" as const, label: "Одоогийн нууц үг", placeholder: "••••••••" },
                { id: "next"    as const, label: "Шинэ нууц үг",     placeholder: "8+ тэмдэгт" },
                { id: "confirm" as const, label: "Давтах",           placeholder: "••••••••"   },
              ]).map(f => (
                <div key={f.id}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                  <input
                    type="password"
                    value={pwd[f.id]}
                    onChange={e => setPwd(p => ({ ...p, [f.id]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-transparent bg-white"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-blue-800 hover:bg-blue-900 disabled:opacity-60 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                  Хадгалах
                </button>
                <button type="button" onClick={() => { setShowPasswordForm(false); setPwd({ current: "", next: "", confirm: "" }); }} className="text-sm font-semibold text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">Болих</button>
              </div>
            </form>
          )}
        </div>

        {/* 2FA (coming soon) */}
        <div className="flex items-center justify-between py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-gray-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">2 шатлалт баталгаажуулалт</p>
              <p className="text-xs text-gray-400">SMS эсвэл authenticator app</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-full">Тун удахгүй</span>
        </div>
      </div>
    </ClusterCard>
  );
}

/* ── Financial Cluster ───────────────────────────────────────────────── */

function FinancialCluster({ user: _user, createdProjects }: { user: ProfileUser; createdProjects: Project[] }) {
  const uniqueBanks = Array.from(
    new Map(
      createdProjects
        .filter(p => (p as unknown as Record<string, unknown>).bankName)
        .map(p => {
          const pp = p as unknown as Record<string, unknown>;
          return [pp.bankName as string, { bankName: pp.bankName as string, bankAccount: pp.bankAccount as string }];
        })
    ).values()
  );

  return (
    <ClusterCard badge="Financial" title="Санхүүгийн мэдээлэл" description="Санхүүжилт хүлээн авах дансны мэдээлэл. Төсөл бүрд тохируулагддаг.">
      {uniqueBanks.length > 0 ? (
        <div className="space-y-3">
          {uniqueBanks.map(b => (
            <div key={b.bankName} className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 text-blue-800" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{b.bankName}</p>
                <p className="text-xs text-gray-400 font-mono">{b.bankAccount}</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Холбогдсон</span>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">Банкны мэдээллийг засахын тулд тухайн төсөл дотроос edit хийнэ үү.</p>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Globe className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Данс холбогдоогүй байна</p>
          <p className="text-xs text-gray-400 mb-4">Санхүүжилт авахын тулд эхлээд төсөл үүсгэж банкны мэдээллээ оруулна уу.</p>
          <GuardedLink href="/create-project" className="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Төсөл эхлүүлэх
          </GuardedLink>
        </div>
      )}
    </ClusterCard>
  );
}

/* ── ClusterCard wrapper ─────────────────────────────────────────────── */

function ClusterCard({ badge, title, description, children }: {
  badge: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800">{badge}</span>
          <h3 className="font-bold text-gray-900 text-base mt-0.5">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

/* ── Backed Projects tab ─────────────────────────────────────────────── */

function BackedTab({ donations }: { donations: BackedDonation[] }) {
  if (donations.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-6 h-6 text-gray-300" />}
        title="Дэмжсэн төсөл байхгүй байна"
        description="Та төсөл дэмжмэгц төлсөн дүн, огноо, явцыг эндээс харна."
        action={
          <Link href="/explore" className="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Дэмжих төсөл хайх
          </Link>
        }
      />
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {donations.map(item => <BackedCard key={item.id} item={item} />)}
    </div>
  );
}

function BackedCard({ item }: { item: BackedDonation }) {
  const { amount, createdAt, project } = item;
  const percent = fundingPercent(project.raised, project.goal);
  const st = project.status ?? "ACTIVE";
  const key: keyof typeof BACKED_STATUS_CONFIG = st === "FUNDED" ? "funded" : st === "ACTIVE" ? "active" : "ended";
  const cfg = BACKED_STATUS_CONFIG[key];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
      <div className="flex gap-4 p-4">
        <Link href={`/projects/${project.slug}`} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
          <Image src={project.coverImage} alt={project.title} fill className="object-cover" sizes="80px" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link href={`/projects/${project.slug}`} className="font-bold text-sm text-gray-900 line-clamp-2 hover:text-blue-800 transition-colors leading-snug">
              {project.title}
            </Link>
            <span className={cn("inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0", cfg.bg, cfg.text, cfg.border)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-2">{CATEGORY_LABELS[project.category] ?? project.category} · {createdAt.split("T")[0]}</p>
          <p className="text-xs font-semibold text-gray-700">₮{amount.toLocaleString()} дэмжсэн</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <ProgressBar value={percent} raised={project.raised} goal={project.goal} />
      </div>
    </div>
  );
}

/* ── My Projects tab ─────────────────────────────────────────────────── */

function ProjectsTab({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{projects.length} төсөл</p>
        <GuardedLink href="/create-project" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Шинэ төсөл
        </GuardedLink>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-6 h-6 text-gray-300" />}
          title="Үүсгэсэн төсөл байхгүй байна"
          description="Санаагаа танилцуулж илгээсний дараа хянагдах төлөв, нийтлэгдсэн эсэх, дэмжлэгийн явцаа эндээс харна."
          action={
            <GuardedLink href="/create-project" className="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
              Төсөл эхлэх
            </GuardedLink>
          }
        />
      ) : (
        <div className="space-y-4">
          {projects.map(p => <CreatedProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}

function CreatedProjectCard({ project }: { project: Project }) {
  const percent = fundingPercent(project.raised, project.goal);
  const daysUrgent = (project.daysLeft ?? 0) <= 7;
  const statusKey = (project.status ?? "ACTIVE") as keyof typeof CREATED_STATUS_CONFIG;
  const cfg = CREATED_STATUS_CONFIG[statusKey] ?? CREATED_STATUS_CONFIG.ACTIVE;
  const StatusIcon = cfg.icon;
  const isPublic = statusKey === "ACTIVE" || statusKey === "FUNDED";
  const canEdit = statusKey === "PENDING" || statusKey === "REJECTED" || statusKey === "ACTIVE";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-44 h-40 sm:h-auto flex-shrink-0 bg-gray-100">
          <Image src={project.coverImage} alt={project.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 176px" />
          <div className={cn("absolute top-3 left-3 inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full border", cfg.bg, cfg.text, cfg.border)}>
            <StatusIcon className="w-3 h-3" strokeWidth={2.5} />
            {cfg.label}
          </div>
        </div>
        <div className="flex-1 p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-semibold text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full mb-1.5 inline-block">
                {CATEGORY_LABELS[project.category] ?? project.category}
              </span>
              <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{project.title}</h3>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isPublic ? (
                <Link href={`/projects/${project.slug}`} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-800 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all" title="Харах">
                  <Eye className="w-4 h-4" strokeWidth={2} />
                </Link>
              ) : (
                <div className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-200 border border-gray-100 cursor-not-allowed" title="Нийтлэгдээгүй">
                  <Eye className="w-4 h-4" strokeWidth={2} />
                </div>
              )}
              {canEdit ? (
                <Link href={`/projects/${project.slug}/edit`} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-800 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all" title="Засах">
                  <Pencil className="w-4 h-4" strokeWidth={2} />
                </Link>
              ) : (
                <div className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-200 border border-gray-100 cursor-not-allowed" title="Засах боломжгүй">
                  <Pencil className="w-4 h-4" strokeWidth={2} />
                </div>
              )}
            </div>
          </div>

          {statusKey === "PENDING" && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" strokeWidth={2} />
              Таны төсөл администраторын хянаж байна (24–48 цаг).
            </div>
          )}
          {statusKey === "REJECTED" && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 text-xs px-3 py-2.5 rounded-lg">
              <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-500" strokeWidth={2} />
              <span><span className="font-semibold">Татгалзсан: </span>{project.rejectionReason ?? "Дэлгэрэнгүй байхгүй."}</span>
            </div>
          )}

          <ProgressBar value={percent} raised={project.raised} goal={project.goal} />
          <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" strokeWidth={2} />{project.backers.toLocaleString()} дэмжигч</span>
              {isPublic && project.daysLeft !== undefined && (
                <span className={cn("font-semibold", daysUrgent ? "text-red-600" : "text-gray-600")}>{project.daysLeft} өдөр</span>
              )}
            </div>
            <span className="font-bold text-blue-800">{percent.toFixed(0)}% санхүүжсэн</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared EmptyState ───────────────────────────────────────────────── */

function EmptyState({ icon, title, description, action }: {
  icon:        React.ReactNode;
  title:       string;
  description: string;
  action:      React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-16 text-center max-w-sm mx-auto">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">{icon}</div>
      <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  );
}
