import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg" | "xl";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-blue-800 hover:bg-blue-900 active:bg-blue-950 text-white shadow-cta hover:shadow-lg",
  secondary:
    "bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-800 border border-blue-200",
  outline:
    "border-2 border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white",
  ghost:
    "text-slate-600 hover:text-blue-800 hover:bg-blue-50",
  danger:
    "bg-red-600 hover:bg-red-700 text-white",
};

const sizeStyles: Record<Size, string> = {
  sm:  "text-xs px-3 py-1.5 rounded-lg font-medium",
  md:  "text-sm px-4 py-2 rounded-xl font-semibold",
  lg:  "text-base px-6 py-3 rounded-xl font-semibold",
  xl:  "text-lg px-8 py-4 rounded-2xl font-bold",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className
  );
}
