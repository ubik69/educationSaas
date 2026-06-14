import Link from "next/link";
import { cn } from "./cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="9"
        fill="#0d0e10"
        stroke="var(--color-line-strong)"
      />
      {/* Ascending "mastery" bars forming an upward A-like motion */}
      <rect x="8.5" y="18" width="3.4" height="6" rx="1.7" fill="#3f4046" />
      <rect x="14.3" y="13" width="3.4" height="11" rx="1.7" fill="#6b6d74" />
      <rect
        x="20.1"
        y="8"
        width="3.4"
        height="16"
        rx="1.7"
        fill="var(--color-brand)"
      />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  size = "md",
}: {
  className?: string;
  href?: string;
  size?: "sm" | "md";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 font-semibold tracking-tight text-fg",
        className,
      )}
    >
      <LogoMark className={size === "sm" ? "h-7 w-7" : "h-8 w-8"} />
      <span className={size === "sm" ? "text-base" : "text-lg"}>
        Adept
      </span>
    </Link>
  );
}
