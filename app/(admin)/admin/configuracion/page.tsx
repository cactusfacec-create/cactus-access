import { KeyRound } from "lucide-react";
import { getConfiguracion } from "@/actions/admin/configuracion.actions";
import { CredencialesView } from "./_components/credenciales-view";

export const metadata = { title: "Credenciales | Cactus Admin" };

export default async function ConfiguracionPage() {
  const configuracion = await getConfiguracion();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary">
          <KeyRound className="size-5 text-muted-foreground" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Credenciales de pasarelas</h1>
          <p className="text-sm text-muted-foreground">
            Configura las claves de Payphone y DeUna para habilitar cobros en línea.
          </p>
        </div>
      </div>

      <CredencialesView configuracion={configuracion} />
    </div>
  );
}
