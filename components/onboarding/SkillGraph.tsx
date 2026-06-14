"use client";

import { useState } from "react";
import { levelColor, projectedLevel } from "@/lib/onboarding";

export type GraphPoint = {
  skillId: string;
  name: string;
  level: number; // 0..10  -> y (your rating)
  order: number; // 1..N   -> x (skill index)
};

// Cartesian layout in viewBox units. X = skill index (1..N), Y = level (0-10),
// origin at bottom-left like a real graph. Tuned to stay near-square so type
// and dots read clearly rather than getting stretched thin.
const COL = 22; // px per skill index on the X axis
const LVL = 26; // px per level unit on the Y axis
const M = { left: 36, right: 22, top: 48, bottom: 36 };

export function SkillGraph({
  points,
  total,
  activeOrder,
  sweep = false,
}: {
  points: GraphPoint[];
  total: number;
  activeOrder?: number; // highlight the dot currently being rated
  sweep?: boolean; // draw the green "in 4 weeks" projection line + label
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const plotW = total * COL;
  const plotH = 10 * LVL;
  const originX = M.left;
  const originY = M.top + plotH; // y for level 0 (bottom axis)
  const W = M.left + plotW + M.right;
  const H = originY + M.bottom;

  const xFor = (index: number) => originX + index * COL;
  const yFor = (level: number) => originY - level * LVL;

  const ordered = [...points].sort((a, b) => a.order - b.order);
  const currentLine = ordered.map((p) => `${xFor(p.order)},${yFor(p.level)}`);
  const projectedLine = ordered.map(
    (p) => `${xFor(p.order)},${yFor(projectedLevel(p.level))}`,
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Your self-rated skill map"
      style={{ display: "block" }}
    >
      {/* ---- graph-paper grid ---- */}
      {/* vertical gridlines (every skill index 1..N) */}
      {Array.from({ length: total }, (_, i) => i + 1).map((idx) => (
        <line
          key={`vx-${idx}`}
          x1={xFor(idx)}
          y1={M.top}
          x2={xFor(idx)}
          y2={originY}
          stroke="var(--color-line)"
          strokeWidth={0.4}
        />
      ))}
      {/* horizontal gridlines (every level 0..10) */}
      {Array.from({ length: 11 }, (_, l) => l).map((lvl) => (
        <line
          key={`hy-${lvl}`}
          x1={originX}
          y1={yFor(lvl)}
          x2={originX + plotW}
          y2={yFor(lvl)}
          stroke="var(--color-line)"
          strokeWidth={lvl % 2 === 0 ? 1 : 0.5}
        />
      ))}

      {/* exam-safe target band (level >= 8) */}
      <rect
        x={originX}
        y={yFor(10)}
        width={plotW}
        height={yFor(8) - yFor(10)}
        fill="color-mix(in oklab, var(--color-brand) 9%, transparent)"
      />
      <text
        x={originX + 4}
        y={yFor(8) - 5}
        textAnchor="start"
        className="fill-[var(--color-brand)] font-mono"
        fontSize="10"
        opacity={0.85}
      >
        exam-safe
      </text>

      {/* ---- axes ---- */}
      <line x1={originX} y1={M.top} x2={originX} y2={originY} stroke="var(--color-line-strong)" strokeWidth="2" />
      <line x1={originX} y1={originY} x2={originX + plotW} y2={originY} stroke="var(--color-line-strong)" strokeWidth="2" />

      {/* Y axis ticks + labels (your level) */}
      {[0, 2, 4, 6, 8, 10].map((lvl) => (
        <text
          key={`yl-${lvl}`}
          x={originX - 8}
          y={yFor(lvl) + 4}
          textAnchor="end"
          className="fill-[var(--color-faint)] font-mono"
          fontSize="11"
        >
          {lvl}
        </text>
      ))}

      {/* X axis ticks + labels (skill index) */}
      {Array.from({ length: total }, (_, i) => i + 1).map((idx) => (
        <text
          key={`xl-${idx}`}
          x={xFor(idx)}
          y={originY + 15}
          textAnchor="middle"
          className="fill-[var(--color-faint)] font-mono"
          fontSize="9.5"
        >
          {idx}
        </text>
      ))}
      <text
        x={originX + plotW / 2}
        y={originY + 30}
        textAnchor="middle"
        className="fill-[var(--color-muted)]"
        fontSize="11"
      >
        skill # →
      </text>
      <text
        x={12}
        y={M.top + plotH / 2}
        textAnchor="middle"
        transform={`rotate(-90 12 ${M.top + plotH / 2})`}
        className="fill-[var(--color-muted)]"
        fontSize="11"
      >
        your level →
      </text>

      {/* ---- the green "in 4 weeks" projection ---- */}
      {sweep && ordered.length > 1 && (
        <>
          <polyline
            points={projectedLine.join(" ")}
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
          {ordered.map((p) => (
            <circle
              key={`proj-${p.skillId}`}
              cx={xFor(p.order)}
              cy={yFor(projectedLevel(p.level))}
              r={3.2}
              fill="var(--color-brand)"
              className="onboarding-annotation"
            />
          ))}
          {/* annotation banner above the green line */}
          <g className="onboarding-annotation">
            <text
              x={originX + plotW / 2}
              y={24}
              textAnchor="middle"
              className="fill-[var(--color-brand)]"
              fontSize="14"
              fontWeight="700"
            >
              ↑ IN LESS THAN 4 WEEKS, YOU WILL BE HERE
            </text>
          </g>
        </>
      )}

      {/* ---- current self-rating line + dots ---- */}
      {ordered.length > 1 && (
        <polyline
          points={currentLine.join(" ")}
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      )}
      {ordered.map((p) => {
        const cx = xFor(p.order);
        const cy = yFor(p.level);
        const color = levelColor(p.level);
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
              <circle cx={cx} cy={cy} r={9} fill="none" stroke={color} strokeWidth="1.5" opacity={0.5}>
                <animate attributeName="r" values="7;11;7" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={cx}
              cy={cy}
              r={isActive || isHovered ? 6 : 4.5}
              fill={color}
              stroke="var(--color-bg)"
              strokeWidth="2"
              style={{ transition: "r 0.15s ease" }}
            />
            <title>{`${p.name} — ${p.level}/10`}</title>

            {isHovered && (
              <g>
                <rect
                  x={Math.min(Math.max(cx - 75, 2), W - 152)}
                  y={cy - 28}
                  width={150}
                  height={20}
                  rx={6}
                  fill="var(--color-surface-3)"
                  stroke="var(--color-line-strong)"
                  strokeWidth="1"
                />
                <text
                  x={Math.min(Math.max(cx, 77), W - 77)}
                  y={cy - 14.5}
                  textAnchor="middle"
                  className="fill-[var(--color-fg)]"
                  fontSize="10.5"
                >
                  {p.name.length > 24 ? p.name.slice(0, 23) + "…" : p.name}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
