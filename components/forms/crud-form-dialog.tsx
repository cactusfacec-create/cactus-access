"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { LoadingButton } from "@/components/cactus/loading-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ActionResult } from "@/lib/types/domain";

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "switch" | "time" | "date";
  options?: { label: string; value: string }[];
  /** Oculta el campo a menos que esta función devuelva true para los valores actuales del form. */
  showIf?: (values: FieldValues) => boolean;
}

interface CrudFormDialogProps<Values extends Record<string, unknown>> {
  trigger?: ReactElement;
  title: string;
  schema: z.ZodType<Values>;
  fields: FieldConfig[];
  defaultValues?: Partial<Values>;
  onSubmit: (values: Values) => Promise<ActionResult>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function FormFields({
  fields,
  control,
  register,
  errors,
}: {
  fields: FieldConfig[];
  control: ReturnType<typeof useForm<FieldValues>>["control"];
  register: ReturnType<typeof useForm<FieldValues>>["register"];
  errors: ReturnType<typeof useForm<FieldValues>>["formState"]["errors"];
}) {
  const values = useWatch({ control });

  return (
    <>
      {fields.map((field) => {
        if (field.showIf && !field.showIf(values)) return null;

        return (
          <div key={field.name} className="flex flex-col gap-1.5">
            {field.type === "switch" ? (
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: controllerField }) => (
                    <Switch
                      id={field.name}
                      checked={Boolean(controllerField.value)}
                      onCheckedChange={controllerField.onChange}
                    />
                  )}
                />
              </div>
            ) : (
              <>
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "select" ? (
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: controllerField }) => (
                      <Select
                        items={Object.fromEntries(
                          (field.options ?? []).map((o) => [o.value, o.label]),
                        )}
                        value={controllerField.value as string | undefined}
                        onValueChange={controllerField.onChange}
                      >
                        <SelectTrigger id={field.name} className="w-full">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : field.type === "date" ? (
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: f }) => {
                      const dateStr = f.value as string;
                      const selected = dateStr ? new Date(dateStr + "T00:00:00") : undefined;
                      return (
                        <Popover>
                          <PopoverTrigger render={
                            <button
                              id={field.name}
                              type="button"
                              className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm transition-colors hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                              <span className={!selected ? "text-muted-foreground" : ""}>
                                {selected
                                  ? selected.toLocaleDateString("es-EC", { day: "2-digit", month: "long", year: "numeric" })
                                  : "Seleccionar fecha"}
                              </span>
                            </button>
                          } />
                          <PopoverContent align="start" className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selected}
                              onSelect={(date) => { if (date) f.onChange(date.toISOString().slice(0, 10)); }}
                            />
                          </PopoverContent>
                        </Popover>
                      );
                    }}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type === "number" || field.type === "time" ? field.type : "text"}
                    onClick={
                      field.type === "time"
                        ? (event) => event.currentTarget.showPicker?.()
                        : undefined
                    }
                    {...register(field.name)}
                  />
                )}
              </>
            )}
            {errors[field.name] ? (
              <p className="text-xs text-destructive">{String(errors[field.name]?.message)}</p>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export function CrudFormDialog<Values extends Record<string, unknown>>({
  trigger,
  title,
  schema,
  fields,
  defaultValues,
  onSubmit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: CrudFormDialogProps<Values>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen! : internalOpen;

  function setOpen(next: boolean) {
    if (isControlled) {
      controlledOnOpenChange?.(next);
    } else {
      setInternalOpen(next);
    }
  }

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FieldValues>({
    resolver: zodResolver(schema as never) as unknown as Resolver<FieldValues>,
    defaultValues: defaultValues as FieldValues,
  });

  async function onValid(values: FieldValues) {
    setServerError(null);
    const result = await onSubmit(values as Values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setOpen(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next);
        if (!next) setServerError(null);
      }}
    >
      {!isControlled && trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onValid)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
            <FormFields fields={fields} control={control} register={register} errors={errors} />
            {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/50 px-4 py-4">
            <LoadingButton type="submit" loading={isSubmitting}>
              {isSubmitting ? "Guardando…" : "Guardar"}
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
