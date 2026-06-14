"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/components/ui/cn";
import { signOut } from "@/app/login/actions";

type NavItem = { href: string; label: string; icon: IconName };

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: "grid" },
  { href: "/dashboard/study", label: "Today's session", icon: "sparkles" },
  { href: "/dashboard/curriculum", label: "Curriculum", icon: "compass" },
  { href: "/dashboard/quiz", label: "Practice quiz", icon: "play" },
  { href: "/dashboard/attempts", label: "Attempt history", icon: "history" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function UserChip({ userName }: { userName: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/15 font-mono text-sm font-semibold text-brand">
        {userName.slice(0, 2).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-fg">{userName}</p>
        <p className="truncate text-xs text-faint">Free plan</p>
      </div>
    </div>
  );
}

export function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface/40 lg:flex">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="eyebrow px-3 pb-2">Menu</p>
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand/10 font-medium text-brand"
                  : "text-muted hover:bg-white/5 hover:text-fg",
              )}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4">
        <UserChip userName={userName} />
        <Link
          href="/onboarding?redo=1"
          className="mt-3 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-fg"
        >
          <Icon name="target" size={18} />
          Redo onboarding
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-fg"
          >
            <Icon name="logout" size={18} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  return (
    <div className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-faint">{userName}</span>
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Sign out"
              className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-white/5 hover:text-fg"
            >
              <Icon name="logout" size={18} />
            </button>
          </form>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-brand/10 font-medium text-brand"
                  : "text-muted hover:bg-white/5 hover:text-fg",
              )}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
