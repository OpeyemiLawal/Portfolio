import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
// You can switch providers easily; keep using the AI SDK interface. [^2]

// IMPORTANT: no edge runtime when using AI SDK per project guidance.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const messages = (body?.messages ?? []) as { role: string; content: string }[]

  // If no API key, return a local deterministic reply.
  if (!process.env.OPENAI_API_KEY) {
    const last = messages[messages.length - 1]?.content ?? ""
    const reply =
      "Mock Nova: I’m a local guide. For real AI replies, add an API key. Meanwhile—Opeyemi ships polished games, tools, and software. Check the Featured Projects and Case Studies!"
    return NextResponse.json({ reply })
  }

  // Minimal example using Vercel AI SDK with OpenAI. [^2]
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n")
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system:
      "You are Nova, a friendly NPC guide for Opeyemi's portfolio. Be concise and helpful. Emphasize AI as a productivity tool, not model training.",
    prompt: userText || "Say hi.",
  })

  return NextResponse.json({ reply: text })
}
