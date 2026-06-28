import { AuthCard } from "../(auth)/_components/auth-card";
import { ActualizarForm } from "./_components/actualizar-form";

export default function ActualizarContrasenaPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
            C
          </span>
          <span className="text-lg font-semibold text-foreground">Cactus Access</span>
        </div>
        <AuthCard>
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-lg font-semibold text-foreground">Nueva contraseña</h1>
            <p className="text-sm text-muted-foreground">
              Elige una contraseña nueva para tu cuenta.
            </p>
          </div>
          <ActualizarForm />
        </AuthCard>
      </div>
    </div>
  );
}
