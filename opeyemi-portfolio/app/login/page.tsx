import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteSettingsProvider } from "@/components/site-settings-context"
import { ParticlesBg } from "@/components/particles-bg"
import { NeonCursor } from "@/components/neon-cursor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type SearchParams = {
  error?: string
  next?: string
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  async function login(formData: FormData) {
    'use server'
    const username = String(formData.get("username") || "")
    const password = String(formData.get("password") || "")
    const nextUrl = String(formData.get("next") || "/admin")

    const expectedUser = "imran"
    const expectedPass = "1234abcd"

    if (username === expectedUser && password === expectedPass) {
      const cookieStore = await cookies()
      ;(cookieStore as any).set("admin", "true", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
      redirect(nextUrl || "/admin")
    }

    redirect(`/login?error=1&next=${encodeURIComponent(nextUrl)}`)
  }

  const nextParam = searchParams?.next || "/admin"
  const hasError = Boolean(searchParams?.error)

  return (
    <ThemeProvider>
      <SiteSettingsProvider>
        <main className="relative min-h-svh bg-[#0a0a0c] text-white">
          <ParticlesBg />
          <NeonCursor />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,70,239,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(34,211,238,0.06),_transparent_55%)]" />
          <div className="relative mx-auto flex min-h-svh max-w-7xl items-center justify-center p-4">
            <Card className="w-full max-w-md border-gray-800 bg-gray-900/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-fuchsia-400 via-fuchsia-200 to-cyan-300 bg-clip-text text-2xl font-bold text-transparent">
                  Admin Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasError && (
                  <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                    Invalid credentials. Please try again.
                  </div>
                )}
                <form action={login} className="space-y-4">
                  <input type="hidden" name="next" value={nextParam} />
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" placeholder="Enter username" autoComplete="username" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="Enter password" autoComplete="current-password" required />
                  </div>
                  <Button className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_24px] shadow-fuchsia-600/30" type="submit">
                    Sign in
                  </Button>
                  <p className="text-center text-xs text-gray-400">
                    Tip: Configure credentials via <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD</code> env vars.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </SiteSettingsProvider>
    </ThemeProvider>
  )
}


