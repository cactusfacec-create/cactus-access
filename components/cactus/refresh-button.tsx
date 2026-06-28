"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RefreshButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    // router.refresh() no expone una promesa que resuelva al terminar — el
    // timeout es solo para que el ícono gire un instante como retroalimentación.
    setTimeout(() => setRefreshing(false), 600);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleRefresh}
      disabled={refreshing}
      aria-label="Refrescar"
    >
      <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
    </Button>
  );
}
