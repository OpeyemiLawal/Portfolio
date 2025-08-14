import type { Metadata } from "next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Nav } from "@/components/nav"
import { Hero } from "@/components/hero"
import { FeaturedProjects } from "@/components/featured-projects"
import { AIWorkflow } from "@/components/ai-workflow"
import { AIPlayground } from "@/components/ai-playground"
import { Testimonials } from "@/components/testimonials"
import { Contact } from "@/components/contact"
import { SiteSettingsProvider } from "@/components/site-settings-context"
import { NeonCursor } from "@/components/neon-cursor"
import { ParticlesBg } from "@/components/particles-bg"
import { Footer } from "@/components/footer"
import { SkillsZone } from "@/components/skills-zone"
import { DeveloperJourney } from "@/components/developer-journey"

export const metadata: Metadata = {
  title: "Opeyemi Lawal — Game Developer • Creative Coder • Software Engineer",
  description:
    "I build polished games, tools, and software—using modern AI tools to accelerate prototyping, generate assets, and automate repetitive work.",
  openGraph: {
    title: "Opeyemi Lawal — Portfolio",
    description:
      "Polished games, tools, and software with AI-accelerated workflows. Beautiful UX, robust engineering, playful interactions.",
    url: "https://example.com",
    images: [
      {
        url: "/neon-portfolio-cover.png",
        width: 1200,
        height: 630,
        alt: "Opeyemi Lawal Portfolio",
      },
    ],
  },
  robots: { index: true, follow: true },
}

export default function Page() {
  return (
    <ThemeProvider>
      <SiteSettingsProvider>
        <main className="relative bg-[#0a0a0c] text-white">
          <Suspense fallback={null}>
            <ParticlesBg />
          </Suspense>
          <NeonCursor />
          <Nav />
          <section className="relative overflow-hidden">
            <Hero />
          </section>
          <section id="projects" className="relative py-24 md:py-32">
            <div className="container mx-auto px-4">
              <FeaturedProjects />
            </div>
          </section>
          <section id="skills-zone" className="relative py-24 md:py-32">
            <div className="container mx-auto px-4">
              <SkillsZone />
            </div>
          </section>
          <section id="developer-journey" className="relative py-24 md:py-32">
            <div className="container mx-auto px-4">
              <DeveloperJourney />
            </div>
          </section>
          <section id="workflow" className="relative py-24 md:py-32">
            <div className="container mx-auto px-4">
              <AIWorkflow />
            </div>
          </section>
          <section id="playground" className="relative py-24 md:py-32">
            <div className="container mx-auto px-4">
              <AIPlayground />
            </div>
          </section>
          <section id="testimonials" className="relative py-24 md:py-32">
            <div className="container mx-auto px-4">
              <Testimonials />
            </div>
          </section>
          <section id="contact" className="relative py-24 md:py-32">
            <div className="container mx-auto px-4">
              <Contact />
            </div>
          </section>
          <Footer />
        </main>
      </SiteSettingsProvider>
    </ThemeProvider>
  )
}
