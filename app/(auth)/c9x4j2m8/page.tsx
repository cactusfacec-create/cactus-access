import { AdminLoginForm } from "./_components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold text-foreground">Acceso administrador</h1>
        <p className="text-sm text-muted-foreground">Panel de gestión de Cactus Access</p>
      </div>
      <AdminLoginForm />
    </div>
  );
}
