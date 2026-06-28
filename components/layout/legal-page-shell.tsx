import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CactusIcon } from "@/components/cactus/cactus-icon";

interface Section {
  id: string;
  label: string;
}

interface LegalPageShellProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: Section[];
  children: ReactNode;
}

export function LegalPageShell({
  title,
  subtitle,
  lastUpdated,
  sections,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
          <Link href="/login" className="flex items-center gap-2">
            <CactusIcon className="size-6" />
            <span className="text-sm font-semibold text-foreground">Cactus</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">

          {/* Índice lateral — visible en desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                En esta página
              </p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="min-w-0">
            {/* Hero de la página */}
            <div className="mb-10 border-b border-border pb-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
              )}
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                Última actualización: {lastUpdated}
              </p>
            </div>

            {/* Índice para móvil */}
            <div className="mb-8 rounded-xl border border-border bg-muted/30 p-4 lg:hidden">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                En esta página
              </p>
              <ul className="flex flex-col gap-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block rounded px-1 py-1 text-sm text-primary hover:underline"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Secciones */}
            <div className="flex flex-col gap-10">{children}</div>

            {/* Footer */}
            <div className="mt-14 border-t border-border pt-8 text-center text-sm text-muted-foreground">
              <p>
                ¿Preguntas?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Contacta a nuestro equipo de soporte
                </Link>{" "}
                desde la aplicación.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

interface LegalSectionProps {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}

export function LegalSection({ id, number, title, children }: LegalSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {number}
        </span>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="ml-10 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
