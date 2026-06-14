import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";

const TONES: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-primary-soft text-success",
  warning: "bg-[color-mix(in_srgb,var(--warning)_15%,transparent)] text-warning",
  danger: "bg-[color-mix(in_srgb,var(--danger)_15%,transparent)] text-danger",
  neutral: "bg-muted text-muted-foreground",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "primary", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}
