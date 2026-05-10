"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Calendar, Check, Edit3, Plus,
  Heart, FolderOpen, Settings2, Bell,
  Mail, Lock, Wallet, TrendingUp, Users,
  Eye, Pencil, ChevronRight,
} from "lucide-react";
import { Navbar }      from "@/components/landing/Navbar";
import { Footer }      from "@/components/landing/Footer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { fundingPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

/* ── Types ──────────────────────────────────────────────────────── */

type ProfileTab = "backed" | "projects" | "settings";

interface BackedProject {
  project: Project;
  pledgeAmount: number;
  pledgeDate: string;
  status: "active" | "funded" | "ended";
}

/* ── Mock data ──────────────────────────────────────────────────── */

const USER = {
  name: "Б. Анарэрдэнэ",
  email: "baterdeneanarerdene09@gmail.com",
  bio: "Монголын технологи болон боловсролын салбарт хувь нэмрээ оруулахыг хичээдэг. Шинэ санаа, залуу бизнес эрхлэгчдийг дэмждэг.",
  avatar: "https://i.pravatar.cc/150?img=47",
  location: "Улаанбаатар, Монгол",
  memberSince: "2024 оны 3-р сар",
  isVerified: true,
};

const STATS = [
  { label: "Нийт дэмжсэн",         value: "₮285,000", icon: Wallet,     color: "text-blue-700",    bg: "bg-blue-50"  },
  { label: "Дэмжсэн төслүүд",      value: "6",         icon: Heart,      color: "text-rose-600",    bg: "bg-rose-50"  },
  { label: "Үүсгэсэн төслүүд",     value: "2",         icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-50" },
];

const BACKED: BackedProject[] = [
  { project: MOCK_PROJECTS[0], pledgeAmount: 50_000,  pledgeDate: "2025-01-15", status: "active" },
  { project: MOCK_PROJECTS[1], pledgeAmount: 100_000, pledgeDate: "2024-12-20", status: "active" },
  { project: MOCK_PROJECTS[3], pledgeAmount: 15_000,  pledgeDate: "2025-02-01", status: "active" },
  { project: MOCK_PROJECTS[5], pledgeAmount: 75_000,  pledgeDate: "2024-11-10", status: "funded" },
  { project: MOCK_PROJECTS[7], pledgeAmount: 25_000,  pledgeDate: "2025-01-28", status: "active" },
  { project: MOCK_PROJECTS[2], pledgeAmount: 20_000,  pledgeDate: "2024-10-05", status: "funded" },
];

const CREATED: Project[] = [MOCK_PROJECTS[0], MOCK_PROJECTS[3]];

const STATUS_CONFIG = {
  active: { label: "Идэвхтэй",   dot: "bg-green-400", text: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
  funded: { label: "Санхүүжсэн", dot: "bg-blue-500",  text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"  },
  ended:  { label: "Дууссан",    dot: "bg-slate-400",  text: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-200" },
};

const CATEGORY_LABELS: Record<string, string> = {
  technology: "Технологи", arts: "Урлаг",      film: "Кино",    environment: "Байгаль",
  games: "Тоглоом",        health: "Эрүүл мэнд", education: "Боловсрол", community: "Нийгэм",
  food: "Хоол & Ундаа",   fashion: "Загвар",   music: "Хөгжим", publishing: "Хэвлэл",
};

/* ── Root component ─────────────────────────────────────────────── */

interface ProfileClientProps { initialTab?: ProfileTab; }

export function ProfileClient({ initialTab = "backed" }: ProfileClientProps) {
  const [tab, setTab] = useState<ProfileTab>(initialTab);

  const tabs: { id: ProfileTab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "backed",   label: "Дэмжсэн төслүүд", icon: Heart,     count: BACKED.length  },
    { id: "projects", label: "Миний төслүүд",    icon: FolderOpen, count: CREATED.length },
    { id: "settings", label: "Тохиргоо",         icon: Settings2               },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">

        {/* ── Profile hero ──────────────────────────────── */}
        <section className="gradient-brand-hero pt-24 pb-14 relative overflow-hidden">
          {/* Decorative blobs */}
          <div aria-hidden className="absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #93C5FD, transparent 70%)" }} />
          <div aria-hidden className="absolute bottom-0 left-1/4 w-96 h-40 opacity-10"
            style={{ background: "radial-gradient(ellipse, #60A5FA, transparent 70%)" }} />

          <div className="container-page relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">

              {/* Avatar */}
              <div className="relative flex-shrink-0 self-start sm:self-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white/25 shadow-2xl">
                  <Image
                    src={USER.avatar}
                    alt={USER.name}
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                </div>
                {USER.isVerified && (
                  <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <h1 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
                        {USER.name}
                      </h1>
                      {USER.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3" strokeWidth={3} />
                          Баталгаажсан
                        </span>
                      )}
                    </div>
                    <p className="text-white/65 text-sm max-w-lg leading-relaxed mb-3">
                      {USER.bio}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" strokeWidth={2} />
                        {USER.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
                        {USER.memberSince}-аас гишүүн
                      </span>
                    </div>
                  </div>

                  <button className="self-start inline-flex items-center gap-2 text-sm font-semibold text-white border border-white/25 hover:border-white/50 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl transition-all backdrop-blur-sm flex-shrink-0">
                    <Edit3 className="w-3.5 h-3.5" strokeWidth={2} />
                    Профайл засах
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ───────────────────────────────── */}
        <div className="bg-white border-b border-slate-100 shadow-sm">
          <div className="container-page">
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {STATS.map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex flex-col sm:flex-row sm:items-center sm:gap-4 py-4 sm:py-5 px-3 sm:px-6">
                    <div className={cn("hidden sm:flex w-10 h-10 rounded-xl items-center justify-center flex-shrink-0", stat.bg)}>
                      <Icon className={cn("w-5 h-5", stat.color)} strokeWidth={2} />
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-display font-bold text-xl sm:text-2xl text-slate-900">{stat.value}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-tight">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tabs + content ────────────────────────────── */}
        <div className="container-page py-8 sm:py-10">

          {/* Tab bar */}
          <div className="inline-flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 mb-8 w-full sm:w-auto overflow-x-auto">
            {tabs.map(t => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0",
                    isActive
                      ? "bg-blue-800 text-white shadow-md"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  {t.label}
                  {t.count !== undefined && (
                    <span className={cn(
                      "text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === "backed"   && <BackedTab />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "settings" && <SettingsTab />}
        </div>

      </main>
      <Footer />
    </>
  );
}

/* ── Backed Projects tab ────────────────────────────────────────── */

function BackedTab() {
  if (BACKED.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-6 h-6 text-slate-400" />}
        title="Дэмжсэн төсөл байхгүй"
        description="Та одоогоор ямар ч төслийг дэмжээгүй байна. Сонирхолтой төслүүдийг үзнэ үү."
        action={<Link href="/explore" className="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">Төслүүд харах</Link>}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {BACKED.map(item => (
        <BackedCard key={item.project.id} item={item} />
      ))}
    </div>
  );
}

function BackedCard({ item }: { item: BackedProject }) {
  const { project, pledgeAmount, pledgeDate, status } = item;
  const percent = fundingPercent(project.raised, project.goal);
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group">
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Thumbnail */}
        <Link href={`/projects/${project.slug}`} className="relative flex-shrink-0 w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link
              href={`/projects/${project.slug}`}
              className="font-display font-bold text-slate-900 text-sm sm:text-[15px] leading-snug line-clamp-2 hover:text-blue-800 transition-colors"
            >
              {project.title}
            </Link>
            {/* Status badge */}
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0",
              cfg.bg, cfg.text, cfg.border
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
              {cfg.label}
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-2">
            {CATEGORY_LABELS[project.category] ?? project.category} · {pledgeDate}
          </p>

          {/* Thank you badge + pledge */}
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
              <Heart className="w-3 h-3 fill-rose-500 stroke-none" />
              Баярлалаа
            </span>
            <span className="text-xs font-semibold text-slate-700">
              ₮{pledgeAmount.toLocaleString()} дэмжсэн
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar footer */}
      <div className="px-4 sm:px-5 pb-4">
        <ProgressBar value={percent} raised={project.raised} goal={project.goal} />
      </div>
    </div>
  );
}

/* ── My Projects tab ────────────────────────────────────────────── */

function ProjectsTab() {
  return (
    <div className="space-y-5">
      {/* Header with Add button */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{CREATED.length} төсөл байршуулсан</p>
        <Link
          href="/start-project"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Шинэ төсөл
        </Link>
      </div>

      {CREATED.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-6 h-6 text-slate-400" />}
          title="Үүсгэсэн төсөл байхгүй"
          description="Та одоогоор төсөл нийтлээгүй байна. Өөрийн санааг хэрэгжүүлж эхлэх үү?"
          action={<Link href="/start-project" className="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">Төсөл эхлэх</Link>}
        />
      ) : (
        <div className="space-y-4">
          {CREATED.map(project => (
            <CreatedProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function CreatedProjectCard({ project }: { project: Project }) {
  const percent = fundingPercent(project.raised, project.goal);
  const daysUrgent = project.daysLeft <= 7;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Cover image */}
        <div className="relative sm:w-48 h-44 sm:h-auto flex-shrink-0 bg-slate-100">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 192px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
          {project.isTrending && (
            <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-full">
              🔥 Онцлох
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full mb-1.5 inline-block">
                {CATEGORY_LABELS[project.category] ?? project.category}
              </span>
              <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg leading-snug line-clamp-2">
                {project.title}
              </h3>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Link
                href={`/projects/${project.slug}`}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-800 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all"
                title="Харах"
              >
                <Eye className="w-4 h-4" strokeWidth={2} />
              </Link>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-800 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all"
                title="Засах"
              >
                <Pencil className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          <ProgressBar value={percent} raised={project.raised} goal={project.goal} />

          <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" strokeWidth={2} />
                {project.backers.toLocaleString()} дэмжигч
              </span>
              <span className={cn("font-semibold", daysUrgent ? "text-red-600" : "text-slate-600")}>
                {project.daysLeft} өдөр үлдсэн
              </span>
            </div>
            <span className="font-bold text-blue-800 text-sm">
              {percent.toFixed(0)}% санхүүжсэн
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Settings tab ───────────────────────────────────────────────── */

function SettingsTab() {
  const [profile, setProfile] = useState({
    name:     USER.name,
    bio:      USER.bio,
    location: USER.location,
    email:    USER.email,
  });

  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });

  const [notifs, setNotifs] = useState({
    newBacker:       true,
    projectUpdates:  true,
    emailNotifs:     true,
    fundingAlerts:   false,
    weeklyDigest:    true,
  });

  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl">

      {/* Save success banner */}
      {saved && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold px-4 py-3.5 rounded-xl animate-fade-up">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
          Өөрчлөлтүүд амжилттай хадгалагдлаа.
        </div>
      )}

      {/* ── Profile info ──────────────────────────────── */}
      <SettingsCard
        icon={<Edit3 className="w-4 h-4" strokeWidth={2} />}
        title="Хувийн мэдээлэл"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Нэр</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400"
              placeholder="Таны нэр"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Товч танилцуулга</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none placeholder-slate-400 leading-relaxed"
              placeholder="Өөрийгөө товч танилцуулна уу..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Байршил</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
              <input
                type="text"
                value={profile.location}
                onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400"
                placeholder="Улаанбаатар, Монгол"
              />
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* ── Login info ────────────────────────────────── */}
      <SettingsCard
        icon={<Lock className="w-4 h-4" strokeWidth={2} />}
        title="Нэвтрэх мэдээлэл"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">И-мэйл хаяг</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Нууц үг солих</p>

          {[
            { id: "current", label: "Одоогийн нууц үг",          placeholder: "••••••••" },
            { id: "next",    label: "Шинэ нууц үг",              placeholder: "8+ тэмдэгт" },
            { id: "confirm", label: "Шинэ нууц үгийг давтах",    placeholder: "••••••••" },
          ].map(f => (
            <div key={f.id}>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
                <input
                  type="password"
                  value={password[f.id as keyof typeof password]}
                  onChange={e => setPassword(p => ({ ...p, [f.id]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-slate-400"
                />
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* ── Notification prefs ────────────────────────── */}
      <SettingsCard
        icon={<Bell className="w-4 h-4" strokeWidth={2} />}
        title="Мэдэгдлийн тохиргоо"
      >
        <div className="space-y-0 divide-y divide-slate-50">
          {[
            { key: "newBacker",      label: "Шинэ дэмжигч",             desc: "Таны төслийг хэн нэгэн дэмжихэд мэдэгдэл авах"        },
            { key: "projectUpdates", label: "Төслийн шинэчлэлт",        desc: "Дэмжсэн төслүүд шинэ шинэчлэлт нийтлэхэд мэдэгдэл авах" },
            { key: "emailNotifs",    label: "И-мэйл мэдэгдэл",          desc: "Чухал мэдэгдлийг и-мэйлээр хүлээн авах"               },
            { key: "fundingAlerts",  label: "Санхүүжилтийн дохио",      desc: "Зорилтын 50%, 75%, 100% хүрэхэд мэдэгдэл авах"        },
            { key: "weeklyDigest",   label: "Долоо хоногийн тойм",      desc: "Долоо хоног бүр шилдэг төслүүдийн хураангуй авах"      },
          ].map(item => {
            const isOn = notifs[item.key as keyof typeof notifs];
            return (
              <div key={item.key} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  onClick={() => setNotifs(n => ({ ...n, [item.key]: !isOn }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2",
                    isOn ? "bg-blue-800" : "bg-slate-200"
                  )}
                >
                  <span className={cn(
                    "inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md transition-transform duration-200",
                    isOn ? "translate-x-[22px]" : "translate-x-[3px]"
                  )} />
                </button>
              </div>
            );
          })}
        </div>
      </SettingsCard>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={() => setProfile({ name: USER.name, bio: USER.bio, location: USER.location, email: USER.email })}
          className="text-sm font-semibold text-slate-600 hover:text-slate-800 px-5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          Болих
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-cta transition-colors"
        >
          <Check className="w-4 h-4" strokeWidth={2.5} />
          Хадгалах
        </button>
      </div>
    </form>
  );
}

/* ── Shared sub-components ──────────────────────────────────────── */

function SettingsCard({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 sm:px-6 py-4 border-b border-slate-50 bg-slate-50/50">
        <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-display font-bold text-slate-900 text-sm">{title}</h3>
      </div>
      <div className="px-5 sm:px-6 py-5">{children}</div>
    </div>
  );
}

function EmptyState({
  icon, title, description, action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-card">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-display font-bold text-slate-800 text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
