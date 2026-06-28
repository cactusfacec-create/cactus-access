import { AuthCard } from "../_components/auth-card";
import { AuthTabs } from "../_components/auth-tabs";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthTabs active="ingresar" />
      <LoginForm />
    </AuthCard>
  );
}
