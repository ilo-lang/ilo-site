---
title: Shadow Test Blocks
description: Compile-time self-verification for ilo functions. Assert expected return values before running.
---

Functions may carry inline `test` blocks that document and verify expected
behaviour at `ilo check` time. Test blocks extend ilo's verify-before-run
philosophy from type-checking to behaviour-checking.

## Syntax

```ilo
fn add a:n b:n>n;+a b
test add { ok add 2 3 5; ok add 0 0 0; ok add -1 1 0 }

fn div a:n b:n>R n t;=b 0 ^"divide by zero";~/a b
test div { ok div 10 2 5; err div 10 0 "divide by zero" }
```

| Element | Form |
|---------|------|
| Block header | `test <fn-name> {` |
| Ok assertion | `ok <fn-name> <arg>... <expected> ;` |
| Err assertion | `err <fn-name> <arg>... <expected-err> ;` |
| Block end | `}` |

## How it works

- **`ok`** calls `fn-name` with the given literal arguments and asserts the
  return value equals `expected`. For `R`-returning functions, this checks
  the `~v` (Ok) path.
- **`err`** calls `fn-name` and asserts it returns `^expected-err`. The
  expected error text is a string literal.
- **Literal args only.** Test assertions accept number, text, boolean, and
  nil literals, not arbitrary expressions.
- **Last literal is the expected value.** All preceding literals are call
  arguments. So `ok add 2 3 5` means: call `add(2, 3)`, assert result is `5`.
- **`;`-separated.** Assertions are separated by `;` inside the braces.
  Trailing `;` is optional.

## Error codes

| Code | Severity | Trigger |
|------|----------|---------|
| `ILO-T050` | Error | A test assertion failed (actual != expected) |
| `ILO-W020` | Warning | Function has no test block (under `--strict`) |

## Relationship to `ilo test`

Shadow test blocks live **inside** the language (in the source AST). They
complement the existing `-- run:` / `-- out:` / `-- err:` annotation
format used by the `ilo test` command, which lives **above** the language
(in comments the test harness reads).

| Feature | Shadow test blocks | `-- run:` / `-- out:` |
|---------|-------------------|----------------------|
| Where | In-source AST | In comments |
| When | `ilo check` time | `ilo test` command |
| Args | Literal values only | CLI args (strings, numbers, lists) |
| Engine | Verify pass | All engines (VM, JIT) |
| Assertion shape | `ok`/`err` | stdout/stderr/exit code |

## Example

```ilo
-- A function with its shadow test
fn safe-div a:n b:n>R n t
;=b 0 ^"divide by zero"
;~/a b

test safe-div {
  ok safe-div 10 2 5;
  ok safe-div 0 1 0;
  err safe-div 10 0 "divide by zero"
}
```

Run `ilo check` to verify. If `safe-div` returns the wrong value for any
assertion, `ILO-T050` fires with the actual vs expected values. If
`safe-div` has no test block and you run `ilo check --strict`, `ILO-W020`
warns that the function lacks self-verification.
