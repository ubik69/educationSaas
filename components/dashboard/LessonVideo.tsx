"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Icon } from "@/components/ui/Icon";

// A mock lesson video player — no real media, just a convincing UI. Pressing
// play ticks the scrubber/timer in real time; the track is seekable.
const DURATION = 312; // 5:12

function fmt(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function LessonVideo({
  title,
  domain,
}: {
  title: string;
  domain: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0); // elapsed seconds
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((prev) => {
        if (prev + 0.25 >= DURATION) {
          setPlaying(false);
          return DURATION;
        }
        return prev + 0.25;
      });
    }, 250);
    return () => clearInterval(id);
  }, [playing]);

  const pct = (t / DURATION) * 100;

  function seek(e: MouseEvent) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setT(ratio * DURATION);
  }

  return (
    <section className="card overflow-hidden">
      <div className="relative aspect-video min-h-[200px] w-full select-none">
        {/* "thumbnail" backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-2 via-surface to-bg" />
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="brand-glow pointer-events-none absolute -left-10 -top-10 h-48 w-72 opacity-40" />

        {/* title overlay */}
        <div className="absolute left-5 top-5 max-w-[56%]">
          <p className="eyebrow flex items-center gap-1.5">
            <Icon name="play" size={12} /> Video lesson
          </p>
          <h3 className="mt-1.5 text-lg font-semibold leading-snug">{title}</h3>
          <p className="mt-0.5 truncate text-xs text-faint">{domain} · 5:12</p>
        </div>

        {/* center play / pause */}
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause" : "Play"}
          className="group absolute inset-0 grid place-items-center"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-black/40 text-fg backdrop-blur-sm ring-1 ring-white/15 transition-all group-hover:scale-105 group-hover:bg-brand group-hover:text-black">
            <Icon name={playing ? "pause" : "play"} size={26} />
          </span>
        </button>

        {/* controls bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8">
          {/* scrubber */}
          <div
            ref={trackRef}
            onClick={seek}
            className="group/track mb-2.5 h-1.5 w-full cursor-pointer rounded-full bg-white/15"
          >
            <div
              className="relative h-full rounded-full bg-brand"
              style={{ width: `${pct}%` }}
            >
              <span className="absolute -right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-brand opacity-0 shadow ring-2 ring-bg transition-opacity group-hover/track:opacity-100" />
            </div>
          </div>
          {/* buttons */}
          <div className="flex items-center gap-3 text-fg">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
              className="text-fg/90 hover:text-fg"
            >
              <Icon name={playing ? "pause" : "play"} size={18} />
            </button>
            <Icon name="volume" size={18} className="text-fg/70" />
            <span className="font-mono text-xs text-fg/80">
              {fmt(t)} <span className="text-fg/40">/ {fmt(DURATION)}</span>
            </span>
            <div className="ml-auto flex items-center gap-3 text-fg/70">
              <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.65rem]">
                1x
              </span>
              <Icon name="settings" size={17} />
              <Icon name="maximize" size={17} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
