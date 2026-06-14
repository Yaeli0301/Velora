"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GaugeIcon, TargetIcon, ChatIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/home", label: "בית", Icon: GaugeIcon, key: "home" },
  { href: "/cfo", label: "ה-CFO", Icon: ChatIcon, key: "cfo" },
  { href: "/plan", label: "תוכנית", Icon: TargetIcon, key: "plan" },
] as const;

function NavLink({
  href,
  label,
  Icon,
  active,
  compact,
}: {
  href: string;
  label: string;
  Icon: typeof GaugeIcon;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full font-medium transition",
        compact
          ? "flex-1 flex-col gap-0.5 py-2 text-[11px]"
          : "px-3 py-2 text-sm sm:px-4",
        active
          ? "text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", compact && "h-5 w-5")} />
      <span className={cn(compact ? "inline" : "hidden sm:inline")}>{label}</span>
    </Link>
  );
}

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/home" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg font-bold text-white">
            V
          </span>
          <span className="text-lg font-bold tracking-tight">Velora</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map(({ href, label, Icon, key }) => (
            <NavLink
              key={key}
              href={href}
              label={label}
              Icon={Icon}
              active={pathname.startsWith(href)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 backdrop-blur lg:hidden"
      aria-label="ניווט ראשי"
    >
      <div className="mx-auto flex max-w-lg items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
        {LINKS.map(({ href, label, Icon, key }) => (
          <NavLink
            key={key}
            href={href}
            label={label}
            Icon={Icon}
            active={pathname.startsWith(href)}
            compact
          />
        ))}
      </div>
    </nav>
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-l border-border/60 bg-card/40 lg:block">
      <nav className="sticky top-16 flex flex-col gap-1 p-4">
        {LINKS.map(({ href, label, Icon, key }) => (
          <Link
            key={key}
            href={href}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
              pathname.startsWith(href)
                ? "bg-primary-soft text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
