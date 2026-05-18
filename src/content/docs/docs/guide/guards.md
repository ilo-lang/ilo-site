---
title: Guards & Control Flow
description: Flat conditional logic with guards
---

ilo uses **guards** instead of if/else. Guards are flat statements that return early - no nesting, no closing braces.

## Basic guards

Inline (semicolons replace newlines):

```ilo
grd s:n>t;>=s 90 "A";>=s 80 "B";>=s 70 "C";"F"
```

Or the same thing as a file (newlines and indentation):

```ilo
grade score:n > t    -- number in, text out
  >= score 90 "A"    -- if score >= 90, return "A"
  >= score 80 "B"    -- if score >= 80, return "B"
  >= score 70 "C"    -- if score >= 70, return "C"
  "F"                 -- fallback
```

Each guard checks a condition. If true, the function returns that value. Otherwise, execution continues.

## Why guards?

Compare the Python equivalent:

```python
if score >= 90:
    return "A"
elif score >= 80:
    return "B"
elif score >= 70:
    return "C"
else:
    return "F"
```

Guards eliminate `if`/`elif`/`else` keywords, braces, and deep nesting - fewer tokens to generate, fewer places for AI agents to make mistakes. Every guard chain must end with a fallback value, so you can't have an open-ended switch that silently returns nothing.

## Boolean guards

Inline:

```ilo
chk x:n>t;==x 0 "zero";>x 0 "positive";"negative"
```

Or as a file:

```ilo
check x:n > t        -- number in, text out
  == x 0 "zero"      -- if x equals 0, return "zero"
  > x 0 "positive"   -- if x > 0, return "positive"
  "negative"          -- fallback
```

## Negated guards

Prefix a guard with `!` to negate the condition:

Inline:

```ilo
f x:n>n;!>x 0 0;x
```

Or as a file:

```ilo
f x:n > n  -- number in, number out
  !> x 0 0 -- if x not greater than 0, return 0
  x        -- otherwise return x
```

If x is NOT greater than 0, return 0. Otherwise return x.

```bash
ilo 'f x:n>n;!>x 0 0;x' 5
# → 5

ilo 'f x:n>n;!>x 0 0;x' -3
# → 0
```

Negated braceless guards work with any comparison. Use [`^` (throw)](/docs/guide/error-handling) to return an error instead of a value: `!<=n 0 ^"must be positive"`.

## Braced guards

The return value can be enclosed in braces. Both forms produce identical results:

```ilo
>=sp 1000 "gold"    -- braceless
>=sp 1000{"gold"}   -- braced (identical result)
```

Use braces when the body has multiple statements:

```ilo
>=sp 1000{a=classify sp;a}
```

## Ternary

Like `x == 0 ? 10 : 20` in JS/C/Go, a ternary produces a value. Unlike guards, it does **not** return early - code after it keeps running, unless it's the last expression in the function.

### Prefix ternary

`?` followed by a comparison operator, then the true and false values:

```ilo
f x:n>n;?=x 0 10 20
```

```bash
ilo 'f x:n>n;?=x 0 10 20' f 0
# → 10

ilo 'f x:n>n;?=x 0 10 20' f 5
# → 20
```

The condition must start with a comparison operator (`=`, `>`, `<`, `>=`, `<=`, `!=`). You can assign the result:

```ilo
f x:n>n;v=?=x 0 10 20;+v 1   -- v is 10 or 20, then add 1
```

**Bare-bool prefix ternary.** When the condition is already a boolean - a bound `b` variable or a call returning `b` - drop the comparison and use `?` directly:

```ilo
f x:n h:b>n;?h 10 20             -- if h then 10 else 20
g x:n>n;?pos x 1 -1              -- pos x : b, returns 1 or -1
```

The braced form `?h{a}{b}` is also accepted and equivalent.

### Braced ternary

A guard with **two** brace blocks - `{then}{else}`:

```ilo
f x:n>t;=x 1{"yes"}{"no"}
```

```bash
ilo 'f x:n>t;=x 1{"yes"}{"no"}' 1
# → yes

ilo 'f x:n>t;=x 1{"yes"}{"no"}' 2
# → no
```

Supports negation: `!=x 1{"not one"}{"one"}`.

:::note
Ternary syntax is under review - one of these forms may be removed in a future release. See [issue #119](https://github.com/ilo-lang/ilo/issues/119).
:::

## Match expressions

For value matching:

Inline:

```ilo
describe x:t>t;?x{"dog":"woof";"cat":"meow";_:"unknown"}
```

Or as a file:

```ilo
describe x:t > t       -- text in, text out
  ? x {                -- match on x
    "dog": "woof"      -- if x is "dog", return "woof"
    "cat": "meow"      -- if x is "cat", return "meow"
    _: "unknown"       -- wildcard: catches everything else
  }                    -- end match
```

`_` is the wildcard arm. No fall-through; each arm is independent.

### Matching on Result types

Functions that can fail return `R ok_type err_type` (a Result). A Result isn't a parameter type — it comes from calling a fallible function and capturing the return value. Use match to handle both cases:

- `~v` — matches the Ok variant, binds the inner value to `v`
- `^e` — matches the Err variant, binds the error to `e`

Inline:

```ilo
div a:n b:n>R n t;=b 0 ^"divide by zero";~/a b
show a:n b:n>t;r=div a b;?r{~v:str v;^e:e}
```

Or as a file:

```ilo
div a:n b:n > R n t          -- two numbers in, Result out
  = b 0 ^"divide by zero"   -- if b is 0, return Err
  ~/a b                      -- otherwise return Ok(a / b)

show a:n b:n > t             -- two numbers in, text out
  r = div a b                -- call div, capture Result in r
  ? r {                      -- match on the Result
    ~v: str v                -- Ok: convert number to text
    ^e: e                    -- Err: return error message
  }                          -- end match
```

`div` returns `R n t` — either an Ok number or an Err string. `show` captures the Result in `r` (without auto-unwrapping) and matches on it.

```bash
ilo 'div a:n b:n>R n t;=b 0 ^"divide by zero";~/a b
show a:n b:n>t;r=div a b;?r{~v:str v;^e:e}' show 10 2
# → 5

ilo 'div a:n b:n>R n t;=b 0 ^"divide by zero";~/a b
show a:n b:n>t;r=div a b;?r{~v:str v;^e:e}' show 10 0
# → divide by zero
```

See [Error Handling](/docs/guide/error-handling) for more on `~` (Ok), `^` (Err), and the `R` type.

### Matching on type

When the input type is unknown (`_`), match on the runtime type:

Inline:

```ilo
f x:_>t;?x{n v:"number";t v:"text";_:"other"}
```

Or as a file:

```ilo
f x:_ > t                  -- any type in, text out
  ? x {                    -- match on runtime type
    n v: "number"          -- if x is a number
    t v: "text"            -- if x is text
    _: "other"             -- anything else
  }                        -- end match
```

Each arm specifies a type tag (`n`, `t`, `b`, `l`) followed by a binding variable.

## Early return with `ret`

The last expression in a function is its return value, no `return` keyword needed. Guards also return early when a condition matches. Use `ret` when you need an explicit early return from inside a loop or braced block:

Inline:

```ilo
f x:n>n;>x 0{ret x};0
```

Or as a file:

```ilo
f x:n > n            -- number in, number out
  > x 0 { ret x }   -- if x > 0, return x early
  0                  -- fallback
```

Guards already provide early return for simple cases. Use `ret` when you need early return inside a loop or deeply nested block:

Inline:

```ilo
f xs:L n>n;@x xs{>=x 10{ret x}};0  -- return first element >= 10
```

Or as a file:

```ilo
f xs:L n > n              -- list of numbers in, number out
  @x xs {                 -- loop over list
    >= x 10 { ret x }    -- if x >= 10, return it early
  }                        -- end loop
  0                        -- fallback if none found
```
