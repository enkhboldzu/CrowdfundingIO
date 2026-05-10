"use client";

import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "PENDING" | "ACTIVE" | "REJECTED" | "FUNDED" | "FAILED" | "CANCELLED";

interface Props {
  status: Status;
  rejectionReason?: string | null;
  publishedAt?: string | null;
}

const CONFIG: Record<Status, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
  title: string;
  body: string;
}> = {
  PENDING: {
    icon: Clock,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
    title: "Шалгагдаж байна",
    body: "Манай баг таны төслийг шалгаж байна. Энэ нь ихэвчлэн 24–48 цаг үргэлжилнэ.",
  },
  ACTIVE: {
    icon: CheckCircle,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-600",
    title: "Нийтлэгдсэн",
    body: "Таны төсөл баталгаажиж амжилттай нийтлэгдлээ. Одоо хандив авч эхэллээ!",
  },
  REJECTED: {
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-600",
    title: "Татгалзагдлаа",
    body: "Таны төсөл шаардлага хангаагүй тул батлагдсангүй.",
  },
  FUNDED: {
    icon: CheckCircle,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-600",
    title: "Санхүүжилт бүрдлээ",
    body: "Баяр хүргэе! Таны төсөл зорилгодоо хүрлээ.",
  },
  FAILED: {
    icon: AlertCircle,
    bg: "bg-slate-50",
    border: "border-slate-200",
    iconColor: "text-slate-500",
    title: "Хугацаа дуусав",
    body: "Зорилгын хэмжээнд хүрч чадаагүй тул санхүүжилт амжилтгүй болов.",
  },
  CANCELLED: {
    icon: AlertCircle,
    bg: "bg-slate-50",
    border: "border-slate-200",
    iconColor: "text-slate-500",
    title: "Цуцлагдсан",
    body: "Энэ төсөл цуцлагдсан байна.",
  },
};

export function ProjectStatusBanner({ status, rejectionReason, publishedAt }: Props) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  return (
    <div className={cn(
      "flex gap-4 rounded-2xl border p-5",
      cfg.bg, cfg.border
    )}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={cn("w-5 h-5", cfg.iconColor)} strokeWidth={2} />
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-900 text-sm">{cfg.title}</p>
        <p className="text-sm text-slate-600 mt-0.5">{cfg.body}</p>

        {status === "PENDING" && (
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-amber-400 rounded-full animate-pulse" />
            </div>
            <span className="text-xs text-amber-600 font-medium whitespace-nowrap">24–48 цаг</span>
          </div>
        )}

        {status === "REJECTED" && rejectionReason && (
          <p className="mt-2 text-sm text-red-700 bg-red-100 rounded-xl px-3 py-2">
            <span className="font-semibold">Шалтгаан:</span> {rejectionReason}
          </p>
        )}

        {status === "ACTIVE" && publishedAt && (
          <p className="text-xs text-emerald-600 mt-1.5">
            {new Date(publishedAt).toLocaleDateString("mn-MN", {
              year: "numeric", month: "long", day: "numeric"
            })}-нд нийтлэгдсэн
          </p>
        )}
      </div>
    </div>
  );
}
