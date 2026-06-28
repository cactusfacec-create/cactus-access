"use client";

import { useFormStatus } from "react-dom";
import { Loader2, LogOut } from "lucide-react";
import { LoadingButton } from "@/components/cactus/loading-button";

export function SignOutButton({ variant = "menu" }: { variant?: "menu" | "outline" }) {
  const { pending } = useFormStatus();

  if (variant === "outline") {
    return (
      <LoadingButton type="submit" loading={pending} variant="outline" className="w-full">
        {pending ? "Cerrando sesión…" : "Cerrar sesión"}
      </LoadingButton>
    );
  }

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      {pending ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}
