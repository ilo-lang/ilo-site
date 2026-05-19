---
title: CLI Reference
description: Use this when looking up an ilo CLI flag, subcommand, or invocation form.
---

Use this when looking up an ilo CLI flag, subcommand, or invocation form.

## Basic usage

```bash
ilo 'funcname params>type;body' args    # inline
ilo file.ilo funcname args              # from file
```

First argument is code or a file path (auto-detected). Remaining arguments are passed to the first function.

### Verb-noun subcommands

For consistency with `cargo`, `go`, and similar toolchains, ilo also exposes verb forms:

```bash
ilo run file.ilo arg1 arg2              # run (alias for the bare positional)
ilo check file.ilo                      # verify without running (exit 0 if clean)
ilo build file.ilo -o ./bin             # AOT compile (alias for `ilo compile`)
```

The bare positional forms (`ilo file.ilo`, `ilo compile ...`) remain fully supported; the verbs are aliases, not replacements. Use whichever shape you prefer.

`ilo check` is the only verb that adds new behaviour: it runs the lexer, parser, import resolver, and verifier on the input and exits 0 if the program is well-typed and verifier-clean, or 1 with diagnostics on stderr otherwise. It does not execute the program. Useful for editor save-hooks, agent inner loops, and CI gates that want fast type-only feedback without running the workload.

```bash
ilo check file.ilo                # human-readable diagnostics (auto-detects ANSI/text/JSON)
ilo check file.ilo --json         # NDJSON diagnostics on stderr
ilo check file.ilo --strict       # warnings (ILO-T032, ILO-T033) become exit-code failures
```

On a syntactically-broken input `ilo check` still emits the parse error and exits 1 rather than crashing, so it's safe to point at half-written code.

#### `--strict` for CI

By default `ilo check` only exits 1 on error-severity diagnostics. Warning-severity diagnostics (ILO-T032 bare `fmt`, ILO-T033 bare `mset` / `+=` / `mdel`, future warning codes) are emitted on stderr but the exit code stays 0, which is appropriate for interactive use where warnings are advisory.

CI harnesses that gate merges on `ilo check` need warnings to fail the build instead. `--strict` flips the exit-code decision: any warning bumps the exit code to 1. The diagnostic stream itself is unchanged: warnings still emit with `severity: "warning"` in the JSON output, so editor integrations that route by severity keep working correctly. Only the exit code is elevated.

```bash
# In CI:
ilo check src/*.ilo --strict --json
```



Select a named function in a multi-function program:

```bash
ilo 'dbl x:n>n;*x 2 tot p:n q:n r:n>n;s=*p q;t=*s r;+s t' tot 10 20 30
```

### Subcommand dispatch

The first positional argument after the source is treated as a function name **only if** it is a valid identifier and matches a defined function. The matcher accepts hyphenated identifiers, so `ilo file.ilo foo-bar` dispatches to the `foo-bar` function.

If the first positional is not a valid identifier (e.g. a path, a number, a list literal), it is treated as an argument to `main` when `main` is defined:

```bash
ilo file.ilo /tmp/data.json      # routes to main, /tmp/data.json is arg 1
ilo file.ilo 1,2,3               # routes to main, list literal is arg 1
```

This matches the default-engine heuristic: if there's only one function, or there's a `main`, no explicit dispatch is needed. The same auto-pick-main applies to the engine-selection flags (`--vm`, `--jit`) - they fall back to `main` (or the sole function) when no subcommand is supplied:

```bash
ilo file.ilo --vm 5          # runs main 5 on the VM
```

### Unknown `--flag` guard

Any token in the positional tail matching the clean long-flag shape (`--word` or `--word-with-dashes`) that isn't a recognised flag is rejected upfront with `error: unrecognised flag '<flag>'` and exit code 1. This prevents typos like `--engine tree` from silently consuming the flag as positional data and producing misleading `ILO-R012 no functions defined` or `ILO-R004 main: expected N args, got N+1` errors later on.

```bash
ilo main.ilo --engine tree
# error: unrecognised flag '--engine'. Use 'ilo --help' for valid flags.
# To pass it as a literal arg, separate with '--' first.
```

To pass a hyphen-prefixed token through as literal data, place the `--` separator first. Anything after the first `--` is data:

```bash
ilo main.ilo -- --foo            # `--foo` reaches `main` as a literal string arg
```

Tokens with `=` (`--key=val`), trailing or doubled dashes (`--foo-`, `--foo--bar`), and negative numbers (`-1`) are not clean flag shapes and pass through unchanged.

## Flags

| Flag | Description |
|------|-------------|
| `-ai` | Output compact spec for LLM consumption |
| `-e`, `--expanded` | Expanded/formatted output |
| `-d`, `--dense` | Dense wire format (minimal whitespace) |
| `-a`, `--ansi` | Force ANSI colour output (default for TTY) |
| `-t`, `--text` | Plain text output (no colour) |
| `-j`, `--json` | JSON output (default for piped output) |
| `-x`, `--explain` | Explain a program or error code |
| `--bench` | Benchmark a function |
| `--verify` | Type-check without executing |
| `--emit python` | Transpile to Python |
| `--tools tools.json` | Load HTTP tool declarations |
| `--mcp mcp.json` | Connect MCP servers |
| `--no-hints`, `-nh` | Suppress idiomatic hints |
| `compile` | AOT compile to standalone native binary |

## List arguments

Pass list arguments from the command line with bare commas (no spaces, no brackets):

```bash
ilo 'f xs:L n>n;len xs' 1,2,3       # → 3
ilo 'f xs:L t>t;xs.0' 'a,b,c'       # → a
```

## Higher-order function invocation from CLI

`map`, `flt`, `fld` take a function name as their first argument. Define the helper function alongside a `main` entry point and invoke `main`:

```bash
ilo 'sq x:n>n;*x x main xs:L n>L n;map sq xs' main 1,2,3,4,5
# → [1, 4, 9, 16, 25]

ilo 'pos x:n>b;>x 0 main xs:L n>L n;flt pos xs' main -3,-1,0,2,4
# → [2, 4]

ilo 'add a:n b:n>n;+a b main xs:L n>n;fld add xs 0' main 1,2,3,4,5
# → 15
```

Pipe chains work the same way:

```bash
ilo 'sq x:n>n;*x x pos x:n>b;>x 0 main xs:L n>L n;xs >> flt pos >> map sq' main -3,-1,0,2,4
# → [4, 16]
```

## Output formats

### ANSI, text, JSON

Control how results and errors are rendered:

```bash
ilo 'code' -a    # ANSI colour (default when stdout/stderr is a TTY)
ilo 'code' -t    # plain text (no colour)
ilo 'code' -j    # JSON (default when output is piped)
```

Set `NO_COLOR=1` to disable colour globally (equivalent to `--text`).

JSON error output follows a structured schema with `severity`, `code`, `message`, `labels` (with spans), `notes`, and `suggestion` fields.

### Dense and expanded format

```bash
ilo 'code' --dense     # -d  dense wire format (minimal whitespace, for agents)
ilo 'code' --expanded  # -e  expanded human-readable format
```

**Dense** is the default canonical form - single line per declaration, operators glued to first operand:

```ilo
cls sp:n>t;>=sp 1000{"gold"};>=sp 500{"silver"};"bronze"
```

**Expanded** adds 2-space indentation and spacing for human review:

```ilo
cls sp:n > t
  >= sp 1000 {
    "gold"
  }
  >= sp 500 {
    "silver"
  }
  "bronze"
```

Dense format is canonical: `dense(parse(dense(parse(src)))) == dense(parse(src))`.

## Transpile to Python

Generate standalone Python from ilo source:

```bash
ilo 'fac n:n>n;<=n 1 1;r=fac -n 1;*n r' --emit python
```

Output is valid Python that can be saved and run directly. Useful for interop or when deploying to environments without the ilo runtime.

## Benchmark

Time a function over repeated runs:

```bash
ilo program.ilo --bench funcname 10 20 30
```

Reports execution time for the named function with the given arguments.

## Explain

`--explain` (or `-x`) has two modes:

**Explain an error code** - show a detailed description of any `ILO-*` diagnostic:

```bash
ilo --explain ILO-T004
```

**Explain a program** - annotate each statement with a human-readable description of what it does:

```bash
ilo 'f x:n>n;*x 2' --explain
```

## Verify

All programs are type-verified before execution. Errors are reported with stable codes, source context, and suggestions:

```bash
ilo 'f x:n>n;*y 2' 5
# error[ILO-T004]: undefined variable 'y'
#   --> 1:9
#   |
# 1 | f x:n>n;*y 2
#   |         ^^^^
#   |
#   = note: in function 'f'
```

Error code prefixes indicate the phase:

| Prefix | Phase |
|--------|-------|
| `ILO-L___` | Lexer (tokenisation) |
| `ILO-P___` | Parser (syntax) |
| `ILO-T___` | Type verifier (static analysis) |
| `ILO-R___` | Runtime (execution) |

The verifier provides context-aware hints: "did you mean?" suggestions (Levenshtein-based), type conversion advice, missing match arms, and arity mismatches.

## AOT compilation

Compile an ilo program to a standalone native binary:

```bash
ilo compile program.ilo              # → outputs ./program
ilo compile program.ilo -o mybin     # → outputs ./mybin
ilo compile 'f x:n>n;*x 2' -o dbl   # inline code
ilo compile program.ilo -o bin func  # compile specific function
```

The compiler uses Cranelift to emit native machine code, links with the system `cc`, and produces a self-contained executable with no runtime dependencies.

**Entry-pick.** AOT follows the same entry-pick rules as the in-process engines: an explicit positional `func` argument wins; otherwise a single user-defined function is used directly; otherwise `main` is used if defined. With multiple functions and no `main` and no explicit entry, compilation fails with `ILO-E801` and exits 1 without writing a binary - rather than silently picking the first declared function (which produced binaries that called the wrong entry symbol and SIGSEGV'd at runtime).

```bash
ilo compile 'dbl x:n>n;*x 2' -o dbl
./dbl 5
# → 10
```

AOT-compiled binaries match the in-process runners byte-for-byte: top-level `~v` prints bare `v` on stdout with exit 0; `^e` prints `^e` on stderr with exit 1; non-Result returns print plain on stdout. Output is identical whether you `ilo run` or `ilo compile && ./binary`.

**Supported surface:** the same shape as the Cranelift JIT: numeric and text arithmetic, comparisons, guards and conditionals, loops, function calls, records, lists, maps, strings, JSON, HTTP, all builtins routed through the JIT runtime, and HOFs that take a function value (`map fn xs`, `flt fn xs`, `fld fn xs init`, `grp`, `uniqby`, fn-ref return and call), including inline lambdas with Phase 2 closure capture. As of 0.12.1, AOT-compiled binaries embed a postcard-serialised `CompiledProgram` blob into `.rodata` and a runtime helper deserialises it on startup so dispatch helpers can re-enter the VM on user-fn callbacks identically to the in-process runners. Pre-0.12.1, these shapes silently returned `nil` under AOT (engine audit PR #413 gap #1).

Requires the `cranelift` feature (enabled by default in release builds).

## Top-level program output

For a program whose entry function returns a Result, ilo splits the `~`/`^` wrapper across streams and exit codes so shell consumers don't have to strip a prefix:

| Top-level return | stdout | stderr | Exit |
|------------------|--------|--------|------|
| `~v` (Ok)        | `v` (bare) | — | 0 |
| `^e` (Err)       | — | `^e` | 1 |
| any non-Result   | `v` | — | 0 |

In `--json` mode the value is always wrapped (`{"ok": v}` / `{"error": ...}`) on stdout; exit codes match the table above. The contract applies uniformly to in-process runners and AOT-compiled binaries: output is byte-for-byte identical across every backend.

## JSON output across subcommands

Every subcommand that produces machine-readable output supports `--json` (or `-j`). New envelopes start with `"schemaVersion": 1` so agents can route on the contract and the shape can evolve without breaking older consumers. A few long-standing outputs predate the convention (`run`, `graph`, `--ast`, `serv`, `tools --json`) and keep their original shape.

| Command                     | `--json` support                | Versioned? |
| --------------------------- | ------------------------------- | ---------- |
| `ilo run` / `ilo file.ilo`  | yes (success + error envelopes) | legacy     |
| `ilo check`                 | yes (one diagnostic per line)   | per-diag   |
| `ilo build` / `ilo compile` | yes (`output`, `sizeBytes`, `durationMs`) | yes |
| `ilo graph`                 | yes (always JSON unless `--dot`) | legacy    |
| `ilo --ast`                 | yes (AST as JSON)               | legacy     |
| `ilo explain ILO-XXXX`      | yes                              | yes        |
| `ilo skill list/get/path/show` | yes                           | yes        |
| `ilo version`               | yes (`version`, `features`)      | yes        |
| `ilo tools`                 | yes (via `--json` subflag)       | legacy     |
| `ilo serv`                  | yes (JSONL stdio)                | legacy     |

`spec` and `repl` are intentionally not JSON: `spec` emits markdown / `ai.txt`, `repl` is interactive.

The full per-command schema reference lives in [`JSON_OUTPUT.md`](https://github.com/ilo-lang/ilo/blob/main/JSON_OUTPUT.md) in the ilo repo; it's locked by `tests/json_output_contracts.rs` so future changes that break a schema fail CI.

## Backend selection

ilo supports multiple execution backends. The default is the bytecode register VM. Cranelift JIT is opt-in via `--jit` for hot numeric loops:

| Flag | Backend |
|------|---------|
| *(default)* | Register VM (closure-aware, all opcodes supported) |
| `--jit` | Cranelift JIT (hot numeric loops; falls back to VM on bailout) |
| `--vm` | Register VM (canonical explicit form, symmetric with `--jit`) |
| `--run-vm` | Deprecated alias for `--vm`. Emits a one-shot stderr hint; removed in 0.13.0. |
| `--run-llvm` | LLVM JIT (requires `--features llvm` build) |

`--run-tree` / `--run` were removed from the public CLI in the 0.12.x soft-deprecation. The tree-walking interpreter stays in-tree as the internal dispatch target for a small set of HOF / regex / IO shapes the VM and Cranelift haven't lifted natively yet; the VM bails to it transparently. Full removal is deferred to 0.13.0+.

```bash
ilo 'fac n:n>n;<=n 1 1;r=fac -n 1;*n r' --jit fac 10
```

**Why the VM is the default.** It supports every opcode in the language (closures, listview windows, fused len-of-filter, every modern shape) without compile-and-bail cost. The pre-v0.11.9 default was Cranelift JIT with VM fallback - it paid the JIT compile cost on every program before discovering the JIT couldn't handle some opcode and falling back anyway. Opt into the JIT explicitly when a hot numeric loop justifies the compile time.

## REPL

Start an interactive session:

```bash
ilo repl        # interactive session
ilo repl -j     # REPL with JSON output (useful for agent integration)
```

Define functions, evaluate expressions, and accumulate state across lines. The REPL supports vim-style commands:

| Command | Description |
|---------|-------------|
| `:q` | Quit the REPL |
| `:w file.ilo` | Write current definitions to a file |
| `:defs` | Show all defined functions and types |
| `:clear` | Clear all accumulated state |
| `:help` | Show REPL help |

## Help

```bash
ilo help           # usage and examples
ilo help lang      # full language specification
ilo help ai        # compact spec for LLM consumption
ilo -ai            # same as help ai
```
