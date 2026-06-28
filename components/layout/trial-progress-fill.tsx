"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function TrialProgressFill({
  ratio,
  urgente,
  moderado,
}: {
  ratio: number;
  urgente: boolean;
  moderado: boolean;
}) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        "h-full transition-[width] ease-out",
        urgente ? "bg-red-500" : moderado ? "bg-amber-400" : "bg-lime-500",
      )}
      style={{
        width: filled ? `${Math.max(0, ratio * 100)}%` : "0%",
        transitionDuration: filled ? "800ms" : "0ms",
      }}
    />
  );
}
