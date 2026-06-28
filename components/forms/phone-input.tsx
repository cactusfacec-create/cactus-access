"use client";

export const PAISES = [
  { code: "593", name: "Ecuador",     flag: "🇪🇨" },
  { code: "51",  name: "Perú",        flag: "🇵🇪" },
  { code: "57",  name: "Colombia",    flag: "🇨🇴" },
  { code: "507", name: "Panamá",      flag: "🇵🇦" },
  { code: "503", name: "El Salvador", flag: "🇸🇻" },
] as const;

export function parsePhone(stored: string | null | undefined): { code: string; digits: string } {
  if (!stored) return { code: "593", digits: "" };
  const clean = stored.replace(/^\+/, "");
  for (const c of PAISES) {
    if (clean.startsWith(c.code)) {
      return { code: c.code, digits: clean.slice(c.code.length) };
    }
  }
  return { code: "593", digits: clean };
}

export function combinePhone(code: string, digits: string): string {
  return digits.trim() ? `${code}${digits.trim()}` : "";
}

interface PhoneInputProps {
  id?: string;
  label: string;
  helperText?: string;
  code: string;
  digits: string;
  onCodeChange: (c: string) => void;
  onDigitsChange: (d: string) => void;
}

export function PhoneInput({
  id = "telefono",
  label,
  helperText,
  code,
  digits,
  onCodeChange,
  onDigitsChange,
}: PhoneInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex overflow-hidden rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
        <select
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="shrink-0 border-r border-input bg-muted px-2.5 py-2 text-sm text-foreground focus:outline-none"
          aria-label="Código de país"
        >
          {PAISES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} +{c.code}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          value={digits}
          onChange={(e) => onDigitsChange(e.target.value.replace(/\D/g, ""))}
          placeholder="987654321"
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
        />
      </div>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
