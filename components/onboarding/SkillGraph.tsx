"use client";

import { useState } from "react";
import { skillColor } from "@/lib/onboarding";

export type GraphPoint = {
  skillId: string;
  name: string;
  level: number; // 0..10  -> x
  order: number; // 1..N   -> y
};

// Layout constants for the SVG coordinate space.
const W = 340;
const ROW_GAP = 24;
const PAD = { top: 26, bottom: 26, left: 34, right: 20 };

export function SkillGraph({
  points,
  total,
  activeOrder,
  sweep = false,
}: {
  points: GraphPoint[];
  total: number;
  activeOrder?: number; // highlight the dot currently being rated
  sweep?: boolean; // trigger the green "improvement" line animation
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const H = PAD.top + (total - 1) * ROW_GAP + PAD.bottom;
  const xFor = (level: number) =>
    PAD.left + (level / 10) * (W - PAD.left - PAD.right);
  const yFor = (order: number) => PAD.top + (order - 1) * ROW_GAP;

  const ordered = [...points].sort((a, b) => a.order - b.order);
  const linePoints = ordered
    .map((p) => `${xFor(p.level)},${yFor(p.order)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full"
      role="img"
      aria-label="Your self-rated skill map"
    >
      {/* vertical gridlines at 0,2,4,6,8,10 */}
      {[0, 2, 4, 6, 8, 10].map((lvl) => (
        <g key={lvl}>
          <line
            x1={xFor(lvl)}
            y1={PAD.top - 12}
            x2={xFor(lvl)}
            y2={H - PAD.bottom + 6}
            stroke="var(--color-line)"
            strokeWidth={lvl === 8 ? 1.25 : 0.75}
            strokeDasharray={lvl === 8 ? "0" : "2 4"}
          />
          <text
            x={xFor(lvl)}
            y={PAD.top - 16}
            textAnchor="middle"
            className="fill-[var(--color-faint)] font-mono"
            fontSize="8"
          >
            {lvl}
          </text>
        </g>
      ))}
      {/* "exam-safe" marker at 8 */}
      <text
        x={xFor(8)}
        y={H - PAD.bottom + 16}
        textAnchor="middle"
        className="fill-[var(--color-brand)] font-mono"
        fontSize="7.5"
      >
        exam-safe
      </text>

      {/* connecting line between consecutive dots (subtle) */}
      {ordered.length > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      )}

      {/* the green "we can get you better" sweep line */}
      {sweep && ordered.length > 1 && (
        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={100}
          className="onboarding-sweep"
          style={{
            filter:
              "drop-shadow(0 0 5px color-mix(in oklab, var(--color-brand) 60%, transparent))",
          }}
        />
      )}

      {/* dots */}
      {ordered.map((p) => {
        const cx = xFor(p.level);
        const cy = yFor(p.order);
        const color = skillColor(p.order - 1, total);
        const isActive = p.order === activeOrder;
        const isHovered = hovered === p.order;
        return (
          <g
            key={p.skillId}
            onMouseEnter={() => setHovered(p.order)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "pointer" }}
          >
            {isActive && (
              <circle
                cx={cx}
                cy={cy}
                r={9}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                opacity={0.5}
              >
                <animate
                  attributeName="r"
                  values="7;11;7"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle
              cx={cx}
              cy={cy}
              r={isActive || isHovered ? 5.5 : 4}
              fill={color}
              stroke="var(--color-bg)"
              strokeWidth="1.5"
              style={{ transition: "r 0.15s ease" }}
            />
            <title>{`${p.name} — ${p.level}/10`}</title>

            {/* styled hover label */}
            {isHovered && (
              <g>
                <rect
                  x={Math.min(Math.max(cx - 60, 2), W - 122)}
                  y={cy - 24}
                  width={120}
                  height={17}
                  rx={5}
                  fill="var(--color-surface-3)"
                  stroke="var(--color-line-strong)"
                  strokeWidth="0.75"
                />
                <text
                  x={Math.min(Math.max(cx, 62), W - 60)}
                  y={cy - 12}
                  textAnchor="middle"
                  className="fill-[var(--color-fg)]"
                  fontSize="8.5"
                >
                  {p.name.length > 22 ? p.name.slice(0, 21) + "…" : p.name}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
