"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/icons";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const saved = searchParams.get("saved") === "1";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function magicLinkSignIn() {
    if (!email.trim()) return;
    setLoading(true);
    setSent(false);
    try {
      await signIn("resend", {
        email: email.trim(),
        callbackUrl: "/home",
        redirect: false,
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  async function devSignIn() {
    if (!email.trim()) return;
    setLoading(true);
    await signIn("credentials", {
      email: email.trim(),
      callbackUrl: "/home",
    });
    setLoading(false);
  }

  return (
    <div className="flex flex-1 flex-col bg-hero-gradient">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4 rotate-180" />
          חזרה לדף הבית
        </Link>

        {saved && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary-soft/50 p-4 text-sm">
            התוכנית שלך מוכנה. התחבר/י כדי לשמור אותה בענן.
          </div>
        )}

        <h1 className="text-2xl font-bold">שמרי את התוכנית שלך</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Google, קישור למייל, או המשך כאורח/ת.
        </p>

        <div className="mt-8 space-y-4">
          <Button
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/home" })}
          >
            המשך עם Google
          </Button>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">קישור קסם למייל</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
            <Button
              className="mt-3 w-full"
              variant="secondary"
              disabled={loading || !email.trim()}
              onClick={magicLinkSignIn}
            >
              {loading ? "שולח…" : "שלח קישור למייל"}
            </Button>
            {sent && (
              <p className="mt-2 text-center text-xs text-primary">
                בדוק/י את תיבת המייל (גם ספאם)
              </p>
            )}
          </div>

          {process.env.NODE_ENV === "development" && (
            <Button
              variant="ghost"
              className="w-full"
              disabled={loading || !email.trim()}
              onClick={devSignIn}
            >
              Dev login (ללא מייל)
            </Button>
          )}

          <ButtonLink href="/home" variant="ghost" className="w-full">
            המשך כאורח/ת
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
