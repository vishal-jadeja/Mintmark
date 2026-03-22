/**
 * Mintmark FAQ data — single source of truth.
 *
 * Consumed by:
 *   - src/components/landing/LandingPage.tsx  (renders the accordion)
 *   - src/app/page.tsx                         (FAQPage JSON-LD schema for Google rich results)
 *
 * SEO strategy: questions are phrased as people type them into search engines.
 * Each answer is 60–120 words — concise enough for featured snippets, substantive
 * enough to be genuinely useful.
 */

export type FaqItem = { q: string; a: string }

export const FAQS_DATA: FaqItem[] = [
  {
    q: "What is Mintmark?",
    a: "Mintmark is an AI-powered personal brand engine for knowledge workers. It connects to your bookmarks, drafts, and reading history, then transforms your existing intellectual work into polished LinkedIn posts, X threads, and Medium articles — automatically formatted and calibrated to your voice. Think of it as a digital curator that stamps your expertise on the internet, consistently, without the daily grind.",
  },
  {
    q: "How is Mintmark different from ChatGPT or other AI writing tools?",
    a: "General AI tools like ChatGPT start from a blank slate and require you to prompt them from scratch every time. Mintmark is fundamentally different: it learns from your existing content, bookmarks, and notes to build a personal knowledge base. Every output is grounded in your actual ideas and calibrated to your established tone — not a generic AI voice. It's the difference between a ghostwriter who has studied your work for months versus one you just met.",
  },
  {
    q: "Which platforms does Mintmark publish to?",
    a: "Mintmark currently supports direct API publishing to LinkedIn, X (Twitter), and Medium. Ghost and Substack integrations are on the near-term roadmap. Each platform gets content that is natively formatted for it — a LinkedIn post won't read like a tweet, and a Medium article won't read like a thread. Context-aware formatting is automatic.",
  },
  {
    q: "Will the AI-generated content actually sound like me?",
    a: "Yes — that's the core product promise. Mintmark ingests your existing writing, vocabulary preferences, and custom instructions to build a voice model unique to you. You can explicitly define your tone, phrases you use, topics you avoid, and formatting preferences via Custom AI Instructions. The output should pass the \"would I actually post this?\" test. If it doesn't, you refine your instructions and it improves.",
  },
  {
    q: "What types of content can Mintmark create?",
    a: "Mintmark generates LinkedIn posts, X/Twitter threads, Medium-style long-form articles, and short-form content briefs. It handles different lengths intelligently — a single insight from a book you read can become a thread, a thought leadership post, and an article introduction, all in one generation. Visual asset prompts for accompanying images are also on the roadmap.",
  },
  {
    q: "How does Mintmark learn my writing style?",
    a: "During onboarding, you connect your sources — browser bookmarks, note-taking apps, saved articles, or existing posts — and write a short voice profile. From there, Mintmark builds a personal knowledge vault. The longer you use it, the sharper your voice model becomes. You can also fine-tune it any time using the Custom AI Instructions panel to add specific vocabulary, correct tone drift, or restrict certain topics.",
  },
  {
    q: "How do I get early access to Mintmark?",
    a: "Join the waitlist with your email. You'll receive a unique referral link — each person who joins using your link moves you up 50 spots. Beta invites go out every Tuesday at 10 AM EST in rank order, so the sooner you join (and refer), the sooner your invite arrives. The referral system gives you direct control over your position.",
  },
  {
    q: "Can I schedule or auto-publish content directly from Mintmark?",
    a: "Yes. Mintmark integrates directly with platform APIs, so you can publish with a single click or schedule posts from within the dashboard. There's no copy-pasting into a separate scheduler. The goal is to reduce the entire pipeline — from insight to published post — to a single intentional action.",
  },
  {
    q: "Is Mintmark useful if I'm not a professional writer?",
    a: "Especially so. Mintmark is designed for people who have deep expertise but find writing time-consuming or intimidating — developers, founders, researchers, product managers, and engineers. You don't need to be a skilled writer; you need ideas worth sharing. Mintmark handles the translation from thinking to prose. Many early users describe it as finally being able to share what they know without it feeling like a chore.",
  },
  {
    q: "Is my content and data kept private?",
    a: "Your knowledge vault, bookmarks, drafts, and custom AI instructions are private to your account and never used to train shared models. Mintmark does not sell or share your content data with third parties. Full data handling details are in the Privacy Policy.",
  },
]
