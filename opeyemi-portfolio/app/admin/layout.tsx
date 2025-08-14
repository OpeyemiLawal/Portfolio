"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PropsWithChildren, Suspense } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FolderPlus, MessageSquareMore, LogOut } from "lucide-react"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteSettingsProvider } from "@/components/site-settings-context"
import { NeonCursor } from "@/components/neon-cursor"
import { ParticlesBg } from "@/components/particles-bg"

export default function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projects", icon: FolderPlus },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareMore },
  ]

  // Import/Export removed per redesign request

  return (
    <ThemeProvider>
      <SiteSettingsProvider>
        <SidebarProvider>
          <div className="relative flex min-h-svh w-full bg-[#0a0a0c] text-white">
            <Suspense fallback={null}>
              <ParticlesBg />
            </Suspense>
            <NeonCursor />
            <Toaster />
        <Sidebar variant="inset" collapsible="icon" className="border-r border-gray-800/60 bg-gray-950/40 backdrop-blur-sm">
          <SidebarHeader>
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-fuchsia-900/30 text-fuchsia-300 border-fuchsia-800/40 shadow-[0_0_24px_rgba(217,70,239,0.18)]">
                  Admin
                </Badge>
                <span className="text-sm text-gray-400">Dashboard</span>
              </div>
              <SidebarTrigger />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400">Manage</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                   {navItems.map((item) => {
                    const Icon = item.icon
                     const isActive = pathname === item.href
                    return (
                      <SidebarMenuItem key={item.href}>
                        <Link href={item.href}>
                          <SidebarMenuButton
                            isActive={isActive}
                            className={cn(
                              "border border-transparent transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-gray-900/70",
                              isActive && "border-fuchsia-500/30 bg-fuchsia-500/10 shadow-[0_0_24px] shadow-fuchsia-600/20"
                            )}
                          >
                            <Icon className={cn("", isActive ? "text-fuchsia-400" : "text-gray-400 group-hover:text-cyan-300")} />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-2 text-xs text-gray-500">Admin panel</div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-h-svh">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-800/60 bg-gray-950/40 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20">
            <div className="hidden md:block">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{navItems.find((n) => n.href === pathname)?.label || "Dashboard"}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex-1">
              <h1 className="bg-gradient-to-r from-fuchsia-400 via-fuchsia-200 to-cyan-300 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                Portfolio Admin
              </h1>
              <p className="text-xs text-gray-500">Manage projects and client reviews</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Link href="/admin/projects">
                <Button className="bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_24px] shadow-fuchsia-600/30">New Project</Button>
              </Link>
              <Link href="/admin/testimonials">
                <Button variant="outline" className="border-cyan-400/30 bg-white/5 hover:bg-white/10">New Testimonial</Button>
              </Link>
              <Link href="/" className="text-sm text-gray-400 hover:text-white">View site</Link>
              <Button
                variant="outline"
                className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-200"
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' })
                  } catch {}
                  const next = '/admin'
                  window.location.href = `/login?next=${encodeURIComponent(next)}`
                }}
                title="Log out"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </header>
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,70,239,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(34,211,238,0.06),_transparent_55%)]" />
            <div className="relative mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
          </div>
        </SidebarInset>
      </div>
        </SidebarProvider>
      </SiteSettingsProvider>
    </ThemeProvider>
  )
}


