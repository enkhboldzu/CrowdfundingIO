"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trash2, Pencil, Loader2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/types";

interface Props {
  project: Project;
  featured?: boolean;
  className?: string;
  onMutated?: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:   "bg-amber-500",
  ACTIVE:    "bg-emerald-500",
  REJECTED:  "bg-red-500",
  FUNDED:    "bg-blue-500",
  FAILED:    "bg-slate-500",
  CANCELLED: "bg-slate-400",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:   "Хүлээгдэж байна",
  ACTIVE:    "Нийтлэгдсэн",
  REJECTED:  "Татгалзагдсан",
  FUNDED:    "Санхүүжсэн",
  FAILED:    "Амжилтгүй",
  CANCELLED: "Цуцлагдсан",
};

export function AdminProjectCard({ project, featured, className, onMutated }: Props) {
  const [loading, setLoading]   = useState<string | null>(null);
  const [deleted, setDeleted]   = useState(false);
  const [status, setStatus]     = useState(project.status ?? "ACTIVE");
  const { show }                = useToast();

  if (deleted) return null;

  async function approve() {
    setLoading("approve");
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) throw new Error();
      setStatus("ACTIVE");
      show("Төсөл батлагдлаа ✓", "info");
      onMutated?.();
    } catch {
      show("Алдаа гарлаа", "error");
    } finally {
      setLoading(null);
    }
  }

  async function reject() {
    setLoading("reject");
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (!res.ok) throw new Error();
      setStatus("REJECTED");
      show("Төсөл татгалзагдлаа", "warning");
      onMutated?.();
    } catch {
      show("Алдаа гарлаа", "error");
    } finally {
      setLoading(null);
    }
  }

  async function softDelete() {
    if (!confirm(`"${project.title}"-г устгах уу?`)) return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleted(true);
      show("Төсөл устгагдлаа", "warning");
      onMutated?.();
    } catch {
      show("Устгахад алдаа гарлаа", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={cn("relative group/admin", className)}>
      {/* ── Admin overlay — visible on hover ─────────────────────── */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 z-[10] pointer-events-none",
          "opacity-0 group-hover/admin:opacity-100 transition-opacity duration-200"
        )}
      >
        {/* Status bar */}
        <div className={cn(
          "flex items-center justify-between px-3 py-1.5 rounded-t-2xl",
          STATUS_STYLE[status] ?? "bg-slate-500"
        )}>
          <span className="text-white text-[11px] font-bold tracking-wide">
            {STATUS_LABEL[status] ?? status}
          </span>
          <a
            href={`/projects/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/70 hover:text-white transition-colors pointer-events-auto"
            onClick={e => e.stopPropagation()}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
          </a>
        </div>

        {/* Action buttons */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-2",
            "bg-slate-900/90 backdrop-blur-sm pointer-events-auto"
          )}
          onClick={e => e.stopPropagation()}
        >
          {/* Approve — only for PENDING */}
          {status === "PENDING" && (
            <button
              onClick={approve}
              disabled={!!loading}
              className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading === "approve"
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <CheckCircle className="w-3 h-3" />}
              Батлах
            </button>
          )}

          {/* Reject — only for PENDING */}
          {status === "PENDING" && (
            <button
              onClick={reject}
              disabled={!!loading}
              className="flex items-center gap-1 text-[11px] font-bold bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading === "reject"
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <XCircle className="w-3 h-3" />}
              Татгалзах
            </button>
          )}

          {/* Edit — always */}
          <a
            href={`/admin/dashboard?tab=all&edit=${project.id}`}
            className="flex items-center gap-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Засах
          </a>

          {/* Delete — always */}
          <button
            onClick={softDelete}
            disabled={!!loading}
            className="flex items-center gap-1 text-[11px] font-bold bg-slate-700 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 ml-auto"
          >
            {loading === "delete"
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <Trash2 className="w-3 h-3" />}
            Устгах
          </button>
        </div>
      </div>

      {/* Underlying project card */}
      <ProjectCard project={project} featured={featured} />
    </div>
  );
}
