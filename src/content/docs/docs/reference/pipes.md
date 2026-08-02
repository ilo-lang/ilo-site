---
title: Pipes
description: Use this when chaining transforms left-to-right with the pipe operator.
---

Use this when chaining transforms left-to-right with the pipe operator.

Inspired by Unix shell pipes (`|`), the pipe operator `>>` chains function calls left-to-right:

```ilo
dbl x:n>n;*x 2                  -- double a number
inc x:n>n;+x 1                  -- add 1
transform x:n>n;(x>>dbl>>inc)   -- double, then add 1
```

`x>>dbl>>inc` means: take `x`, pass to `dbl`, pass result to `inc`.

## Without pipes

```ilo
transform x:n>n;inc(dbl x)
```

## With pipes

```ilo
transform x:n>n;(x>>dbl>>inc)
```

Pipes read left-to-right, matching the data flow direction.

## Composition patterns

Pipes shine when you compose small, reusable functions into larger transforms.

### Chaining numeric transforms

```ilo
dbl x:n>n;*x 2                      -- double a number
inc x:n>n;+x 1                      -- add 1
sq x:n>n;*x x                       -- square a number

transform x:n>n;(x>>dbl>>inc>>sq)   -- double, add 1, then square
```

```bash
ilo 'dbl x:n>n;*x 2 inc x:n>n;+x 1 sq x:n>n;*x x transform x:n>n;(x>>dbl>>inc>>sq)' transform 3
# → 49  (3 → 6 → 7 → 49)
```

### Chaining list operations

Pipes work naturally with list higher-order functions:

- `map fn list` applies `fn` to every element
- `flt fn list` keeps elements where `fn` returns true (filter)
- `fld fn init list` reduces a list to a single value (fold)

```ilo
sq x:n>n;*x x                             -- square a number
pos x:n>b;>x 0                            -- is positive?
main xs:L n>L n;xs >> flt pos >> map sq   -- filter positives, square each
```

Read it left to right: take `xs`, keep only positives, square each.

```bash
ilo 'sq x:n>n;*x x pos x:n>b;>x 0 main xs:L n>L n;xs >> flt pos >> map sq' main -3,-1,0,2,4
# → [4, 16]  (-3,-1,0 filtered out; 2→4, 4→16)
```

### Eliminating intermediate variables

Without pipes, you need intermediate bindings:

```ilo
transform x:n>n;a=dbl x;b=inc a;sq b
```

With pipes, the same logic is a single expression:

```ilo
transform x:n>n;(x>>dbl>>inc>>sq)
```

### Pipes with auto-unwrap

Pipes combine with `!` for functions that return `R` (Result) types:

```ilo
f x:n>R n t;r=x>>g!>>h;~r
```

This desugars to `h(g!(f(x)))` - if `g` returns an error, it propagates immediately.

### Parentheses in multi-function files

In a file with multiple functions, wrap pipe chains in parentheses for non-last functions. This prevents the parser from consuming the next function's name:

```ilo
dbl-inc x:n>n;(x>>dbl>>inc)   -- parens needed (not the last function)
inc-sq x:n>n;x>>inc>>sq       -- last function, no parens needed
```

## Result-aware short-circuit

When the left operand of `>>` returns a `R T E` (Result) or `O T` (Optional), the pipe
auto-unwraps: `Ok(v)` passes `v` to the next stage; `Err(e)` short-circuits and propagates
`^e` out of the enclosing function via early-return. Non-Result values pass through unchanged.

This means you can chain Result-returning functions without explicit `!` on each stage:

```ilo
fetch url>>jpar>>jpth "name"
```

If `fetch` returns `^e`, both `jpar` and `jpth` are skipped, and `^e` propagates.
If `fetch` returns `~v`, `v` is unwrapped and passed to `jpar`.

The enclosing function must return `R` (or `O`) for the short-circuit to type-check,
same as `!`. Non-Result pipes (plain functions returning `n`, `t`, `L`, etc.) are
unaffected — no unwrap, no error propagation.

### How it works

The parser injects `UnwrapMode::PipePropagate` on intermediate pipe-desugared calls.
The verifier treats this leniently — non-Result returns pass through without `ILO-T025`.
The runtime checks the value's tag at each stage (`ISOK`/`ISERR`) so plain numbers,
text, and lists skip the unwrap entirely.

### Before and after

Before (manual unwrap per stage):

```ilo
fn process url:t>R t t
;r=get! url
;j=jpar! r
;n=jpth! j "name"
;n
```

After (Result-aware pipe, single line):

```ilo
fn process url:t>R t t
;url>>get>>jpar>>jpth "name"
```

Both are equivalent. The pipe form is ~60% fewer tokens and eliminates the class of
errors where an agent forgets a `!` on one of the intermediate stages.
