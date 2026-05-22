---
title: Manifesto
description: Every programming language was designed for people. ilo is designed for AI agents.
---

## The Audience Is Not Human

Every programming language in use today was designed for people. The syntax, the error messages, the tooling - all optimised for a brain that reads left-to-right, tracks visual indentation, and cares about aesthetics.

AI agents are not that brain. They produce tokens sequentially. They consume tokens from a finite context window. Every token they spend - generating, reading, retrying - costs real time and real money.

ilo is designed for them.

## The Only Metric

**Total tokens from intent to working code.**

```
Total cost = spec loading
           + generation
           + context loading
           + error feedback
           + retries
```

Every design decision is evaluated against this number. If a feature reduces it, it's in. If it increases it, it's out. No exceptions for elegance, readability, or convention.

Until agents are trained on ilo, spec clarity is itself a token cost - a confusing spec means more retries. Some decisions that look like "readability" concessions are actually optimising the spec-loading term.

## The Six Principles

### 1. Token-Conservative

The north star. Every choice evaluated against total token cost across the full loop - not just "short syntax," but including retries, error feedback, and context loading.

A named argument like `amount: 42` costs more tokens than positional `42`. Across 10 syntax variants and 4 task types, positional args scored 10/10 generation accuracy. The swap concern was unfounded. Positional args are the single biggest token saver.

:::note[What the agent cares about]
"How many tokens will this cost me end-to-end?"

The language is as terse as possible *without increasing retry rate*. Where there's a tradeoff between generation cost and error rate, we optimise for total cost.
:::

**Prefix notation** eliminates parentheses and saves tokens at every nesting level. `(a * b) + c` becomes `+*a b c` - 4 fewer characters, 1 fewer token. Deeper nesting saves more: `((a + b) * c) >= 100` becomes `>=*+a b c 100` - 7 fewer characters, 3 fewer tokens. Across 25 expression patterns, prefix notation saves 22% of tokens and 42% of characters vs infix.

**Guards instead of if/else** eliminate nesting depth. In a traditional language, conditional logic stacks:

```python
if a:
    if b:
        if c:
            return x
```

Each level adds indentation, a closing brace, and more state for the agent to track. In ilo, guards are flat statements that return early and chain vertically:

```ilo
>=a 0 x   -- if a >= 0, return x; otherwise continue
>=b 0 y   -- if b >= 0, return y; otherwise continue
z         -- default return
```

No nesting. No closing braces to match. Each guard is a single statement the agent can emit and forget. Depth stays constant regardless of how many conditions there are.

**Match instead of switch** eliminates fall-through - a common source of bugs in C-style languages where missing a `break` causes execution to bleed into the next case. In ilo, each match arm is independent and exhaustive. There is no fall-through because there is no execution path between arms.

**Naming rule:** prefer single-word identifiers. Across all major LLM tokenisers (OpenAI, Anthropic), common English words are 1 token. Hyphenated compounds are always 2 - the hyphen forces a token split. Every hyphen in a name doubles its token cost. Abbreviations (`uid` vs `user`) save characters but not tokens - tokenisers encode common words as single tokens either way.

### 2. Constrained

Small vocabulary. Closed world. Few ways to do things.

When an agent generates the next token, how many valid options are there? Fewer valid next-tokens means fewer wrong choices means fewer retries. This isn't about limiting expressiveness - it's about making the right token obvious.

- **Closed world.** Every callable function is known ahead of time. The agent cannot hallucinate an API that doesn't exist.
- **Small vocabulary.** Fewer keywords, fewer constructs, one way to define a function, one way to call it, one way to handle errors.
- **Verification before execution.** All calls resolve, all types align, all dependencies exist - checked before running anything.

:::note[What the agent cares about]
"At each generation step, how many valid tokens are there?"

The language becomes a set of rails. Constrained generation can feed valid next-token sets back to the agent, making it *impossible* to generate invalid code.
:::

### 3. Self-Contained

Each unit carries its own context: deps, types, rules.

An agent working on function A shouldn't need to load functions B through Z to understand what A does. The less context required per step, the fewer tokens consumed, the more of the context window is available for the actual task.

- **Explicit dependencies.** Each function declares exactly what it needs - by name, with types. No globals, no ambient state, no implicit imports.
- **Small units.** A function that fits in a few dozen tokens can be loaded, understood, and modified cheaply.
- **Spec as context.** Until foundation models are trained on ilo, agents need the spec somewhere they can access it - bundled with the program, fetched on demand, or installed locally.

:::note[What the agent cares about]
"How much context do I need to load to work on this unit?"

Minimal context loading per task. Each unit is self-describing. The agent never needs to hunt for definitions elsewhere.
:::

### 4. Language-Agnostic

Minimise dependency on English or any natural language.

Early variants used short English-derived keywords (`fn`, `let`, `match`, `for`, `if`). Experiments showed structural tokens outperform keywords entirely - the winning syntax replaced control-flow keywords with single-character sigils:

- `?` conditional/match, `!` auto-unwrap, `~` ok-wrap, `^` err/throw, `@` iterate, `>` pipe/return
- Builtins are short abbreviated names: `len`, `hd`, `tl`, `map`, `flt`, `fld`, `srt`, `cat`, `spl`. A closed, memorisable set - not open-ended English.
- Agents learned the full vocabulary from spec + examples with 10/10 accuracy.

:::note[What the agent cares about]
"Can I learn this language from its spec and examples, regardless of my training?"

The spec is small enough to bundle with any program. Keywords are learned from structure, not from natural language understanding.
:::

### 5. Graph-Reducible

When analysing code, reduce context size by loading only the relevant subgraph.

Writing code costs the same tokens regardless of program size. But *reading* code - understanding what exists, what calls what, what breaks if you change something - scales with program size. ilo makes the dependency graph explicit and queryable, so the agent loads only what it needs.

- **Typed signatures as contracts.** Every function declares its params and return type. To understand what `create-user` does, an agent only needs its signature - not the 20 other functions in the file.
- **Explicit dependencies.** `use "auth.ilo" [vld-email vld-plan]` declares exactly what's imported. No scanning, no guessing.
- **Queryable structure.** `ilo graph` extracts call graphs, type dependencies, reverse callers, and transitive subgraphs as JSON. An agent modifying one function in a 30-function program loads 6-10% of the code instead of 100%.

:::note[What the agent cares about]
"How much do I need to read before I can write?"

The agent loads the target function's source, its dependencies' signatures, and the types it references - nothing more. As programs grow, the savings compound.
:::

### 6. Structured Compiler-to-Agent Surface

Every path from the compiler to an agent is machine-readable by default.

Diagnostics, AST output, call graphs, fix plans, skill content, size reports — all of it ships as structured JSON. Not as an optional flag you might forget to pass, but as the default contract. Prose output exists for human TTYs; JSON is the agent path.

- **Every CLI subcommand has a `--json` mode.** An agent driving `ilo check`, `ilo graph`, `ilo bench`, or any other subcommand gets a typed, parseable response with no screen-scraping.
- **Every emitted artifact carries a stable `schemaVersion` field.** Schemas evolve; the version field lets agents detect and adapt to changes rather than silently misparse them.
- **Every diagnostic carries machine-readable fields:** error code, source span, candidate fixes, and related locations. An agent reading a diagnostic knows exactly what went wrong, where it went wrong, and what to try next — without parsing human prose.
- **Fix plans are typed:** each suggested repair carries a `FixSafety` classification so the agent can decide autonomously whether to apply it.

:::note[What the agent cares about]
"Can I parse the compiler's response without writing a regex?"

Zero screen-scraping, zero retry cycles caused by format ambiguity. The agent reads typed JSON, acts on it, and moves on.
:::

## Principles We Considered and Dropped

**Deterministic** - if the language is constrained (closed world, no ambient state) and self-contained (explicit deps, pure functions), determinism falls out for free. It doesn't need its own principle because it's a consequence of principles 2 and 3, not a design lever you pull independently.

**Append-only** - the idea was that agents should only add code, never edit it. But if units are small enough to fit in a few dozen tokens, regenerating one is cheaper than maintaining append-only structural constraints. Small self-contained units (principle 3) make this unnecessary.

**Immediate feedback** - fast error cycles are critical for agents, but that's a property of the runtime and tooling (`ilo verify`, typed errors, zero-startup execution), not the language design itself. It matters for the ecosystem but doesn't constrain language decisions, so it doesn't belong in the principles.

## The Name

*ilo* is the Toki Pona word for "tool."

Toki Pona is a constructed language built around radical minimalism. ~120 words. 14 phonemes. Complex ideas expressed by combining simple terms. It constrains human expression to force clarity of thought.

ilo does the same for machine programmers. A minimal, verified vocabulary. Complex programs built by composing small, self-contained units. The constraint is the feature.

## What ilo Is Not

**Not a framework for building AI agents.** There are plenty of those. ilo is a language for agents to write programs *in*.

**Not optimised for human readability.** Humans can read it - it's not obfuscated - but no decision is made because it "looks cleaner" or "reads more naturally." If a design is uglier but costs fewer total tokens, it wins.

**Not theoretical.** Every principle here addresses measured failure modes in AI-generated code: hallucinated APIs, context window exhaustion, wasted retry cycles from vague errors.

## What ilo Is

A **minimal, verified action space** - the smallest set of constructs an agent needs to express computational intent, with relationships made explicit and everything else stripped away.
