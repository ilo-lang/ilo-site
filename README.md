# ilo-lang.ai

Documentation website for [ilo](https://github.com/ilo-lang/ilo) — a token-minimal programming language for AI agents.

**Live site:** [ilo-lang.ai](https://ilo-lang.ai)

## Stack

- [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) + Tailwind CSS v4
- Deployed via Dokploy on Hetzner VPS

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
```

## Build

```bash
npm run build      # output in ./dist/
npm run preview    # preview the build locally
```

## Deployment

Pushes to `main` trigger auto-deploy via Dokploy.
