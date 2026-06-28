import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function SuspendedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      {children}
    </div>
  );
}
