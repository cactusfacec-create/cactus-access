import { redirect } from "next/navigation";
import { getProfile, getSession } from "@/lib/auth/session";
import { SidebarAdmin } from "@/components/layout/sidebar-admin";
import { MobileNavAdmin } from "@/components/layout/mobile-nav-admin";
import { Footer } from "@/components/layout/footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile || profile.rol !== "super_admin") redirect("/dashboard");

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row lg:gap-3 lg:p-3">
      <MobileNavAdmin />
      <SidebarAdmin userEmail={user.email ?? ""} />
      <div className="flex flex-1 flex-col lg:min-h-[calc(100dvh-1.5rem)]">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
