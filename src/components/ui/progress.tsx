import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  className?: string;
  tone?: "primary" | "warning" | "danger";
  label?: string;
}

const TONES = {
  primary: "bg-primary",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function Progress({
  value,
  className,
  tone = "primary",
  label,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn("h-full rounded-full transition-all", TONES[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
