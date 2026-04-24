import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { NotesClient } from "@/components/notes/NotesClient"

export const dynamic = "force-dynamic"

export default async function NotesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return <NotesClient />
}
