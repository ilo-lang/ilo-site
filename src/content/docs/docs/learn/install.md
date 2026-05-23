---
title: Install
description: Use this when you need to install ilo on a specific platform (Claude Code, npm, macOS, Linux, Windows, source, or other agents).
---

Use this when you need to install ilo on a specific platform. Pick the section that matches who's running it.

## For agents

### Claude Code (recommended)

```bash
/plugin marketplace add ilo-lang/ilo   # add marketplace (once)
/plugin install ilo-lang/ilo           # install plugin + teach agent ilo
```

The agent learns ilo automatically via the bundled Agent Skill.

### Claude Cowork

Browse Plugins → Add marketplace from GitHub → `ilo-lang/ilo` → install.

Binary auto-installs via npm. Note: Cowork uses the WASM build - HTTP and process builtins (`get`, `pst`, `run`, `$`) are not yet supported.

### Agent skills (npx skills)

```bash
npx skills add ilo-lang/ilo
```

Install via the [skills](https://www.npmjs.com/package/skills) npm package (for Claude Code and AI agent workflows). Installs the ilo Agent Skill into any compatible agent environment.

### Other agents (Codex, Opencode, etc.)

Copy `skills/ilo/` into your agent's skills directory. Any tool supporting the [Agent Skills standard](https://agentskills.io) will pick it up.

## For humans

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/ilo-lang/ilo/main/install.sh | sh
```

### Windows (PowerShell)

```powershell
Invoke-WebRequest -Uri https://github.com/ilo-lang/ilo/releases/latest/download/ilo-x86_64-pc-windows-msvc.exe -OutFile ilo.exe
```

### npm / npx

```bash
# Run without installing
npx ilo-lang 'dbl x:n>n;*x 2' 5

# Install globally
npm i -g ilo-lang
```

Requires Node 20+. Uses WASM - interpreter mode only, no HTTP builtins.

### From source

```bash
# From crates.io
cargo install ilo

# From git
cargo install --git https://github.com/ilo-lang/ilo
```

## Verify installation

```bash
ilo 'dbl x:n>n;*x 2' 5
# → 10
```
