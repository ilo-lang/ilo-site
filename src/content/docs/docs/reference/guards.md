---
title: Guards & Control Flow
description: Use this when expressing conditional logic without nesting (replaces if/else).
---

Use this when expressing conditional logic without nesting (replaces if/else).

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

Negated braceless guards work with any comparison. Use [`^` (throw)](/docs/reference/error-handling) to return an error instead of a value: `!<=n 0 ^"must be positive"`.

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

## The three conditional forms (side by side)

ilo has three syntactically distinct conditional shapes. They look similar at a glance and agents regularly mix them up, so it pays to learn the differences once.

| Form | Shape | Semantics | When to reach for it |
|---|---|---|---|
| Braceless guard | `cond expr` | Early return `expr` from the function if `cond` is true; otherwise fall through to the next statement. | Single-expression early exit inside a fn body. |
| Braced conditional | `cond{body}` | Run `body` if `cond` is true. **No early return** - execution continues to the next statement after the brace. | Side-effects mid-function (e.g. `prnt`), or `ret` inside a loop. |
| Brace ternary | `cond{then}{else}` | Evaluate `then` or `else`. **No early return** - produces a value. | Value with two arms, statement or expression position. |
| Prefix ternary (`?h`) | `?h cond a b` | Value: `if cond then a else b`. | Cheapest shape when the cond is a bool ref or complex bool expr. |

Worked side-by-side. The condition is `> x 0`; the arms are `"pos"` and `"nonpos"`:

```ilo
-- braceless guard: early return, fallthrough is the else
f x:n>t;>x 0 "pos";"nonpos"

-- braced conditional: body runs, no early return; explicit ret if needed
f x:n>t;>x 0{ret "pos"};"nonpos"

-- brace ternary: value, no early return, tail expr returns
f x:n>t;>x 0{"pos"}{"nonpos"}

-- prefix ternary keyword: cheapest when the bool is already named
f x:n>t;c=>x 0;?h c "pos" "nonpos"
```

**Common mistake.** `?h cond{...}` is **not** a legal shape - `?h` is the keyword prefix-ternary, so braces after the condition trigger ILO-P009. The parser hint enumerates the three canonical forms; the fix is to drop `?h` (for `cond{...}` or `cond{a}{b}`) or to drop the braces (for `?h cond a b`).

Negation: a leading `!` works on every form - `!cond expr`, `!cond{body}`, `!cond{a}{b}`, `!=x 1{"not one"}{"one"}`.

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

Functions that can fail return `R ok_type err_type` (a Result). A Result isn't a parameter type. It comes from calling a fallible function and capturing the return value. Use match to handle both cases:

- `~v`: matches the Ok variant, binds the inner value to `v`
- `^e`: matches the Err variant, binds the error to `e`

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

`div` returns `R n t`: either an Ok number or an Err string. `show` captures the Result in `r` (without auto-unwrapping) and matches on it.

You can also skip the rebind and put the call directly in the scrutinee slot — either bare or parenthesised, both parse the same:

```ilo
show a:n b:n>t;?div a b{~v:str v;^e:e}
show a:n b:n>t;?(div a b){~v:str v;^e:e}
```

```bash
ilo 'div a:n b:n>R n t;=b 0 ^"divide by zero";~/a b
show a:n b:n>t;r=div a b;?r{~v:str v;^e:e}' show 10 2
# → 5

ilo 'div a:n b:n>R n t;=b 0 ^"divide by zero";~/a b
show a:n b:n>t;r=div a b;?r{~v:str v;^e:e}' show 10 0
# → divide by zero
```

See [Error Handling](/docs/reference/error-handling) for more on `~` (Ok), `^` (Err), and the `R` type.

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
