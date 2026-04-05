import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { createAdminClient } from "@/lib/supabase/admin"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null
        }

        const supabase = createAdminClient()
        const { data: user } = await supabase
          .from("users")
          .select("id, email, name, avatar, password_hash, role")
          .eq("email", credentials.email.toLowerCase().trim())
          .maybeSingle()

        if (!user || !user.password_hash) return null

        const valid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!valid) return null

        // password_hash is intentionally excluded from the returned object
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.avatar ?? undefined,
          role: user.role as "user" | "admin",
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: "user" | "admin" }).role ?? "user"
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id
        session.user.role = token.role ?? "user"
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
})
