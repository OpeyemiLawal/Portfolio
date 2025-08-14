import { Github, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/30 py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-zinc-400 md:flex-row">
        <p className="text-center md:text-left">© {new Date().getFullYear()} Opeyemi Lawal. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="mailto:opeyemi@example.com" aria-label="Email">
            <Mail className="h-4 w-4" />
          </a>
          <a href="https://github.com/" target="_blank" rel="noreferrer" aria-label="GitHub">
            <Github className="h-4 w-4" />
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
