"use server"

export async function sendMessage(prevState: any, formData: FormData) {
  // Placeholder server action. Wire this to an email service or a DB later.
  const name = String(formData.get("name") || "")
  const email = String(formData.get("email") || "")
  const subject = String(formData.get("subject") || "")
  const budget = String(formData.get("budget") || "")
  const message = String(formData.get("message") || "")

  if (!name || !email || !message) {
    return { ok: false, error: "Please fill in the required fields." }
  }

  console.log("Contact message:", { name, email, subject, budget, message })
  // Simulate latency
  await new Promise((r) => setTimeout(r, 800))
  return { ok: true }
}
