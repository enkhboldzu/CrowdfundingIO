import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;     // 0–100
  goal: number;
  raised: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  goal,
  raised,
  showLabel = true,
  className,
}: ProgressBarProps) {
  const capped = Math.min(value, 100);
  const isOverfunded = value > 100;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="progress-track">
        <div
          className={cn("progress-fill", isOverfunded && "bg-green-500")}
          style={{ width: `${capped}%` }}
          role="progressbar"
          aria-valuenow={capped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-blue-800">
            {value.toFixed(0)}% санхүүжсэн
          </span>
          <span>
            {raised.toLocaleString("mn-MN")} / {goal.toLocaleString("mn-MN")} ₮
          </span>
        </div>
      )}
    </div>
  );
}
