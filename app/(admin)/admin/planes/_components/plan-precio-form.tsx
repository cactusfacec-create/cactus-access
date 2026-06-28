"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/cactus/loading-button";
import { updatePlan } from "@/actions/admin/planes.actions";
import type { Plan } from "@/lib/types/database.types";

const LABEL_MAP: Record<string, string> = { pro: "Plan Pro", max: "Plan Max" };

export function PlanPrecioForm({ plan }: { plan: Plan }) {
  const [fields, setFields] = useState({
    precio_trimestral: String(plan.precio_trimestral),
    precio_semestral: String(plan.precio_semestral),
    precio_anual: String(plan.precio_anual),
    limite_sucursales: String(plan.limite_sucursales),
    limite_empleados: String(plan.limite_empleados),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(field: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
      setSuccess(false);
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    const result = await updatePlan({
      id: plan.id as "pro" | "max",
      precio_trimestral: Number(fields.precio_trimestral),
      precio_semestral: Number(fields.precio_semestral),
      precio_anual: Number(fields.precio_anual),
      limite_sucursales: Number(fields.limite_sucursales),
      limite_empleados: Number(fields.limite_empleados),
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground capitalize">
          {LABEL_MAP[plan.id] ?? plan.id}
        </h2>
        <p className="text-xs text-muted-foreground">
          Los precios se aplican automáticamente al asignar este plan a una empresa.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${plan.id}-trimestral`}>Precio trimestral ($)</Label>
          <Input
            id={`${plan.id}-trimestral`}
            name="precio_trimestral"
            type="number"
            min="0"
            step="0.01"
            value={fields.precio_trimestral}
            onChange={handleChange("precio_trimestral")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${plan.id}-semestral`}>Precio semestral ($)</Label>
          <Input
            id={`${plan.id}-semestral`}
            name="precio_semestral"
            type="number"
            min="0"
            step="0.01"
            value={fields.precio_semestral}
            onChange={handleChange("precio_semestral")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${plan.id}-anual`}>Precio anual ($)</Label>
          <Input
            id={`${plan.id}-anual`}
            name="precio_anual"
            type="number"
            min="0"
            step="0.01"
            value={fields.precio_anual}
            onChange={handleChange("precio_anual")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${plan.id}-sucursales`}>Límite de sucursales</Label>
          <Input
            id={`${plan.id}-sucursales`}
            name="limite_sucursales"
            type="number"
            min="1"
            value={fields.limite_sucursales}
            onChange={handleChange("limite_sucursales")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${plan.id}-empleados`}>Límite de empleados</Label>
          <Input
            id={`${plan.id}-empleados`}
            name="limite_empleados"
            type="number"
            min="1"
            value={fields.limite_empleados}
            onChange={handleChange("limite_empleados")}
          />
        </div>
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {success ? <p role="status" className="text-sm text-success">Guardado correctamente.</p> : null}

      <LoadingButton type="submit" loading={loading} className="self-start">
        {loading ? "Guardando…" : "Guardar cambios"}
      </LoadingButton>
    </form>
  );
}
