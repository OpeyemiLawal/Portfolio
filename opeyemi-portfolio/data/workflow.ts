export const workflow = [
  {
    title: "Prompt-Driven Prototyping",
    description:
      "Use GPT-based assistants and Copilot to scaffold components, scripts, and tests. Great for iterating UI and gameplay loops.",
    tools: ["GitHub Copilot", "GPT"],
    note: "Human-in-the-loop always — I adapt, review, and refine.",
  },
  {
    title: "Asset Acceleration",
    description:
      "Generate moodboards, placeholder art, and variations using Stable Diffusion / Midjourney; then refine in Blender and design tools.",
    tools: ["Stable Diffusion", "Midjourney", "DALL·E", "RunwayML"],
    note: "Final assets are curated and polished manually.",
  },
  {
    title: "Audio & Voice",
    description:
      "Draft VO and sound cues quickly with Whisper/ElevenLabs prototypes, then lock in final audio with human review.",
    tools: ["Whisper", "ElevenLabs"],
    note: "Speed up iterations for scripts and voice direction.",
  },
  {
    title: "Automation Scripts",
    description:
      "Write scripts to batch process images, compress builds, and transform data. AI helps with boilerplate and edge cases.",
    tools: ["Node.js", "Python", "Docker"],
    note: "Automate repetitive tasks to focus on creative work.",
  },
  {
    title: "Gameplay & Interactions",
    description: "Prototype mechanics fast with Phaser/Three.js. AI assists with math helpers and shader scaffolds.",
    tools: ["Phaser", "Three.js", "Godot"],
    note: "Tight loops, responsive input, and feel-first polish.",
  },
  {
    title: "Delivery & Hosting",
    description:
      "Ship on modern hosting with preview environments and analytics. Optimize bundles and lazy-load heavy elements.",
    tools: ["Vercel", "Supabase/Postgres"],
    note: "Reliable deployments with performance budgets.",
  },
]
