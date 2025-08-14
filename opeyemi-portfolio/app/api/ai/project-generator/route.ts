import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  timeline: z.string(),
  phases: z.array(z.string()),
  techRecommendations: z.array(z.string()),
})

export async function POST(req: NextRequest) {
  try {
    const { industry, techStack, goals } = await req.json()

    if (!industry || !techStack) {
      return NextResponse.json({ error: "Industry and tech stack are required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const { object } = await generateObject({
      model: openai("gpt-4o-mini", {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      system: `You are Opeyemi Lawal, a skilled software developer who creates detailed project briefs. 
      Generate a comprehensive project idea based on the user's requirements. 
      Focus on practical, implementable solutions with realistic timelines.`,
      prompt: `Create a detailed project brief for:
      Industry: ${industry}
      Tech Stack: ${techStack}
      Goals: ${goals || "Not specified"}
      
      Include specific features, realistic timeline, development phases, and tech recommendations.`,
      schema: projectSchema,
    })

    return NextResponse.json({ result: object })
  } catch (error: any) {
    console.error("Project Generator error:", error)

    const industry = "General Industry" // Declare industry variable
    const techStack = "General Tech Stack" // Declare techStack variable
    const goals = "General Goals" // Declare goals variable

    if (error?.message?.includes("quota") || error?.message?.includes("billing")) {
      const fallbackProject = {
        title: `${industry} Solution - Demo Project`,
        description: `A comprehensive ${industry.toLowerCase()} application built with ${techStack}, designed to ${goals || "solve key business challenges"}. This demo showcases my systematic approach to project planning and technical architecture.`,
        features: [
          "Modern, responsive user interface",
          "Scalable backend architecture",
          "Real-time data processing",
          "Security and authentication",
          "Performance optimization",
          "Comprehensive testing suite",
        ],
        timeline: "8-12 weeks for MVP, 16-20 weeks for full implementation",
        phases: [
          "Requirements analysis and system design",
          "Core functionality development",
          "UI/UX implementation and testing",
          "Integration and deployment",
          "Performance optimization and launch",
        ],
        techRecommendations: [
          `${techStack} for primary development`,
          "Modern database solutions (PostgreSQL/MongoDB)",
          "Cloud deployment (AWS/Vercel)",
          "CI/CD pipeline setup",
          "Monitoring and analytics integration",
        ],
      }

      return NextResponse.json({ result: fallbackProject })
    }

    return NextResponse.json({ error: "Failed to generate project" }, { status: 500 })
  }
}
