---
title: Error Handling
description: Results, optionals, auto-unwrap, and nil-coalesce
---

## Why not try/catch?

Try/catch is verbose. An AI agent generating `try { ... } catch (e) { ... }` pays tokens for boilerplate, and if it forgets the catch block, the error is silently swallowed. ilo makes errors part of the type system - you can't forget to handle them.

## Quick errors with `^`

Any function can bail out early with `^`:

```ilo
div a:n b:n > n            -- says it returns a number...
  = b 0 ^"divide by zero"  -- ...but ^ can throw an error
  / a b                     -- otherwise divide
```

```bash
ilo 'div a:n b:n>n;=b 0 ^"divide by zero";/a b' div 10 2
# → 5

ilo 'div a:n b:n>n;=b 0 ^"divide by zero";/a b' div 10 0
# → ^divide by zero
```

`^` exits the function immediately with an error. But there's a problem: the return type says `> n` (a number), so any code **calling** this function expects a number back - it has no way to catch or handle the error. The error just crashes through.

## Recoverable errors with `R`

If you want callers to **catch and handle** errors, use `R` as the return type. This wraps the result so the caller can inspect it:

```
R success-type error-type
```

Read it as: "**R**esult - first type is what you get on success, second is what you get on error".

For example, `R n t` breaks down as:

| Part | Meaning |
|------|---------|
| `R` | this is a Result |
| `n` | success value is a **n**umber |
| `t` | error value is **t**ext |

Common patterns:

| Type | Success | Error |
|------|---------|-------|
| `R n t` | number | text message |
| `R t t` | text | text message |
| `R _ t` | nothing (side effect) | text message |

Inside the function, `~` marks the success path and `^` marks the error path:

```ilo
div a:n b:n > R n t
  = b 0 ^"divide by zero"
  ~ / a b
```

Now callers can match on the result with `?`:

```ilo
show a:n b:n > t
  r = div a b
  ? r {~v: str v; ^e: e}
```

- `~v:` - if success, bind the value to `v`
- `^e:` - if error, bind the error to `e`

```bash
ilo 'div a:n b:n>R n t;=b 0 ^"divide by zero";~/a b
show a:n b:n>t;r=div a b;?r{~v:str v;^e:e}' show 10 0
# → divide by zero
```

## Auto-unwrap with `!`

Matching every Result is tedious. `!` auto-unwraps: success continues, error propagates up. The calling function must also return `R`:

```ilo
calc a:n b:n > R n t
  v = div! a b
  ~ * v 2
```

`div! a b` = call `div`, if error return it immediately, if ok bind the value. One character (`!`) replaces a whole try/catch block.

## Panic-unwrap with `!!`

`!!` has the same shape as `!`, but on error it aborts the program with a runtime diagnostic and exit 1 instead of propagating. There is no constraint on the enclosing function's return type, so `!!` works from `main>t`, `main>n`, or any non-Result context. Use it for one-shot scripts where there is nowhere sensible to propagate to:

```ilo
main>t
  xs=rdl!! "input.txt"   -- read file, abort with diagnostic if missing
  cat xs "\n"
```

```ilo
main>n;num!! "42"        -- parse number, abort on parse error
```

On `^e` the program writes `panic-unwrap: <Err payload>` to stderr and exits 1. On `O nil` it writes `panic-unwrap: expected value, got nil`. On `~v` or non-nil Optional, the inner value is extracted, identical to `!`.

Use `!` when the caller might want to react to the error (compensate, retry, log). Use `!!` when failure is a programming or environmental error the caller has no way to recover from.

## Optional type `O`

`O T` means "maybe a value of type `T`, maybe `nil`":

```ilo
f > O n; nil
g > O n; 42
```

```bash
ilo 'f>O n;nil' f
# → nil

ilo 'f>O n;42' f
# → 42
```

## Nil-coalesce with `??`

`??` provides a default when a value is nil:

```ilo
f x:O n > n; x ?? 0
```

```bash
ilo 'f x:O n>n;x??0' f 42
# → 42

ilo 'f>O n;nil' f
# → nil
```

`??` chains: `a??b??99` returns the first non-nil value, or 99.

## Compact error codes

When type verification fails, ilo returns compact error codes:

```
ILO-T004: type mismatch: expected n, got t
```

One token, not a paragraph. Agents correct faster with less context.
