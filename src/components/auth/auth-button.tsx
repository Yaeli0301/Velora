"use client";

import { signOut, useSession } from "next-auth/react";
import { Button, ButtonLink } from "@/components/ui/button";

export function AuthButton({ compact }: { compact?: boolean }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <span className="text-xs text-muted-foreground">
        {compact ? "…" : "טוען…"}
      </span>
    );
  }

  if (session?.user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={compact ? "px-2 text-xs" : undefined}
      >
        {compact ? "יציאה" : `יציאה (${session.user.name?.split(" ")[0] ?? "משתמש"})`}
      </Button>
    );
  }

  return (
    <ButtonLink href="/login" variant="secondary" size="sm" className={compact ? "px-2 text-xs" : undefined}>
      {compact ? "התחבר" : "שמור את התוכנית"}
    </ButtonLink>
  );
}
