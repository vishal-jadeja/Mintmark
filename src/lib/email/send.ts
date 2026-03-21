import { Resend } from "resend"
import type { ReactElement } from "react"

// Instantiated once at module level — RESEND_API_KEY never reaches the client bundle
// because this file is only imported by server-side code (API routes, Server Components).
const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  react: ReactElement
  text: string
}

/**
 * Send a transactional email via Resend.
 * Never throws — logs errors and returns { success: false } on failure.
 */
export async function sendEmail({
  to,
  subject,
  react,
  text,
}: SendEmailOptions): Promise<{ success: boolean }> {
  try {
    await resend.emails.send({
      from: "Mintmark <notifications@mintmark.app>",
      to,
      subject,
      react,
      text,
    })
    return { success: true }
  } catch (error) {
    console.error("[email/send] Failed to send email to", to, error)
    return { success: false }
  }
}
