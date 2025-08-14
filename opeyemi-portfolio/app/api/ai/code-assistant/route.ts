import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini", {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      system: `You are Opeyemi Lawal, an expert game developer, software engineer, and creative coder. 
      Respond as if you're explaining your approach to solving the coding problem. 
      Be practical, show your expertise, and structure your response with:
      1. Architecture/Planning approach
      2. Implementation strategy  
      3. Code example or pseudocode
      4. Best practices you'd follow
      Keep responses concise but comprehensive.`,
      prompt: question,
      maxTokens: 500,
    })

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("AI Code Assistant error:", error)

    if (error?.message?.includes("quota") || error?.message?.includes("billing")) {
      const fallbackResponse = `**Demo Mode - API Quota Exceeded**

For the provided question:

**My Approach:**
1. **Architecture Planning**: I'd break this down into modular components, considering scalability and maintainability from the start.

2. **Implementation Strategy**: Using modern frameworks like React/Next.js for frontend, Node.js for backend, with proper error handling and testing.

3. **Code Structure**: Clean, documented code following industry best practices with proper separation of concerns.

4. **Best Practices**: Version control, automated testing, performance optimization, and security considerations.

*This is a demo response. The AI playground showcases my systematic approach to problem-solving and technical architecture.*`

      return NextResponse.json({ response: fallbackResponse })
    }

    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
