"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createProducto,
  updateProducto,
  uploadImagenProducto,
} from "@/actions/admin/tienda.actions";
import type { ProductoInput } from "@/actions/admin/tienda.actions";
import type { ProductoTienda } from "@/lib/types/database.types";

interface ProductoFormDialogProps {
  open: boolean;
  onClose: () => void;
  producto?: ProductoTienda | null;
}

function parseSpecs(specs: Record<string, unknown> | null) {
  if (!specs) return {};
  return {
    capacidad_facial: specs.capacidad_facial as number | undefined,
    capacidad_huella: specs.capacidad_huella as number | undefined,
    capacidad_tarjeta: specs.capacidad_tarjeta as number | undefined,
    conectividad: Array.isArray(specs.conectividad)
      ? (specs.conectividad as string[]).join(", ")
      : String(specs.conectividad ?? ""),
    pantalla: String(specs.pantalla ?? ""),
    garantia: String(specs.garantia ?? ""),
    temperatura: Boolean(specs.temperatura),
  };
}

type Fields = {
  nombre: string;
  descripcion: string;
  precio: string;
  activo: boolean;
  orden_display: string;
  capacidad_facial: number | undefined;
  capacidad_huella: number | undefined;
  capacidad_tarjeta: number | undefined;
  conectividad: string;
  pantalla: string;
  garantia: string;
  temperatura: boolean;
};

function emptyFields(): Fields {
  return {
    nombre: "",
    descripcion: "",
    precio: "",
    activo: true,
    orden_display: "0",
    capacidad_facial: undefined,
    capacidad_huella: undefined,
    capacidad_tarjeta: undefined,
    conectividad: "",
    pantalla: "",
    garantia: "1 año",
    temperatura: false,
  };
}

export function ProductoFormDialog({ open, onClose, producto }: ProductoFormDialogProps) {
  const isEdit = producto != null;
  const [fields, setFields] = useState<Fields>(emptyFields());
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (producto) {
        const specs = parseSpecs(producto.specs);
        setFields({ ...emptyFields(), nombre: producto.nombre, descripcion: producto.descripcion ?? "", precio: String(producto.precio), activo: producto.activo, orden_display: String(producto.orden_display), ...specs });
        setImagenUrl(producto.imagen_url ?? null);
        setImagenPreview(producto.imagen_url ?? null);
      } else {
        setFields(emptyFields());
        setImagenUrl(null);
        setImagenPreview(null);
      }
      setError("");
      setUploadError("");
    }
  }, [open, producto]);

  function handleClose() {
    if (loading || uploadingImg) return;
    onClose();
  }

  function set(key: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setFields((prev) => ({ ...prev, [key]: val }));
    };
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    const objectUrl = URL.createObjectURL(file);
    setImagenPreview(objectUrl);
    setUploadError("");
    setUploadingImg(true);

    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadImagenProducto(fd);
    setUploadingImg(false);

    if (!result.ok) {
      setUploadError(result.error ?? "Error al subir la imagen");
      setImagenPreview(imagenUrl); // revert preview to old value
      return;
    }

    setImagenUrl(result.data!.url);
    // Keep objectUrl as preview (already set)
  }

  function removeImage() {
    setImagenUrl(null);
    setImagenPreview(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (uploadingImg) return;
    setError("");

    const input: ProductoInput = {
      nombre: fields.nombre,
      descripcion: fields.descripcion,
      precio: Number(fields.precio),
      capacidad_facial: fields.capacidad_facial ? Number(fields.capacidad_facial) : null,
      capacidad_huella: fields.capacidad_huella ? Number(fields.capacidad_huella) : null,
      capacidad_tarjeta: fields.capacidad_tarjeta ? Number(fields.capacidad_tarjeta) : null,
      conectividad: fields.conectividad ?? "",
      pantalla: fields.pantalla ?? "",
      garantia: fields.garantia ?? "",
      temperatura: fields.temperatura ?? false,
      activo: fields.activo,
      orden_display: Number(fields.orden_display),
      imagen_url: imagenUrl,
    };

    setLoading(true);
    const result = isEdit
      ? await updateProducto(producto!.id, input)
      : await createProducto(input);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Error desconocido");
      return;
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="text-base font-semibold">
            {isEdit ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-0">
          <div className="flex max-h-[72vh] flex-col gap-5 overflow-y-auto px-5 py-5">

            {/* ── Imagen ── */}
            <div className="flex flex-col gap-2">
              <Label>Imagen del producto</Label>
              <div className="flex items-start gap-3">
                {/* Preview box */}
                <div
                  onClick={() => !uploadingImg && fileInputRef.current?.click()}
                  className="group relative flex size-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-primary/50 hover:bg-muted/60"
                >
                  {imagenPreview ? (
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="size-full object-cover"
                    />
                  ) : uploadingImg ? (
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImagePlus className="size-6" />
                      <span className="text-[10px] font-medium">Subir imagen</span>
                    </div>
                  )}

                  {/* Overlay on hover when image exists */}
                  {imagenPreview && !uploadingImg && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Upload className="size-5 text-white" />
                    </div>
                  )}

                  {uploadingImg && imagenPreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Loader2 className="size-5 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImg}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
                  >
                    <Upload className="size-3.5" />
                    {uploadingImg ? "Subiendo…" : "Seleccionar archivo"}
                  </button>

                  {imagenUrl && (
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={uploadingImg}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                      Quitar imagen
                    </button>
                  )}

                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    JPG, PNG o WebP · máx. 5 MB<br />
                    Recomendado: 600×600 px
                  </p>
                </div>
              </div>

              {uploadError && (
                <p role="alert" className="text-xs text-destructive">{uploadError}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* ── Nombre ── */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                value={fields.nombre}
                onChange={set("nombre")}
                placeholder="Ej. ZKTeco F18"
                required
              />
            </div>

            {/* ── Descripción ── */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                value={fields.descripcion}
                onChange={set("descripcion")}
                rows={2}
                placeholder="Descripción breve del producto…"
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* ── Precio y orden ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="precio">
                  Precio USD <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={fields.precio}
                  onChange={set("precio")}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="orden_display">Orden en tienda</Label>
                <Input
                  id="orden_display"
                  type="number"
                  min="0"
                  value={fields.orden_display}
                  onChange={set("orden_display")}
                />
              </div>
            </div>

            {/* ── Especificaciones ── */}
            <div className="flex flex-col gap-3 rounded-xl bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Especificaciones técnicas
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { id: "cap_facial", key: "capacidad_facial" as const, label: "Cap. facial", ph: "500" },
                  { id: "cap_huella", key: "capacidad_huella" as const, label: "Cap. huella", ph: "1500" },
                  { id: "cap_tarjeta", key: "capacidad_tarjeta" as const, label: "Cap. tarjeta", ph: "1000" },
                ].map(({ id, key, label, ph }) => (
                  <div key={id} className="flex flex-col gap-1.5">
                    <Label htmlFor={id} className="text-xs">{label}</Label>
                    <Input id={id} type="number" min="0" value={fields[key] ?? ""} onChange={set(key)} placeholder={ph} className="h-9 text-xs" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="conectividad" className="text-xs">
                    Conectividad <span className="font-normal text-muted-foreground">(coma)</span>
                  </Label>
                  <Input id="conectividad" value={fields.conectividad} onChange={set("conectividad")} placeholder="TCP/IP, Wi-Fi, USB" className="h-9 text-xs" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pantalla" className="text-xs">Pantalla</Label>
                  <Input id="pantalla" value={fields.pantalla} onChange={set("pantalla")} placeholder='2.8" TFT' className="h-9 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="garantia" className="text-xs">Garantía</Label>
                  <Input id="garantia" value={fields.garantia} onChange={set("garantia")} placeholder="1 año" className="h-9 text-xs" />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <input id="temperatura" type="checkbox" checked={fields.temperatura} onChange={set("temperatura")} className="size-4 cursor-pointer rounded border-border accent-primary" />
                  <Label htmlFor="temperatura" className="cursor-pointer text-xs">Detección de temperatura</Label>
                </div>
              </div>
            </div>

            {/* ── Activo ── */}
            <div className="flex items-center gap-2">
              <input id="activo" type="checkbox" checked={fields.activo} onChange={set("activo")} className="size-4 cursor-pointer rounded border-border accent-primary" />
              <Label htmlFor="activo" className="cursor-pointer text-sm">Producto activo (visible en la tienda)</Label>
            </div>

            {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <button type="button" onClick={handleClose} disabled={loading} className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40">
              Cancelar
            </button>
            <Button type="submit" disabled={loading || uploadingImg} className="min-h-[44px] min-w-[120px] rounded-xl">
              {loading ? (
                <><Loader2 className="size-4 animate-spin" />Guardando…</>
              ) : isEdit ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
