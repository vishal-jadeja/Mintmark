import { redirect } from "next/navigation"
import { auth } from "@/auth"
import AdminDashboard from "@/components/admin/AdminDashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }
  if (session.user.role !== "admin") {
    redirect("/dashboard")
  }

  return <AdminDashboard />
}
