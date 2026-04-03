"use client";

import { logoutAdmin } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await logoutAdmin();
    });
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="flex items-center gap-2 text-foreground/60 transition-colors hover:text-foreground disabled:opacity-40"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Keluar..." : "Sign Out"}
    </button>
  );
}
