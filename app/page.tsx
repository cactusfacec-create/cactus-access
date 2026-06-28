import { redirect } from "next/navigation";
import { getDashboardPathForUser } from "@/lib/auth/session";

export default async function Home() {
  redirect(await getDashboardPathForUser());
}
