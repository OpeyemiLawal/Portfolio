import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Project Lab",
  description:
    "Interactive experiments and production tools. Explore my portfolio of games, software, and creative projects built with modern technologies and AI-accelerated workflows.",
}

export default function ProjectLabLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
