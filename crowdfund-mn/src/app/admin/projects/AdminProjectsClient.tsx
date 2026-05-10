"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Eye, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

/* ── Types ──────────────────────────────────────────────────────── */

interface PendingProject {
  id: string;
  title: string;
  category: string;
  description: string;
  goal: number;
  location: string;
  createdAt: string;
  creator: { id: string; name: string; email: string | null; phone: string | null };
  rewards: { id: string; title: string; amount: number }[];
}

/* ── Main component ─────────────────────────────────────────────── */

export function AdminProjectsClient() {
  const [projects, setProjects]           = useState<PendingProject[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [loadingId, setLoadingId]         = useState<string | null>(null);
  const [rejectId,  setRejectId]          = useState<string | null>(null);
  const [rejectReason, setRejectReason]   = useState("");
  const [expanded, setExpanded]           = useState<string | null>(null);
  const { show }                          = useToast();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error();
      const data = await res.json() as { projects: PendingProject[] };
      setProjects(data.projects);
    } catch {
      show("Мэдээлэл ачааллахад алдаа гарлаа.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [show]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const decide = useCallback(async (
    id: string,
    action: "approve" | "reject",
    reason?: string
  ) => {
    setLoadingId(id);
    // Optimistic: remove from list immediately
    setProjects(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) throw new Error(await res.text());

      show(
        action === "approve"
          ? "Төсөл амжилттай батлагдлаа ✓"
          : "Төсөл татгалзагдлаа",
        action === "approve" ? "info" : "warning"
      );
    } catch {
      show("Алдаа гарлаа. Дахин оролдоно уу.", "error");
      fetchProjects(); // re-fetch on failure
    } finally {
      setLoadingId(null);
      setRejectId(null);
      setRejectReason("");
    }
  }, [show, fetchProjects]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Хүлээгдэж буй төслүүд</h1>
          <p className="text-slate-500 mt-1">
            {projects.length} төсөл шалгах хүлээгдэж байна
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-700 text-lg">Бүх төсөл шалгагдсан байна</p>
            <p className="text-slate-400 mt-1 text-sm">Шинэ хүсэлт ирэх үед энд харагдана.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {projects.map(project => (
              <li
                key={project.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
              >
                {/* Summary row */}
                <div className="flex items-start gap-4 p-5">
                  {/* Status badge */}
                  <div className="flex-shrink-0 mt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      Хүлээгдэж байна
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-slate-900 text-base truncate">{project.title}</h2>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                      <span>Бүтээгч: <span className="text-slate-600 font-medium">{project.creator.name}</span></span>
                      <span>Категори: <span className="text-slate-600 font-medium">{project.category}</span></span>
                      <span>Зорилго: <span className="text-slate-600 font-medium">{project.goal.toLocaleString()}₮</span></span>
                      <span>Байршил: <span className="text-slate-600 font-medium">{project.location}</span></span>
                    </div>
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpanded(prev => prev === project.id ? null : project.id)}
                    className="flex-shrink-0 text-slate-400 hover:text-blue-700 transition-colors p-1"
                    aria-label="Дэлгэрэнгүй харах"
                  >
                    <ChevronRight
                      className={cn("w-5 h-5 transition-transform", expanded === project.id && "rotate-90")}
                    />
                  </button>
                </div>

                {/* Expanded detail */}
                {expanded === project.id && (
                  <div className="px-5 pb-4 border-t border-slate-50 pt-3 space-y-3 text-sm text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-700">Холбоо барих:</span>{" "}
                      {project.creator.email ?? project.creator.phone ?? "—"}
                    </div>
                    {project.rewards.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-700">Урамшуулал ({project.rewards.length}):</span>{" "}
                        {project.rewards.map(r => `${r.title} — ${r.amount.toLocaleString()}₮`).join(" · ")}
                      </div>
                    )}
                    <a
                      href={`/projects/review/${project.id}`}
                      className="inline-flex items-center gap-1.5 text-blue-700 font-semibold hover:underline"
                    >
                      <Eye className="w-4 h-4" /> Дэлгэрэнгүй харах
                    </a>
                  </div>
                )}

                {/* Action row */}
                <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-t border-slate-100">
                  {/* Reject — shows reason input inline */}
                  {rejectId === project.id ? (
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Татгалзах шалтгаан (заавал биш)"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-300"
                        onKeyDown={e => {
                          if (e.key === "Enter") decide(project.id, "reject", rejectReason || undefined);
                          if (e.key === "Escape") { setRejectId(null); setRejectReason(""); }
                        }}
                      />
                      <button
                        onClick={() => decide(project.id, "reject", rejectReason || undefined)}
                        disabled={!!loadingId}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {loadingId === project.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Татгалзах
                      </button>
                      <button
                        onClick={() => { setRejectId(null); setRejectReason(""); }}
                        className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        Цуцлах
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => decide(project.id, "approve")}
                        disabled={!!loadingId}
                        className={cn(
                          "flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50",
                          loadingId === project.id && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {loadingId === project.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <CheckCircle className="w-4 h-4" />
                        }
                        Батлах
                      </button>
                      <button
                        onClick={() => setRejectId(project.id)}
                        disabled={!!loadingId}
                        className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Татгалзах
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
