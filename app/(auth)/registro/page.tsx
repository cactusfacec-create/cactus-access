import { AuthCard } from "../_components/auth-card";
import { AuthTabs } from "../_components/auth-tabs";
import { RegistroForm } from "./_components/registro-form";

export default function RegistroPage() {
  return (
    <AuthCard>
      <AuthTabs active="registrarse" />
      <RegistroForm />
    </AuthCard>
  );
}
