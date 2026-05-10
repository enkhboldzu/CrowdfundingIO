import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "green" | "yellow" | "red" | "gray" | "verified";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue:     "bg-blue-100 text-blue-800 border border-blue-200",
  green:    "bg-green-100 text-green-800 border border-green-200",
  yellow:   "bg-amber-100 text-amber-800 border border-amber-200",
  red:      "bg-red-100 text-red-700 border border-red-200",
  gray:     "bg-slate-100 text-slate-600 border border-slate-200",
  verified: "bg-blue-800 text-white border border-blue-900",
};

export function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
