---
title: Languages for AI agents
description: Programming languages designed for AI agents, by camp, with activity as of August 2026.
---

Programming languages whose intended author is a model, not a person. Three camps, by what they optimise. Taxonomy follows [agentlanguages.dev](https://agentlanguages.dev), the independent catalogue of the field; this is a selection, not the full index.

"Active" means at least one commit on the default branch in the 90 days before 2026-08-02, via the GitHub API. This field moves in bursts, so a quiet month is not the same as abandoned - but a project at 0/0 has not been touched in a quarter.

## Syntactic

Cut the tokens a model spends writing and reading code: dense aliases, minimal punctuation, one canonical form.

| Language | Design move | Active |
|---|---|---|
| **[ilo](https://github.com/ilo-lang/ilo)** | Short fixed builtin aliases; design changes argued against measured token cost; agent-session failures filed as language bugs | active |
| [Mog](https://github.com/voltropy/mog) | Embedded-only, flat operators (no precedence), host-granted capabilities; full spec in ~2.7k tokens | quiet |
| [Codong](https://github.com/brettinhere/Codong) | One canonical form per operation; JSON errors carry fix and retry fields | quiet |
| [X07](https://github.com/x07lang/x07) | No text at all: programs are canonical JSON ASTs, edits are RFC 6902 patches | active |
| [Magpie](https://github.com/magpie-lang/magpie) | SSA as the surface syntax; every value typed at definition; LLVM-backed | quiet |
| [NERD](https://github.com/Nerd-Lang/nerd-lang-core) | Every operator replaced with an English keyword; MCP client primitives | quiet |
| [LLMLang](https://github.com/paulprogrammer/llmlang) | Prefix-arity AST, De Bruijn indices, compile-time linear ownership | active |
| [Lume](https://github.com/mavboas/lume) | Conventional surface plus token-budgeted docs retrieval (`lume kb pack --max-tokens N`) | active |

## Verification

Spend tokens to buy certainty: machine-checked contracts, effect types, solvers between generated code and production.

| Language | Design move | Active |
|---|---|---|
| [Zero](https://github.com/vercel-labs/zerolang) | Agent-first systems language, tiny binaries, JSON diagnostics with repair plans | active |
| [BAML](https://github.com/BoundaryML/baml) | Close the escape hatches: runtime types with no `any` or unchecked casts, typed errors with exhaustive matching, schema-aligned parsing that repairs malformed model output instead of rejecting it. Compiler work began Nov 2025; the older prompt DSL was rebranded BAML v0 in Jul 2026, so the two release tracks share a repo | active |
| [Vera](https://github.com/aallan/vera) | Mandatory contracts verified by Z3; LLM inference as a typed effect | active |
| [Thermite](https://github.com/dollspace-gay/Thermite) | req/ens/fx contracts discharged by Verus, Lean and Z3; five-level assurance ladder | active |
| [AILANG](https://github.com/sunholo-data/ailang) | Row-polymorphic effect types, no loops; effects carve IO/FS/Net/Clock/AI | active |
| [NanoLang](https://github.com/jordanhubbard/nanolang) | Shadow test blocks required per function; core proved with Coq theorems | active |
| [Vow](https://github.com/vow-lang/vow) | Machine-checked vows discharged by ESBMC bounded model checking | active |
| [Aver](https://github.com/jasisz/aver) | Functions carry intent, effects and a verify block exporting to Lean 4 / Dafny | active |
| [Intent](https://github.com/lhaig/intent) | Mandatory pre/postconditions checked by Z3; one source targets Rust, JS, Wasm | active |

## Orchestration

The language coordinates agents rather than replacing their code: workflows, capability grants, deterministic replay.

| Language | Design move | Active |
|---|---|---|
| [Fabro](https://github.com/fabro-sh/fabro) | Workflow harness; `.fabro` files are Graphviz digraphs, a CSS-like sheet routes models | active |
| [Boruna](https://github.com/escapeboy/boruna) | Capability-safe deterministic workflows with hash-chained evidence bundles | active |
| [Plasm](https://github.com/PlasmTools/plasm-core) | Path expressions over typed API graphs with dry-run plans | active |
| [Lumen](https://github.com/alliecatowo/lumen) | Markdown-native sources with algebraic effects and compile-time determinism | quiet |
| [Marsha](https://github.com/alantech/marsha) | English functional files compiled to tested Python by an LLM (2023; the category's ancestor) | quiet |

Corrections welcome at [hello@ilo-lang.ai](mailto:hello@ilo-lang.ai). See also [ways to be token efficient](/docs/ecosystem/token-efficiency/).
