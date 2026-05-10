"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck, Clock, Users, TrendingUp,
  CheckCircle, XCircle, Loader2, Search, ChevronLeft, ChevronRight,
  Trash2, Pencil, Star, Flame, BadgeCheck, X, Save,
  FolderKanban, Banknote, UserPlus, FilePlus, ArrowRight, RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMNT } from "@/lib/formatters";
import { useToast } from "@/context/ToastContext";
import { useAdminStats } from "@/context/AdminStatsContext";
import { ProjectDetailModal } from "@/components/admin/ProjectDetailModal";

/* ═══════════════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════════════ */

interface Stats {
  totalProjects: number;
  pendingCount:  number;
  activeCount:   number;
  rejectedCount: number;
  totalUsers:    number;
  totalRaised:   number;
  totalBackers:  number;
}

interface RecentProject {
  id:          string;
  title:       string;
  slug:        string;
  category:    string;
  goal:        number;
  raised:      number;
  status:      string;
  coverImage:  string | null;
  createdAt:   string;
  endsAt:      string;
  creator:     { name: string };
}

interface ActivityItem {
  type:   "user_signup" | "project_pending";
  id:     string;
  label:  string;
  detail: string;
  time:   string;
}

interface OverviewData {
  stats:          Stats;
  recentProjects: RecentProject[];
  activity:       ActivityItem[];
}

interface AdminProject {
  id:             string;
  title:          string;
  description:    string;
  category:       string;
  goal:           number;
  raised:         number;
  backers:        number;
  location:       string;
  status:         string;
  isVerified:     boolean;
  isTrending:     boolean;
  isFeatured:     boolean;
  coverImage:     string | null;
  endsAt:         string;
  createdAt:      string;
  rejectionReason: string | null;
  creator: {
    id:         string;
    name:       string;
    email:      string | null;
    phone:      string | null;
    isVerified: boolean;
  };
  _count: { donations: number };
}

interface AdminUser {
  id:         string;
  name:       string;
  email:      string | null;
  phone:      string | null;
  role:       "USER" | "ADMIN";
  avatar:     string | null;
  isVerified: boolean;
  createdAt:  string;
  _count: { projects: number; donations: number };
}

type Tab = "overview" | "queue" | "all" | "users";

const STATUS_LABEL: Record<string, { label: string; bg: string; text: string }> = {
  PENDING:   { label: "Хүлээгдэж байна", bg: "bg-amber-100",  text: "text-amber-700"  },
  ACTIVE:    { label: "Нийтлэгдсэн",     bg: "bg-emerald-100",text: "text-emerald-700" },
  REJECTED:  { label: "Татгалзагдсан",   bg: "bg-red-100",    text: "text-red-700"    },
  FUNDED:    { label: "Санхүүжсэн",      bg: "bg-blue-100",   text: "text-blue-700"   },
  FAILED:    { label: "Амжилтгүй",       bg: "bg-slate-100",  text: "text-slate-600"  },
  CANCELLED: { label: "Цуцлагдсан",      bg: "bg-slate-100",  text: "text-slate-600"  },
};

/* ═══════════════════════════════════════════════════════════════════
   Overview helpers
═══════════════════════════════════════════════════════════════════ */

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "Дэнглэж байна";
  if (m < 60) return `${m} мин өмнө`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} цаг өмнө`;
  return `${Math.floor(h / 24)} өдрийн өмнө`;
}

function daysLeft(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

/* ── Shimmer skeleton ───────────────────────────────────────────── */
function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("bg-slate-200 rounded-lg animate-pulse", className)} />
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stat card skeletons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
            <Shimmer className="w-12 h-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-7 w-16" />
              <Shimmer className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <Shimmer className="h-5 w-40" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Shimmer className="h-3.5 w-3/4" />
                <Shimmer className="h-2 w-full rounded-full" />
              </div>
              <Shimmer className="h-6 w-20 rounded-full flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Activity skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
          <Shimmer className="h-5 w-32" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Shimmer className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-3.5 w-3/4" />
                <Shimmer className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Error state ────────────────────────────────────────────────── */
function OverviewError({ onRetry, statusCode }: { onRetry: () => void; statusCode?: number }) {
  const [retrying, setRetrying] = useState(false);

  async function handleRetry() {
    setRetrying(true);
    // Give the parent a tick to swap to <OverviewSkeleton> before we stop spinning
    await new Promise(r => setTimeout(r, 120));
    onRetry();
  }

  const authFailed = statusCode === 401 || statusCode === 403;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
      </div>
      <h3 className="font-bold text-slate-900 text-lg mb-1">Мэдээлэл ачааллахад алдаа гарлаа</h3>
      <p className="text-slate-400 text-sm mb-1 max-w-xs">
        {authFailed
          ? "Таны сесс дууссан байна. Дахин нэвтэрч орно уу."
          : "Серверт холбогдоход асуудал гарлаа. Дахин оролдоно уу."}
      </p>
      {statusCode && (
        <p className="text-[11px] text-slate-300 mb-5 font-mono">HTTP {statusCode}</p>
      )}
      {!statusCode && <div className="mb-5" />}
      {authFailed ? (
        <a
          href="/login?role=admin"
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Нэвтрэх
        </a>
      ) : (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          {retrying
            ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
            : <RefreshCw className="w-4 h-4" strokeWidth={2} />}
          Дахин ачаалах
        </button>
      )}
    </div>
  );
}

/* ── Premium stat card ──────────────────────────────────────────── */
const CARD_THEMES = {
  blue:   { icon: "bg-blue-700",   border: "border-blue-100",   bar: "bg-blue-600"   },
  green:  { icon: "bg-emerald-600",border: "border-emerald-100",bar: "bg-emerald-500" },
  purple: { icon: "bg-violet-600", border: "border-violet-100", bar: "bg-violet-500" },
  amber:  { icon: "bg-amber-500",  border: "border-amber-100",  bar: "bg-amber-400"  },
} as const;

function StatCard({
  label, value, sub, icon: Icon, theme,
}: {
  label: string; value: string | number;
  sub?: string; icon: React.ElementType;
  theme: keyof typeof CARD_THEMES;
}) {
  const t = CARD_THEMES[theme];
  return (
    <div className={cn(
      "relative bg-white rounded-2xl border shadow-sm p-5 overflow-hidden",
      t.border
    )}>
      {/* Subtle top accent stripe */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl", t.bar)} />

      <div className="flex items-start gap-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm", t.icon)}>
          <Icon className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 leading-none tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

/* ── Project status table ───────────────────────────────────────── */
const DEFAULT_COVER = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=64&q=70";

function ProjectStatusTable({ projects }: { projects: RecentProject[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <FolderKanban className="w-10 h-10 mb-2 text-slate-300" strokeWidth={1.5} />
        <p className="text-sm font-medium">Төсөл байхгүй байна</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {projects.map(p => {
        const percent = p.goal > 0 ? Math.min(100, Math.round((p.raised / p.goal) * 100)) : 0;
        const st      = STATUS_LABEL[p.status] ?? STATUS_LABEL.PENDING;
        const left    = daysLeft(p.endsAt);

        return (
          <div key={p.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 group">
            {/* Cover */}
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.coverImage ?? DEFAULT_COVER}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Info + progress */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      percent >= 100 ? "bg-emerald-500" :
                      percent >= 50  ? "bg-blue-500"    :
                                        "bg-amber-400"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500 tabular-nums w-8 text-right flex-shrink-0">
                  {percent}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {p.raised.toLocaleString()}₮ / {p.goal.toLocaleString()}₮
                {left > 0 && <span className="ml-2">· {left} өдөр</span>}
              </p>
            </div>

            {/* Status badge */}
            <span className={cn(
              "flex-shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full",
              st.bg, st.text
            )}>
              {st.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Activity feed ──────────────────────────────────────────────── */
function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <Users className="w-8 h-8 mb-2 text-slate-300" strokeWidth={1.5} />
        <p className="text-sm font-medium">Идэвхжил байхгүй</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const isSignup = item.type === "user_signup";
        return (
          <div key={`${item.id}-${i}`} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              isSignup ? "bg-violet-100" : "bg-amber-100"
            )}>
              {isSignup
                ? <UserPlus  className="w-3.5 h-3.5 text-violet-600" strokeWidth={2} />
                : <FilePlus  className="w-3.5 h-3.5 text-amber-600"  strokeWidth={2} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">{item.detail}</p>
            </div>
            <span className="text-[11px] text-slate-400 flex-shrink-0 mt-0.5 whitespace-nowrap">
              {relTime(item.time)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Inline Edit Modal
═══════════════════════════════════════════════════════════════════ */

function EditModal({
  project,
  onClose,
  onSaved,
}: {
  project: AdminProject;
  onClose: () => void;
  onSaved: (updated: AdminProject) => void;
}) {
  const [form, setForm] = useState({
    title:       project.title,
    description: project.description,
    goal:        project.goal,
    endsAt:      project.endsAt.slice(0, 10),
    category:    project.category,
    location:    project.location,
    isTrending:  project.isTrending,
    isFeatured:  project.isFeatured,
    isVerified:  project.isVerified,
  });
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, goal: Number(form.goal) }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { project: AdminProject };
      show("Төсөл амжилттай шинэчлэгдлээ", "info");
      onSaved(data.project);
    } catch {
      show("Шинэчлэхэд алдаа гарлаа", "error");
    } finally {
      setSaving(false);
    }
  }

  const field = (
    label: string,
    key: keyof typeof form,
    type: "text" | "number" | "date" | "checkbox" = "text"
  ) => (
    <div key={key}>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      {type === "checkbox" ? (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form[key] as boolean}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
            className="w-4 h-4 rounded accent-blue-700"
          />
          <span className="text-sm text-slate-700">{label}</span>
        </label>
      ) : (
        <input
          type={type}
          value={form[key] as string | number}
          onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Төсөл засварлах</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {field("Нэр", "title")}
          {field("Тайлбар", "description")}
          {field("Зорилго (₮)", "goal", "number")}
          {field("Дуусах огноо", "endsAt", "date")}
          {field("Категори", "category")}
          {field("Байршил", "location")}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {field("Трэнд", "isTrending", "checkbox")}
            {field("Онцолсон", "isFeatured", "checkbox")}
            {field("Баталгаажсан", "isVerified", "checkbox")}
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Хадгалах
          </button>
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Цуцлах
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Projects Tab (shared by Queue and All Projects)
═══════════════════════════════════════════════════════════════════ */

function ProjectsTab({ statusFilter }: { statusFilter: "pending" | "all" }) {
  const [projects, setProjects]       = useState<AdminProject[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [q, setQ]                     = useState("");
  const [loading, setLoading]         = useState(true);
  const [actionId, setActionId]       = useState<string | null>(null);
  const [rejectId, setRejectId]       = useState<string | null>(null);
  const [rejectReason, setReason]     = useState("");
  const [editProject, setEdit]        = useState<AdminProject | null>(null);
  const [detailId, setDetailId]       = useState<string | null>(null);
  const { show }                      = useToast();
  const { decrementPending }          = useAdminStats();
  const debounceRef                   = useRef<ReturnType<typeof setTimeout>>();

  const fetchProjects = useCallback(async (p = 1, search = q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: String(p),
        ...(search ? { q: search } : {}),
      });
      const res = await fetch(`/api/admin/projects?${params}`);
      if (!res.ok) {
        console.error(`[projects] HTTP ${res.status}`, await res.text().catch(() => ""));
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json() as { projects: AdminProject[]; total: number };
      setProjects(data.projects);
      setTotal(data.total);
    } catch (err) {
      console.error("[projects] fetch failed", err);
      show("Мэдээлэл ачааллахад алдаа гарлаа.", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, q, show]);

  useEffect(() => { fetchProjects(1); }, [statusFilter]);

  function handleSearch(val: string) {
    setQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchProjects(1, val); }, 400);
  }

  async function decide(id: string, action: "approve" | "reject", reason?: string) {
    setActionId(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) throw new Error();
      show(action === "approve" ? "Төсөл батлагдлаа ✓" : "Төсөл татгалзагдлаа", action === "approve" ? "info" : "warning");
      setTotal(t => t - 1);
      decrementPending();   // ← real-time sync across sidebar + header
    } catch {
      show("Алдаа гарлаа. Дахин оролдоно уу.", "error");
      fetchProjects(page);
    } finally {
      setActionId(null); setRejectId(null); setReason("");
    }
  }

  async function softDelete(id: string) {
    if (!confirm("Энэ төслийг устгах уу? Буцаах боломжгүй.")) return;
    setActionId(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      show("Төсөл устгагдлаа", "warning");
      setTotal(t => t - 1);
    } catch {
      show("Устгахад алдаа гарлаа", "error");
      fetchProjects(page);
    } finally {
      setActionId(null);
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <>
      {/* Project detail modal */}
      {detailId && (
        <ProjectDetailModal
          projectId={detailId}
          onClose={() => setDetailId(null)}
          onDecide={decide}
          acting={!!actionId}
        />
      )}

      {editProject && (
        <EditModal
          project={editProject}
          onClose={() => setEdit(null)}
          onSaved={updated => {
            setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
            setEdit(null);
          }}
        />
      )}

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Нэр, тайлбараар хайх..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <span className="text-sm text-slate-400">{total} төсөл</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
          <p className="font-medium">Жагсаалт хоосон байна</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => {
            const st = STATUS_LABEL[p.status] ?? STATUS_LABEL.PENDING;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Clickable info section — opens detail modal */}
                <div
                  className="flex items-start gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setDetailId(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && setDetailId(p.id)}
                  aria-label={`${p.title} дэлгэрэнгүй харах`}
                >
                  {/* Cover thumb */}
                  {p.coverImage && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={cn("inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full", st.bg, st.text)}>
                        {st.label}
                      </span>
                      {p.isVerified  && <span title="Баталгаажсан"><BadgeCheck className="w-3.5 h-3.5 text-blue-600" /></span>}
                      {p.isTrending  && <span title="Трэнд"><Flame className="w-3.5 h-3.5 text-orange-500" /></span>}
                      {p.isFeatured  && <span title="Онцолсон"><Star className="w-3.5 h-3.5 text-yellow-500" /></span>}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm truncate">{p.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-slate-400">
                      <span>Бүтээгч: <span className="text-slate-600 font-medium">{p.creator.name}</span></span>
                      <span>Зорилго: <span className="text-slate-600 font-medium">{p.goal.toLocaleString()}₮</span></span>
                      <span>Цугласан: <span className="text-slate-600 font-medium">{p.raised.toLocaleString()}₮</span></span>
                      <span>Хандив: <span className="text-slate-600 font-medium">{p._count.donations}</span></span>
                    </div>
                  </div>

                  {/* Actions — stop propagation so clicks don't open the detail modal */}
                  <div
                    className="flex items-center gap-1.5 flex-shrink-0"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setEdit(p)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Засварлах"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => softDelete(p.id)}
                      disabled={actionId === p.id}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Устгах"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Approve/Reject row — only for PENDING */}
                {p.status === "PENDING" && (
                  <div
                    className="flex items-center gap-3 px-5 py-3 bg-amber-50 border-t border-amber-100"
                    onClick={e => e.stopPropagation()}
                  >
                    {rejectId === p.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          placeholder="Татгалзах шалтгаан (заавал биш)"
                          value={rejectReason}
                          onChange={e => setReason(e.target.value)}
                          className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-300"
                          onKeyDown={e => {
                            if (e.key === "Enter") decide(p.id, "reject", rejectReason || undefined);
                            if (e.key === "Escape") { setRejectId(null); setReason(""); }
                          }}
                        />
                        <button
                          onClick={() => decide(p.id, "reject", rejectReason || undefined)}
                          disabled={!!actionId}
                          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl disabled:opacity-50"
                        >
                          {actionId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          Татгалзах
                        </button>
                        <button
                          onClick={() => { setRejectId(null); setReason(""); }}
                          className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-xl hover:bg-slate-100"
                        >
                          Цуцлах
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => decide(p.id, "approve")}
                          disabled={!!actionId}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {actionId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Батлах
                        </button>
                        <button
                          onClick={() => setRejectId(p.id)}
                          disabled={!!actionId}
                          className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          Татгалзах
                        </button>
                        <span className="text-xs text-amber-600 ml-auto">
                          {new Date(p.createdAt).toLocaleDateString("mn-MN")}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => { setPage(p => p - 1); fetchProjects(page - 1); }}
            disabled={page <= 1}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-600 font-medium">{page} / {totalPages}</span>
          <button
            onClick={() => { setPage(p => p + 1); fetchProjects(page + 1); }}
            disabled={page >= totalPages}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Users Tab
═══════════════════════════════════════════════════════════════════ */

function UsersTab() {
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [q, setQ]               = useState("");
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const { show }                = useToast();
  const debounceRef             = useRef<ReturnType<typeof setTimeout>>();

  const fetchUsers = useCallback(async (p = 1, search = q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), ...(search ? { q: search } : {}) });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        console.error(`[users] HTTP ${res.status}`, await res.text().catch(() => ""));
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json() as { users: AdminUser[]; total: number };
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error("[users] fetch failed", err);
      show("Мэдээлэл ачааллахад алдаа гарлаа.", "error");
    } finally {
      setLoading(false);
    }
  }, [q, show]);

  useEffect(() => { fetchUsers(1); }, []);

  function handleSearch(val: string) {
    setQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); fetchUsers(1, val); }, 400);
  }

  async function toggleRole(user: AdminUser) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setActionId(user.id);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      show(`${user.name}-г ${newRole === "ADMIN" ? "Админ болголоо" : "Хэрэглэгч болголоо"}`, "info");
    } catch {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: user.role } : u));
      show("Алдаа гарлаа", "error");
    } finally {
      setActionId(null);
    }
  }

  async function toggleVerify(user: AdminUser) {
    const newVal = !user.isVerified;
    setActionId(user.id);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isVerified: newVal } : u));
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: newVal }),
      });
      if (!res.ok) throw new Error();
      show(`${user.name}: баталгаажуулалт ${newVal ? "идэвхжлээ" : "цуцлагдлаа"}`, "info");
    } catch {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isVerified: user.isVerified } : u));
      show("Алдаа гарлаа", "error");
    } finally {
      setActionId(null);
    }
  }

  const totalPages = Math.ceil(total / 30);

  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Нэр, имэйл, утасны дугаараар..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <span className="text-sm text-slate-400">{total} хэрэглэгч</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div
              key={u.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                {u.avatar
                  ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-sm">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                  {u.role === "ADMIN" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-900 text-white rounded-md">ADMIN</span>
                  )}
                  {u.isVerified && (
                    <span title="Баталгаажсан"><BadgeCheck className="w-3.5 h-3.5 text-blue-600" /></span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{u.email ?? u.phone ?? "—"}</p>
                <p className="text-xs text-slate-400">
                  {u._count.projects} төсөл · {u._count.donations} хандив · {new Date(u.createdAt).toLocaleDateString("mn-MN")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleVerify(u)}
                  disabled={actionId === u.id}
                  title={u.isVerified ? "Баталгаажуулалт цуцлах" : "Баталгаажуулах"}
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50",
                    u.isVerified
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {actionId === u.id
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <BadgeCheck className="w-3 h-3" />
                  }
                  {u.isVerified ? "Баталгаажсан" : "Баталгаажуулах"}
                </button>
                <button
                  onClick={() => toggleRole(u)}
                  disabled={actionId === u.id}
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50",
                    u.role === "ADMIN"
                      ? "bg-slate-900 text-white hover:bg-slate-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {actionId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                  {u.role === "ADMIN" ? "Хасах" : "Админ болгох"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => { setPage(p => p - 1); fetchUsers(page - 1); }}
            disabled={page <= 1}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-600 font-medium">{page} / {totalPages}</span>
          <button
            onClick={() => { setPage(p => p + 1); fetchUsers(page + 1); }}
            disabled={page >= totalPages}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Root Dashboard
   The AdminShell (header + sidebar) wraps this via app/admin/layout.tsx.
   This component only renders the content area for the active tab.
═══════════════════════════════════════════════════════════════════ */

const PAGE_META: Record<Tab, { title: string; sub: string }> = {
  overview: { title: "Нүүр",             sub: "crowdfund.mn платформын нийт статистик" },
  queue:    { title: "Хүлээгдэж байна",   sub: "Батлах эсвэл татгалзах шаардлагатай хүсэлтүүд" },
  all:      { title: "Бүх төслүүд",       sub: "Бүх статусын төслүүдийг удирдах" },
  users:    { title: "Хэрэглэгчид",       sub: "Системийн хэрэглэгчдийг удирдах" },
};

export function AdminDashboardClient() {
  const searchParams              = useSearchParams();
  const router                    = useRouter();
  const { pendingCount }          = useAdminStats();

  const [overview, setOverview]      = useState<OverviewData | null>(null);
  const [overviewState, setOvSt]     = useState<"loading" | "ok" | "error">("loading");
  const [overviewStatus, setOvStatus] = useState<number | undefined>(undefined);

  const tabParam  = searchParams.get("tab") as Tab | null;
  const activeTab: Tab = tabParam ?? "overview";
  const meta = PAGE_META[activeTab];

  const loadOverview = useCallback(async () => {
    setOvSt("loading");
    setOvStatus(undefined);
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[admin/overview] HTTP ${res.status}:`, body || "(empty body)");
        if (res.status === 401 || res.status === 403) {
          console.error("[admin/overview] Auth failed — cfmn_session cookie may be missing or expired.");
        }
        setOvStatus(res.status);
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json() as OverviewData;
      setOverview(data);
      setOvSt("ok");
    } catch (err) {
      console.error("[admin/overview] fetch failed:", err instanceof Error ? err.message : err);
      setOvSt("error");
    }
  }, []);

  useEffect(() => {
    if (activeTab === "overview") loadOverview();
  }, [activeTab, loadOverview]);

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{meta.title}</h1>
        <p className="text-slate-500 text-sm mt-1.5">{meta.sub}</p>
      </div>

      {/* ══ Overview tab ══════════════════════════════════ */}
      {activeTab === "overview" && (
        <>
          {overviewState === "loading" && <OverviewSkeleton />}
          {overviewState === "error"   && <OverviewError onRetry={loadOverview} statusCode={overviewStatus} />}
          {overviewState === "ok" && overview && (
            <div className="space-y-6">

              {/* ── Row 1: 4 stat cards ─────────────────── */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  label="Нийт төсөл"
                  value={overview.stats.totalProjects}
                  sub={`${overview.stats.activeCount} идэвхтэй`}
                  icon={FolderKanban}
                  theme="blue"
                />
                <StatCard
                  label="Цугласан дүн"
                  value={formatMNT(overview.stats.totalRaised)}
                  sub={`${overview.stats.totalBackers.toLocaleString()} дэмжигч`}
                  icon={Banknote}
                  theme="green"
                />
                <StatCard
                  label="Нийт хэрэглэгч"
                  value={overview.stats.totalUsers}
                  sub="Бүртгэлтэй хэрэглэгчид"
                  icon={Users}
                  theme="purple"
                />
                <StatCard
                  label="Хүлээгдэж байна"
                  value={pendingCount}
                  sub={pendingCount > 0 ? "Батлах шаардлагатай" : "Бүх хүсэлт шалгагдсан"}
                  icon={Clock}
                  theme="amber"
                />
              </div>

              {/* ── Row 2: Project table + Activity feed ─── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Project status table — 2/3 width */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">Сүүлийн төслүүд</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Санхүүжилтийн явц ба статус</p>
                    </div>
                    <button
                      onClick={() => router.push("/admin/dashboard?tab=all")}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                    >
                      Бүгдийг харах
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="px-5 py-2">
                    <ProjectStatusTable projects={overview.recentProjects} />
                  </div>
                </div>

                {/* Activity feed — 1/3 width */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">Сүүлийн идэвхжил</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Бүртгэл ба шинэ хүсэлт</p>
                    </div>
                  </div>
                  <div className="px-5 py-2">
                    <ActivityFeed items={overview.activity} />
                  </div>
                </div>

              </div>

              {/* ── Row 3: Quick actions ────────────────── */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-bold text-slate-900 mb-4">Хурдан үйлдэл</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    {
                      label: "Хүлээгдэж буй хүсэлтүүд",
                      href:  "/admin/dashboard?tab=queue",
                      icon:  Clock,
                      color: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100",
                      badge: overview.stats.pendingCount,
                    },
                    {
                      label: "Бүх төслийг удирдах",
                      href:  "/admin/dashboard?tab=all",
                      icon:  FolderKanban,
                      color: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100",
                      badge: 0,
                    },
                    {
                      label: "Хэрэглэгчид удирдах",
                      href:  "/admin/dashboard?tab=users",
                      icon:  Users,
                      color: "bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100",
                      badge: 0,
                    },
                  ] as const).map(a => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.href}
                        onClick={() => router.push(a.href)}
                        className={cn(
                          "flex items-center gap-3 border rounded-xl px-4 py-3.5 text-sm font-semibold text-left transition-colors group",
                          a.color
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0 opacity-70" strokeWidth={2} />
                        <span className="flex-1">{a.label}</span>
                        {a.badge > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {a.badge}
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" strokeWidth={2} />
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* Review Queue */}
      {activeTab === "queue" && <ProjectsTab statusFilter="pending" />}

      {/* All Projects */}
      {activeTab === "all" && <ProjectsTab statusFilter="all" />}

      {/* Users */}
      {activeTab === "users" && <UsersTab />}

    </div>
  );
}
