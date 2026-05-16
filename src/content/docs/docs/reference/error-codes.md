---
title: Error Codes
description: ilo verification and runtime error codes
---

ilo verifies programs before execution. When verification fails, you get a compact error code. Runtime failures emit codes too. Use `ilo --explain ILO-XNNN` for the full explanation.

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
| `ILO-P017` | Inline lambda captures outer scope |
| `ILO-P018` | Variadic builtin not in trailing position |
| `ILO-P020` | Incomplete function header |

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
| `ILO-T032` | Bare `fmt` result is discarded |

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
| `ILO-R026` | Panic-unwrap on Err / nil |

Compact error codes mean agents spend fewer tokens reading error messages and correct faster.
