---
title: Ways to be token efficient
description: Token-efficiency techniques across the agent stack, by category, with projects and links.
---

Cost = generation + retries + context loading. Every layer of the agent stack has a lever, and they compound. A language is one of them.

## Index the codebase

Precompute structure so the agent pulls symbols, not whole files. Saves input tokens.

- [jCodeMunch](https://github.com/jgravelle/jcodemunch-mcp) - tree-sitter symbol index over MCP; fetch one function instead of its file
- [GrapeRoot](https://graperoot.dev/) - semantic code graph, pre-loads the relevant slice per prompt; claims 30-45% cheaper sessions
- [Indexing strategies roundup](https://danieljohnmorris.com/writing/codebase-indexing-strategies-may-2026) - five approaches compared: grep, embeddings, symbol index, graph, RLMs

## Compress what reaches the model

Shrink tool outputs to summaries with a retrieval handle for the full text. Saves input tokens.

- [Headroom](https://extraheadroom.com) - compresses tool results and file dumps inbound; originals retrievable by hash

## Cache the prefix

Re-sending stable context bills at ~0.1x after a one-time write premium (1.25x at 5-minute TTL, 2x at 1-hour). Rewards fixed skill files over dynamic context. Saves input cost, not tokens.

- [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) - prefix-match caching; any byte change earlier in the prompt invalidates everything after it

## Change how the model behaves

Loaded instructions that make the model produce less prose and less code. Saves output tokens.

- [Ponytail](https://extraheadroom.com/ponytail-claude-code) - least-code decision ladder (no code? one line? config change?); lite/full/ultra intensity levels
- Terse-output styles - compressed prose instructions that cut narration without touching technical content

## Code instead of tool calls

One generated program replaces a chain of round trips, each of which carries full context. Saves both directions.

- [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling) - Claude calls tools from inside code execution; intermediate results skip the context window
- [Cloudflare Code Mode](https://blog.cloudflare.com/code-mode/) - agents write code against MCP tools instead of chaining calls

## Design the language

Change what generated code costs in the first place. The moves in use across the [agent-language field](/docs/ecosystem/languages-for-agents/):

- **Dense syntax** - short fixed aliases, minimal punctuation: [ilo](https://github.com/ilo-lang/ilo) (`mapr`, `fld`, `rdjl`), [Mog](https://github.com/voltropy/mog) flat operators
- **Small loadable spec** - bound the artifact an agent reads before writing (measured below)
- **Structured diagnostics** - stable error codes + fix hints kill retry loops: [Zero](https://github.com/vercel-labs/zerolang) repair plans, ilo `ILO-P/T/R` codes, [Codong](https://github.com/brettinhere/Codong) fix/retry JSON
- **One canonical form** - one way to write each operation, no plausible-but-wrong variants: Codong, [Lume](https://github.com/mavboas/lume)
- **Budgeted doc retrieval** - Lume's `lume kb pack "<q>" --max-tokens N` packs docs under a cap
- **Constrained decoding** - grammar masks the token distribution so invalid syntax cannot be sampled: [Axis](https://github.com/vmelnic/axis) LL(1) masks, MoonBit (ICSE 2024)

## Measured: spec size per language

The smallest artifact each language positions as agent context for *writing* it. Measured 2026-08-01 from clones at HEAD; tokens = bytes / 4. Full reference specs excluded for every project, including ilo's ~44k-token [SPEC.md](https://github.com/ilo-lang/ilo/blob/main/SPEC.md).

| Language | Artifact | ~Tokens |
|---|---|---:|
| [Zero](https://github.com/vercel-labs/zerolang) | `skills/zero/SKILL.md` | 969 |
| [Mog](https://github.com/voltropy/mog) | `docs/context.md` | 2,671 |
| **[ilo](https://github.com/ilo-lang/ilo)** | `skills/ilo/SKILL.md` | **3,440** |
| [Thermite](https://github.com/dollspace-gay/Thermite) | `THERMITE.skill.md` | 5,084 |
| [Codong](https://github.com/brettinhere/Codong) | `SPEC_FOR_AI.md` | 11,881 |
| [Magpie](https://github.com/magpie-lang/magpie) | `SKILL.md` | 13,273 |
| [Vera](https://github.com/aallan/vera) | `SKILL.md` | 30,089 |
| [AILANG](https://github.com/sunholo-data/ailang) | `llms.txt` | 31,369 |

Vendor percentage claims reported as claimed, not independently verified. Full field: [agentlanguages.dev](https://agentlanguages.dev).
