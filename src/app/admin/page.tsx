import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/lib/auth";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/admin/login");
  }

  // Check if user is admin
  if (!isAdmin(session.user)) {
    redirect("/admin/unauthorized");
  }

  return <AdminDashboard user={session.user} />;
}
