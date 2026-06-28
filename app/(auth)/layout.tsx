import Link from "next/link";
import { redirect } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { CactusIcon } from "@/components/cactus/cactus-icon";
import { getDashboardPathForUser, getSession } from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoporteDialog } from "@/components/layout/soporte-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (user) {
    const dest = await getDashboardPathForUser();
    // Avoid infinite redirect: if profile is missing, stay on auth pages
    if (dest !== "/login") redirect(dest);
  }

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center bg-background p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="absolute bottom-4 right-4">
        <SoporteDialog
          trigger={
            <button
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 rounded-full shadow-sm",
              )}
            >
              <LifeBuoy className="size-4" />
              Soporte
            </button>
          }
        />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-top-4 duration-500 fill-mode-backwards">
          <div className="flex flex-col items-center gap-1">
            <CactusIcon className="size-10" />
            <span className="text-lg font-semibold text-foreground">Cactus</span>
          </div>
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            Control de asistencia inteligente
          </p>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards" style={{ animationDelay: "80ms" }}>
          {children}
        </div>
        <p className="text-center text-xs text-muted-foreground animate-in fade-in duration-500 fill-mode-backwards" style={{ animationDelay: "200ms" }}>
          Al continuar, aceptas nuestros{" "}
          <Link href="/terminos" className="font-medium underline-offset-2 hover:underline">
            Términos de servicio
          </Link>{" "}
          y nuestra{" "}
          <Link href="/privacidad" className="font-medium underline-offset-2 hover:underline">
            Política de privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
