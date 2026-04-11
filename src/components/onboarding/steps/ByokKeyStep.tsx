"use client"

export function ByokKeyStep() {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-8">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Add your AI key (optional)
      </h2>
      <p className="font-body text-sm text-muted-foreground max-w-sm">
        Bring your own API key from Anthropic, OpenAI, Gemini, or Groq for
        unlimited AI-powered content generation. You can always add this later.
      </p>
      <p className="font-mono text-xs" style={{ color: "var(--mm-gold-400)" }}>
        BYOK keys — Phase 8.7
      </p>
    </div>
  )
}
