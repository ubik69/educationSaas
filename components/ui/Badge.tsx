import type { ReactNode } from "react";
import { cn } from "./cn";

export type Tone = "neutral" | "brand" | "danger" | "warning" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-white/[0.04] text-muted border-line",
  brand:
    "bg-[color-mix(in_oklab,var(--color-brand)_14%,transparent)] text-brand border-[color-mix(in_oklab,var(--color-brand)_30%,transparent)]",
  danger:
    "bg-[color-mix(in_oklab,var(--color-danger)_12%,transparent)] text-danger border-[color-mix(in_oklab,var(--color-danger)_28%,transparent)]",
  warning:
    "bg-[color-mix(in_oklab,var(--color-warning)_12%,transparent)] text-warning border-[color-mix(in_oklab,var(--color-warning)_28%,transparent)]",
  info: "bg-[color-mix(in_oklab,var(--color-info)_12%,transparent)] text-info border-[color-mix(in_oklab,var(--color-info)_28%,transparent)]",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  mono = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  mono?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        mono && "font-mono text-[0.7rem] tracking-wide",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
}
