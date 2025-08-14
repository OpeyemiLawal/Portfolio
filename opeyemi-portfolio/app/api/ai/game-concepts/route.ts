import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const gameConceptSchema = z.object({
  title: z.string(),
  concept: z.string(),
  mechanics: z.array(z.string()),
  monetization: z.string(),
  artStyle: z.string(),
  targetAudience: z.string(),
  developmentTime: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const { genre, platform, theme } = await req.json()

    if (!genre || !platform) {
      return NextResponse.json({ error: "Genre and platform are required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const { object } = await generateObject({
      model: openai("gpt-4o-mini", {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      system: `You are Opeyemi Lawal, an experienced game developer who creates innovative game concepts. 
      Generate detailed, marketable game ideas with practical development considerations.`,
      prompt: `Create a complete game concept for:
      Genre: ${genre}
      Platform: ${platform}
      Theme: ${theme || "Modern/Contemporary"}
      
      Include core mechanics, monetization strategy, art direction, target audience, and realistic development timeline.`,
      schema: gameConceptSchema,
    })

    return NextResponse.json({ result: object })
  } catch (error: any) {
    console.error("Game Concept Generator error:", error)

    const genre = "Unknown Genre"
    const platform = "Unknown Platform"
    const theme = "Unknown Theme"

    if (error?.message?.includes("quota") || error?.message?.includes("billing")) {
      const fallbackGame = {
        title: `${genre} ${platform} Game - Demo Concept`,
        concept: `An innovative ${genre.toLowerCase()} game for ${platform.toLowerCase()} featuring ${theme?.toLowerCase() || "modern"} aesthetics. This concept demonstrates my game design methodology and technical planning approach for engaging player experiences.`,
        mechanics: [
          "Intuitive core gameplay loop",
          "Progressive difficulty scaling",
          "Achievement and progression system",
          "Social features and leaderboards",
          "Customization and personalization",
          "Engaging reward mechanisms",
        ],
        monetization: "Freemium model with cosmetic purchases and optional premium features",
        artStyle: `${theme || "Modern"} visual design with polished UI/UX and consistent branding`,
        targetAudience: `${genre} enthusiasts and ${platform.toLowerCase()} users seeking quality gaming experiences`,
        developmentTime: "12-16 weeks for MVP, 20-24 weeks for full release",
      }

      return NextResponse.json({ result: fallbackGame })
    }

    return NextResponse.json({ error: "Failed to generate game concept" }, { status: 500 })
  }
}
