---
title: Ways to be token efficient
description: Token-efficiency techniques across the agent stack, by category, with projects and links.
---

Cost = generation + retries + context loading. Every layer of the agent stack has a lever, and they compound. A language is one of them.

## Find code without reading all of it

An agent with no index explores by reading, and reading is what costs - a single exploratory task on a large repo can burn 200k tokens before any real work starts. Five strategies, most tools combining several.

**Search the repo directly.** No index; the agent runs `grep` and `rg` and reasons over the results. Nothing to precompute or go stale, and it [reaches over 90% of RAG-level accuracy](https://www.mindstudio.ai/blog/is-rag-dead-what-ai-agents-use-instead) on code retrieval benchmarks.

- [Claude Code](https://www.claude.com/product/claude-code), [Codex CLI](https://github.com/openai/codex) and [Cline](https://github.com/cline/cline) ship with no index. Semantic search is an open request on Codex ([#5181](https://github.com/openai/codex/issues/5181), [#609](https://github.com/openai/codex/issues/609)), and third-party indexers exist for all three

**Embed and retrieve.** Chunk, embed, retrieve by similarity. Catches intent that keyword search misses; the index needs rebuilding as code changes.

- [Cursor](https://cursor.com) - chunks with [Tree-sitter](https://tree-sitter.github.io/tree-sitter/), tracks changes with a [Merkle tree](https://en.wikipedia.org/wiki/Merkle_tree), stores in [Turbopuffer](https://turbopuffer.com)
- [Kilo Code](https://kilo.ai/docs/features/codebase-indexing) and [Continue](https://docs.continue.dev/customize/deep-dives/codebase) - the same pattern, self-hostable

**Index the symbols.** Parse the AST so the agent fetches one function, not the file around it.

- [jCodeMunch](https://github.com/jgravelle/jcodemunch-mcp) - Tree-sitter symbol index served over [MCP](https://modelcontextprotocol.io)
- [Aider](https://aider.chat/docs/repomap.html) - builds a repo map ranked by importance
- [Serena](https://github.com/oraios/serena) - drives a [language server](https://microsoft.github.io/language-server-protocol/) so lookups match what an IDE knows
- [SymDex](https://github.com/husnainpk/SymDex)

**Build a code graph.** Files, symbols, imports and call chains as a traversable graph. Answers what the others cannot: what calls this, what breaks if it changes.

- [GrapeRoot](https://graperoot.dev/) - pre-loads the relevant slice into each prompt; claims 30-45% cheaper sessions
- [Prowl](https://github.com/neur0map/prowl) and [CodeGraphContext](https://github.com/CodeGraphContext/CodeGraphContext)

**Let the model write code to search.** The model writes a program that greps and filters; only the result returns to context. Recursive language models push this furthest.

- [rlm](https://github.com/alexzhang13/rlm) - the reference implementation; [DSPy ships it as a module](https://dspy.ai/api/modules/RLM/)

Full comparison, including which to reach for when: [how AI agents find code in your repo](https://danieljohnmorris.com/writing/codebase-indexing-strategies-may-2026).

## Compress what reaches the model

A proxy rewrites bulky tool output into a summary before it lands in context, keeping the full text retrievable if it turns out to matter.

- [Headroom](https://extraheadroom.com) - compresses tool results and file dumps on the way in, storing the original against a hash the agent can retrieve later. It is also how [Ponytail](#write-less-back) is distributed, so the two cover both directions

## Cache the repeated part of the prompt

Every request an agent sends starts with the same block of text: the system prompt, the tool definitions, the language spec. That repeated opening is the *prefix*, and caching lets you stop paying full price to send it again.

The first request that writes the cache costs more than normal - 1.25x the usual input price for a 5-minute cache, 2x for a one-hour cache. Every later request that opens with the exact same text pays about 0.1x instead. Two requests is enough to come out ahead on the short cache, three on the long one.

The catch is in the word *prefix*: the match runs from the very first character forward, and stops at the first byte that differs. A timestamp near the top of a system prompt means nothing after it can be cached, however stable the rest is. This is why a fixed skill file that is byte-identical on every task caches well, while a context pack assembled per task does not - same token count, very different bill.

This one saves money rather than tokens. The context window is just as full either way.

Every major provider offers it, with different mechanics. The split that matters is whether you place the cache breakpoints yourself or the provider infers them, and whether you are billed per cached token or for storage over time.

- [Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) - explicit `cache_control` breakpoints, up to four per request; reads bill at roughly 0.1x
- [OpenAI](https://platform.openai.com/docs/guides/prompt-caching) - was automatic with no configuration and no write cost; since GPT-5.6 went GA in July 2026 it uses explicit breakpoints and bills writes, which puts it close to Anthropic's model
- [Google Gemini](https://ai.google.dev/gemini-api/docs/caching) - offers both implicit and explicit context caching, and bills cached content for storage duration rather than per token, so the economics turn on how long you hold the cache rather than how often you read it
- [DeepSeek](https://api-docs.deepseek.com/guides/kv_cache) - automatic, disk-backed, and the steepest relative discount of the four

Rates move often and vary by model. Treat any number you read as needing a check against the provider's own pricing page before you budget against it.

## Write less back

Output tokens are the half you control by asking. An instruction in context cuts what the model writes, with no toolchain change.

- [caveman](https://github.com/JuliusBrussee/caveman) - strips articles, filler and pleasantries from responses while keeping the technical content intact; roughly 75% fewer tokens on prose-heavy turns
- [Ponytail](https://extraheadroom.com/ponytail-claude-code) - aims at generated code rather than prose, pushing the model down a ladder (no code? one line? a config change?) before it writes anything; lite, full and ultra intensity levels. Ships as an add-on to [Headroom](#compress-what-reaches-the-model), which handles the input side

## Code instead of tool calls

One generated program replaces a chain of round trips, each of which carries full context. Saves both directions.

- [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling) - Claude calls tools from inside code execution; intermediate results skip the context window
- [Cloudflare Code Mode](https://blog.cloudflare.com/code-mode/) - agents write code against MCP tools instead of chaining calls
- [rlm](https://github.com/alexzhang13/rlm) - the same move aimed at context rather than tools: the model writes code that processes data too large to read, calling itself over the chunks. Also listed under [finding code](#find-code-without-reading-all-of-it)

## Design the language

Change what generated code costs in the first place. The moves in use across the [agent-language field](/docs/ecosystem/languages-for-agents/):

- **Dense syntax** - short fixed aliases, minimal punctuation: [ilo](https://github.com/ilo-lang/ilo) (`mapr`, `fld`, `rdjl`), [Mog](https://github.com/voltropy/mog) flat operators
- **Small loadable spec** - bound the artifact an agent must read before it can write the language: [Zero](https://github.com/vercel-labs/zerolang) and [Mog](https://github.com/voltropy/mog) both ship one under 3k tokens
- **Structured diagnostics** - stable error codes + fix hints kill retry loops: [Zero](https://github.com/vercel-labs/zerolang) repair plans, ilo `ILO-P/T/R` codes, [Codong](https://github.com/brettinhere/Codong) fix/retry JSON
- **Repair instead of reject** - accept output that near-misses the schema rather than erroring and asking again: [BAML](https://github.com/BoundaryML/baml) schema-aligned parsing fixes unquoted strings, missing brackets, commas and colons, misnamed keys, and strips surrounding prose. Boundary's [own BFCL figures](https://boundaryml.com/blog/schema-aligned-parsing) put SAP at 92% against 87.5% for gpt-3.5-turbo function calling (n=1000, vendor-run, and SAP is scored against a compressed schema rather than JSON schema, so the columns are not strictly comparable). Note what that measures: first-pass accuracy, not a token ledger. The retries avoided are counted, the verbose surface paid on every generation is not
- **One canonical form** - one way to write each operation, no plausible-but-wrong variants: Codong, [Lume](https://github.com/mavboas/lume)
- **Budgeted doc retrieval** - Lume's `lume kb pack "<q>" --max-tokens N` packs docs under a cap
- **Constrained decoding** - grammar masks the token distribution so invalid syntax cannot be sampled: [Axis](https://github.com/vmelnic/axis) LL(1) masks, MoonBit (ICSE 2024)

Full field: [agentlanguages.dev](https://agentlanguages.dev) and [languages for AI agents](/docs/ecosystem/languages-for-agents/). Vendor percentage claims are reported as claimed, not independently verified.
