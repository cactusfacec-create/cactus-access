import { AuthCard } from "../_components/auth-card";
import { RecuperarForm } from "./_components/recuperar-form";

export default function RecuperarContrasenaPage() {
  return (
    <AuthCard>
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-lg font-semibold text-foreground">Recuperar contraseña</h1>
      </div>
      <RecuperarForm />
    </AuthCard>
  );
}
