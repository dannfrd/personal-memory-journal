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
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F242D]/65 transition-colors hover:text-red-700 disabled:opacity-40"
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{isPending ? "Keluar..." : "Sign Out"}</span>
    </button>
  );
}
