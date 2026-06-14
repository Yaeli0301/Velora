import Link from "next/link";
import { GaugeIcon, TargetIcon, ChatIcon, WalletIcon } from "@/components/icons";
import { AuthButton } from "@/components/auth/auth-button";

const LINKS = [
  { href: "/dashboard", label: "סקירה", Icon: GaugeIcon },
  { href: "/goals", label: "יעדים", Icon: TargetIcon },
  { href: "/budget", label: "תקציב", Icon: WalletIcon },
  { href: "/advisor", label: "יועץ", Icon: ChatIcon },
];

export function AppNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-lg font-bold text-white">
            V
          </span>
          <span className="text-lg font-bold tracking-tight">Velora</span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:px-4"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <AuthButton compact />
        </nav>
      </div>
    </header>
  );
}
