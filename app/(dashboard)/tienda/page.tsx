import { ShieldCheck, ShoppingBag, Truck, Wrench } from "lucide-react";
import { getProductosTienda } from "@/actions/tienda.actions";
import { getPasarelasCliente } from "@/actions/cliente/pago.actions";
import { ProductosGrid } from "./_components/productos-grid";
import { PagoExitosoToast, PagoCanceladoBanner } from "./_components/checkout-dialog";

interface PageProps {
  searchParams: Promise<{ pago?: string }>;
}

export default async function TiendaPage({ searchParams }: PageProps) {
  const [productos, pasarelas, params] = await Promise.all([
    getProductosTienda(),
    getPasarelasCliente(),
    searchParams,
  ]);

  const pagoOk = params.pago === "ok";
  const pagoCancelado = params.pago === "cancelado";

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 p-4 sm:p-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShoppingBag className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Tienda de equipos
            </h1>
            <p className="text-sm text-muted-foreground">
              Dispositivos biométricos compatibles con Cactus Access · entrega a domicilio
            </p>
          </div>
        </div>
      </div>

      {/* Payment result banners */}
      {pagoOk && <PagoExitosoToast />}
      {pagoCancelado && <PagoCanceladoBanner />}

      {/* Value props */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ValueProp
          icon={<ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />}
          bg="bg-emerald-50 dark:bg-emerald-500/8"
          border="border-emerald-200/60 dark:border-emerald-500/20"
          title="Compatibilidad garantizada"
          description="Todos los equipos son compatibles con Cactus Access y listos para conectar."
        />
        <ValueProp
          icon={<Wrench className="size-4 text-blue-600 dark:text-blue-400" />}
          bg="bg-blue-50 dark:bg-blue-500/8"
          border="border-blue-200/60 dark:border-blue-500/20"
          title="Soporte de instalación"
          description="Te apoyamos en la instalación y configuración del dispositivo cuando lo necesites."
        />
        <ValueProp
          icon={<Truck className="size-4 text-violet-600 dark:text-violet-400" />}
          bg="bg-violet-50 dark:bg-violet-500/8"
          border="border-violet-200/60 dark:border-violet-500/20"
          title="Entrega"
          description="Enviamos a cualquier parte del Ecuador con seguimiento en tiempo real."
        />
      </div>

      {/* Catalog */}
      <ProductosGrid productos={productos} hayPasarela={pasarelas.dlocalgo} />
    </div>
  );
}

function ValueProp({
  icon,
  bg,
  border,
  title,
  description,
}: {
  icon: React.ReactNode;
  bg: string;
  border: string;
  title: string;
  description: string;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${bg} ${border}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
