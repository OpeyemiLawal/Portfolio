import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const isAdmin = cookies().get("admin")?.value === "true"
  return NextResponse.json({ authenticated: isAdmin })
}


