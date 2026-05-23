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
f x:n>>g!>>h
```

This desugars to `h(g!(f(x)))` - if `g` returns an error, it propagates immediately.

### Parentheses in multi-function files

In a file with multiple functions, wrap pipe chains in parentheses for non-last functions. This prevents the parser from consuming the next function's name:

```ilo
dbl-inc x:n>n;(x>>dbl>>inc)   -- parens needed (not the last function)
inc-sq x:n>n;x>>inc>>sq       -- last function, no parens needed
```
