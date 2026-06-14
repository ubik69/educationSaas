import { cn } from "./cn";

function colorFor(value: number): string {
  if (value < 50) return "var(--color-danger)";
  if (value < 80) return "var(--color-warning)";
  return "var(--color-brand)";
}

export function ReadinessRing({
  value,
  size = 132,
  stroke = 10,
  label = "Exam ready",
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);
  const color = colorFor(clamped);

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s var(--ease-out-soft)",
            filter: `drop-shadow(0 0 6px color-mix(in oklab, ${color} 45%, transparent))`,
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-mono text-2xl font-semibold tabular-nums text-fg">
            {clamped}%
          </div>
          <div className="eyebrow mt-0.5">{label}</div>
        </div>
      </div>
    </div>
  );
}
