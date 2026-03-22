import { BrevoClient } from "@getbrevo/brevo"
import { render } from "@react-email/render"
import type { ReactElement } from "react"

// Instantiated once — BREVO_API_KEY never reaches the client bundle because
// this file is only imported by server-side code (API routes, Server Components).
const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
})

const FROM_EMAIL = process.env.EMAIL_FROM ?? "notifications@mintmark.app"
const FROM_NAME = "Mintmark"

interface SendEmailOptions {
  to: string
  subject: string
  react: ReactElement
  /** Optional plain-text fallback. Auto-generated from the React template if omitted. */
  text?: string
}

/**
 * Send a transactional email via Brevo.
 * Never throws — logs errors and returns { success: false } on failure.
 */
export async function sendEmail({
  to,
  subject,
  react,
  text,
}: SendEmailOptions): Promise<{ success: boolean }> {
  try {
    // Render React component → HTML (and plain text if not provided)
    const htmlContent = await render(react)
    const textContent = text ?? (await render(react, { plainText: true }))

    await brevoClient.transactionalEmails.sendTransacEmail({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent,
      textContent,
    })

    return { success: true }
  } catch (error) {
    console.error("[email/send] Failed to send email to", to, error)
    return { success: false }
  }
}
