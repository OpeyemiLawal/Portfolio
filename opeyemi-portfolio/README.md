# Opeyemi Lawal — Portfolio

A premium, interactive portfolio showcasing polished games, tools, and software — with AI-accelerated workflows.

Tech: Next.js (App Router), TypeScript, Tailwind, Framer Motion, React Three Fiber. Host-ready on Vercel.

## Run locally

- Install dependencies and start dev server using the v0 installer or your package manager.
- This project uses the default shadcn/ui setup and Tailwind config already present in v0.

## Structure

- app/page.tsx — One-page layout with sections.
- components/* — UI and interactive elements (3D, cursor, particles, sections).
- data/* — Content files you can edit without touching components.
- app/api/npc/route.ts — Optional AI endpoint (mocked if no API key).

## Replacing media

- Replace placeholder images in data files with your assets.
- Use `/public` or remote images (configure Next image domains if using a full Next.js project).

## AI Playground (optional)

This repo includes an optional AI endpoint with the Vercel AI SDK. If no key is provided, it responds with a local mock.

- Provider: OpenAI via `@ai-sdk/openai` (you can switch providers easily).
- Code path: `app/api/npc/route.ts`
- Env: `OPENAI_API_KEY`
- Usage in code: `generateText({ model: openai("gpt-4o"), ... })` [^2]

Note: Keep the portfolio positioning clear — AI is used as a productivity/creative acceleration tool, not for training models.

## Contact form

- Server Action in `server-actions/send-message.ts` logs messages to the server.
- Wire it to an email service (Resend, etc.) or database later.
- For client usage of env vars, remember to prefix with `NEXT_PUBLIC`. Server-only secrets belong in server actions and route handlers.

## Deploy

- Click Deploy in v0, or push to GitHub and deploy on Vercel.
- Add environment variables in your Vercel project settings if enabling the AI endpoint.

## Accessibility and SEO

- Semantic sections, alt text, keyboard focus.
- Open Graph metadata in `app/page.tsx`.

## License

Personal portfolio. You can adapt for your own use.
