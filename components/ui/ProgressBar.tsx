import { cn } from "./cn";
import type { Tone } from "./Badge";

const fills: Record<Exclude<Tone, "neutral" | "info">, string> = {
  brand: "bg-brand",
  danger: "bg-danger",
  warning: "bg-warning",
};

function autoTone(value: number): keyof typeof fills {
  if (value < 50) return "danger";
  if (value < 80) return "warning";
  return "brand";
}

export function ProgressBar({
  value,
  tone,
  className,
  height = "h-2",
}: {
  value: number;
  tone?: keyof typeof fills;
  className?: string;
  height?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const resolved = tone ?? autoTone(clamped);
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-white/[0.06]",
        height,
        className,
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          fills[resolved],
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
