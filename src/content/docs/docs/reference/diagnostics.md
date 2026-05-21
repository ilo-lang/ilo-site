---
title: Diagnostics
description: Use this when you need to decode an ILO-* error code, understand fixSafety, or look up a repair plan.
---

Use this when you need to decode an ILO-* error code, understand fixSafety, or look up a repair plan.

ilo verifies programs before execution. When verification fails, you get a compact error code. Runtime failures emit codes too. Use `ilo --explain ILO-XNNN` for the full explanation.

## fixSafety taxonomy

Every diagnostic carries a `fixSafety` tag that tells an agent how aggressively it may auto-correct the code without re-asking the user:

| fixSafety | Meaning | Agent behaviour |
|-----------|---------|-----------------|
| `safe` | Mechanical, no semantic change | Apply the suggested fix without confirmation. |
| `likely` | Almost always correct, but reads context | Apply and continue; surface a one-line note. |
| `risky` | Multiple valid repairs exist | Propose and ask for confirmation. |
| `manual` | Requires human judgment | Surface the diagnostic and stop. |

## Repair plans

Diagnostics with a structured repair plan attach a JSON block to the JSON-mode (`-j`) error. The plan lists ordered edits the agent can apply mechanically:

```json
{
  "code": "ILO-T004",
  "message": "undefined variable 'y'",
  "fixSafety": "likely",
  "repair": [
    {"kind": "rename", "from": "y", "to": "x"}
  ]
}
```

See `ilo --explain ILO-XNNN` for the per-code repair contract.

## Namespace ranges

Every diagnostic ilo emits has the shape `ILO-<letter><digits>`. The letter is the **namespace** - the phase that raised the diagnostic - so agents and tools can route on prefix without parsing the message. Numeric ranges are reserved per namespace with generous gaps, so future codes slot in cleanly. A cross-engine regression test enforces this contract.

| Range | Letter | Area | Status |
|-------|--------|------|--------|
| `ILO-L000-099` | L | Lexer / tokenisation | active |
| `ILO-P100-199` | P | Parser / syntax | active |
| `ILO-N200-299` | N | Names / resolution | reserved |
| `ILO-I300-399` | I | Imports | reserved |
| `ILO-T400-499` | T | Types | active |
| `ILO-V500-599` | V | Verifier (post-type checks) | reserved |
| `ILO-R600-699` | R | Runtime | active |
| `ILO-D700-799` | D | Deprecation warnings | reserved |
| `ILO-E800-899` | E | Engine-specific limitations | reserved |
| `ILO-S900-999` | S | Skill / spec system | reserved |

**Historical codes stay valid.** ilo shipped with flat numbering inside each namespace (`ILO-L001`, `ILO-P001`, `ILO-T001`, `ILO-R001`, `ILO-W001`, all starting at 001). Those codes remain valid forever - agents and pinned tool configs depend on them. The hundreds-block allocation applies to new codes going forward.

**Reserved namespaces.** `N`, `I`, `V`, `D`, `E`, `S` carry no codes today. They are forward declarations so the first code in each category lands in its own range without conflicting with the active namespaces. `D` is earmarked for deprecation warnings: when a feature is scheduled for removal it emits an `ILO-D7xx` warning at compile time without failing the build.

## Lexer errors (ILO-L)

| Code | Description |
|------|-------------|
| `ILO-L001` | Unexpected character |
| `ILO-L002` | Underscore in identifier, use hyphens |
| `ILO-L003` | Uppercase identifier, use lowercase |

## Parse errors (ILO-P)

| Code | Description |
|------|-------------|
| `ILO-P001` | Unexpected token at top level |
| `ILO-P002` | Unexpected end of file at top level |
| `ILO-P003` | Unexpected token |
| `ILO-P004` | Unexpected end of file |
| `ILO-P005` | Expected identifier, got token |
| `ILO-P006` | Expected identifier, got end of file |
| `ILO-P007` | Expected type annotation, got token |
| `ILO-P008` | Expected type annotation, got end of file |
| `ILO-P009` | Expected expression, got token |
| `ILO-P010` | Expected expression, got end of file |
| `ILO-P011` | Expected pattern, got token |
| `ILO-P012` | Expected pattern, got end of file |
| `ILO-P013` | Expected number literal, got token |
| `ILO-P014` | Expected number literal, got end of file |
| `ILO-P015` | Expected tool description string |
| `ILO-P016` | Unexpected token after braceless guard body |
| `ILO-P017` | `use`-import failed |
| `ILO-P018` | Variadic builtin not in trailing position |
| `ILO-P019` | `use`-import name not found |
| `ILO-P020` | Incomplete function header |
| `ILO-P021` | Double-minus prefix-binop trap rejected - `- -<op> a b <op> c d` for `<op> ∈ {+, *, /}` is rejected at parse time because it silently miscompiles into `-(a-b)`. Use `- 0 +*a b *c d` or bind the inner result first. |
| `ILO-P101` | List-literal element starts with a variadic builtin (`fmt`, `fmt2`) followed by operands - rejected at parse time because the bare form would fall through as multiple elements with the builtin name as an undefined Ref. Wrap the call in parens (`[k (fmt2 v 2)]`) or bind first (`s=fmt2 v 2;[k s]`). |
| `ILO-P103` | AST nesting depth exceeded - the parser refused source nesting more than 256 levels deep. Default cap guards `ilo serv` and other untrusted-source paths from `((((...((1+1))))...))` DoS payloads. Flatten by binding intermediates, or raise with `--max-ast-depth N`. |

## Type / verifier errors (ILO-T)

| Code | Description |
|------|-------------|
| `ILO-T001` | Duplicate type definition |
| `ILO-T002` | Duplicate function or tool definition |
| `ILO-T003` | Undefined type |
| `ILO-T004` | Undefined variable |
| `ILO-T005` | Undefined function |
| `ILO-T006` | Arity mismatch |
| `ILO-T007` | Type mismatch at call site |
| `ILO-T008` | Return type mismatch |
| `ILO-T009` | Arithmetic operator type error |
| `ILO-T010` | Comparison operator type error |
| `ILO-T011` | Append (`+=`) type error |
| `ILO-T012` | Negate type error |
| `ILO-T013` | Builtin argument type error |
| `ILO-T014` | Foreach collection type error |
| `ILO-T015` | Record missing field |
| `ILO-T016` | Record unknown field |
| `ILO-T017` | Record field type mismatch |
| `ILO-T018` | Field access on non-record type |
| `ILO-T019` | Field not found on type |
| `ILO-T020` | `with` on non-record type |
| `ILO-T021` | `with` field not found |
| `ILO-T022` | `with` field type mismatch |
| `ILO-T023` | Index access on non-list type |
| `ILO-T024` | Non-exhaustive match |
| `ILO-T025` | `!` used on non-Result call |
| `ILO-T026` | `!` used in non-Result function |
| `ILO-T027` | Braceless guard body looks like a function name |
| `ILO-T028` | `brk`/`cnt` used outside a loop |
| `ILO-T029` | Unreachable code |
| `ILO-T030` | Circular type alias |
| `ILO-T031` | Type alias shadows builtin |
| `ILO-T032` | Bare `fmt` result is discarded |
| `ILO-T033` | Bare mutation-shaped builtin result is discarded |
| `ILO-T034` | `!` / `!!` used on a non-callable value |
| `ILO-T035` | Function exceeds the 256-register VM cap |
| `ILO-T036` | Call requires too many register slots (VM cap) |

## Warnings (ILO-W)

| Code | Description |
|------|-------------|
| `ILO-W001` | Guard without else inside loop (retired) |

## Runtime errors (ILO-R)

| Code | Description |
|------|-------------|
| `ILO-R001` | Undefined variable at runtime |
| `ILO-R002` | Undefined function at runtime |
| `ILO-R003` | Division by zero |
| `ILO-R004` | Runtime type error |
| `ILO-R005` | Field not found at runtime |
| `ILO-R006` | List index out of bounds |
| `ILO-R007` | `foreach` requires a list |
| `ILO-R008` | `with` requires a record |
| `ILO-R009` | Builtin argument error at runtime |
| `ILO-R010` | Compile error: undefined variable |
| `ILO-R011` | Compile error: undefined function |
| `ILO-R012` | No functions defined |
| `ILO-R013` | Internal VM error |
| `ILO-R014` | Auto-unwrap propagated Err / nil |
| `ILO-R016` | Wall-clock runtime budget exceeded - `ilo run` killed the program at the default 60 s budget. Almost always an infinite loop (missing loop increment, recursion without base case). Raise with `--max-runtime SECS` (0 disables) if a legitimate program needs longer. |
| `ILO-R017` | Stdout output budget exceeded - `ilo run` killed the program at the default ~100 MB budget. Usually a `prnt` call inside an unbounded loop. Raise with `--max-output-bytes BYTES` (0 disables) if legitimate. |
| `ILO-R026` | Panic-unwrap on Err / nil |
| `ILO-R099` | Internal runtime error |

## Deprecation warnings (ILO-D)

Reserved range. When a feature is scheduled for removal, ilo emits an `ILO-D7xx` warning at compile time without failing the build. No codes allocated yet - the first `ILO-D###` ships with the first feature deprecation.

## Engine-specific (ILO-E)

Reserved range for diagnostics that come from a particular execution engine (VM register caps surfaced ahead of time, JIT-unsupported opcode, AOT constraint). No `ILO-E###` codes yet.

## Skill / spec (ILO-S)

Reserved range for skill-bundle loader errors, manifest issues, spec-link breaks. No codes yet.

Compact error codes mean agents spend fewer tokens reading error messages and correct faster.
