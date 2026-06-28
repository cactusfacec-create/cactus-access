import { Lightbulb } from "lucide-react";
import { PageShell } from "@/components/cactus/page-shell";
import { RefreshButton } from "@/components/cactus/refresh-button";
import { listSugerencias } from "@/actions/admin/sugerencias.actions";
import { SugerenciasList } from "./_components/sugerencias-list";

export default async function SugerenciasPage() {
  const sugerencias = await listSugerencias();

  const total = sugerencias.length;
  const nuevas = sugerencias.filter((s) => s.estado === "nueva").length;

  return (
    <PageShell
      title="Sugerencias"
      description={
        total > 0
          ? `${total} sugerencia${total !== 1 ? "s" : ""} recibida${total !== 1 ? "s" : ""}${nuevas > 0 ? ` · ${nuevas} nueva${nuevas !== 1 ? "s" : ""}` : ""}`
          : "Mejoras sugeridas por los clientes de Cactus"
      }
      actions={
        <div className="flex items-center gap-2">
          {nuevas > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-400">
              <Lightbulb className="size-3.5" />
              {nuevas} sin revisar
            </span>
          )}
          <RefreshButton />
        </div>
      }
    >
      <SugerenciasList sugerencias={sugerencias} />
    </PageShell>
  );
}
