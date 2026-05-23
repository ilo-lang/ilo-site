---
title: Prefix Notation
description: Use this when writing arithmetic, comparisons, or any operator expression in ilo.
---

Use this when writing arithmetic, comparisons, or any operator expression in ilo.

Prefix notation is ilo's core token-saving device. Operators come before their operands.

## Basic examples

| Infix (traditional) | Prefix (ilo) | Chars saved |
|---|---|---|
| `(a * b) + c` | `+*a b c` | 4 |
| `((a + b) * c) >= 100` | `>=*+a b c 100` | 7 |
| `a > 0` | `>a 0` | 0 |

## Why prefix wins

Across 25 expression patterns: **22% fewer tokens, 42% fewer characters** vs infix.

Prefix eliminates:
- Parentheses for grouping
- Operator precedence ambiguity
- Nesting depth

```ilo
(a + b) * c  -- Infix: 5 tokens, 13 chars

*+a b c      -- Prefix: 4 tokens, 7 chars
```

## Reading prefix

Read inside-out, left-to-right:

| Expression | Meaning |
|------------|---------|
| `+a b` | add a and b |
| `* _ c` | multiply result and c |

## Infix also works

ilo supports infix too:

```ilo
a + b        -- works
x * y + 1    -- works
```

:::note
ilo emits a hint to stderr (or in the JSON `hints` array) suggesting the prefix form. Suppress with `--no-hints` / `-nh`.
:::

## Complete operator table

### Binary operators

| Prefix | Infix | Meaning | Types |
|--------|-------|---------|-------|
| `+a b` | `a + b` | add / concat / list concat | `n`, `t`, `L` |
| `+=a v` | `a += v` | append to list | `L` |
| `-a b` | `a - b` | subtract | `n` |
| `*a b` | `a * b` | multiply | `n` |
| `/a b` | `a / b` | divide | `n` |
| `=a b` | `a = b` | equal | any |
| `!=a b` | `a != b` | not equal | any |
| `>a b` | `a > b` | greater than | `n`, `t` |
| `<a b` | `a < b` | less than | `n`, `t` |
| `>=a b` | `a >= b` | greater or equal | `n`, `t` |
| `<=a b` | `a <= b` | less or equal | `n`, `t` |
| `&a b` | `a & b` | logical AND (short-circuit) | any (truthy) |
| `\|a b` | `a \| b` | logical OR (short-circuit) | any (truthy) |

:::note
Both `=` and `==` currently mean equality in prefix position. This syntax is under review. See [issue #120](https://github.com/ilo-lang/ilo/issues/120).
:::

### Unary operators

| Op | Meaning | Types |
|----|---------|-------|
| `-x` | negate | `n` |
| `!x` | logical NOT | any (truthy) |

### Special infix

| Op | Meaning |
|----|---------|
| `a??b` | nil-coalesce (if a is nil, return b) |
| `a>>f` | pipe (desugars to `f(a)`) |

## Infix precedence

When using infix, standard mathematical precedence applies (higher binds tighter):

| Level | Operators |
|-------|-----------|
| 6 | `*` `/` |
| 5 | `+` `-` |
| 4 | `>` `<` `>=` `<=` |
| 3 | `=` `!=` |
| 2 | `&` |
| 1 | `\|` |

Function application binds tighter than all infix operators:

```ilo
f a + b     -- means (f a) + b, NOT f(a + b)
```

## Token and character savings by pattern

Measured across 25 expression patterns using the `cl100k_base` tokenizer (used by Claude):

| Pattern | Infix | Prefix | Char savings |
|---------|-------|--------|-------------|
| Binary op | `a + b` | `+a b` | 1 char |
| Nested (2 deep) | `(a * b) + c` | `+*a b c` | 4 chars |
| Nested (3 deep) | `((a + b) * c) >= 100` | `>=*+a b c 100` | 6 chars |
| Chained comparison | `x >= 0 and x <= 100` | `&>=x 0 <=x 100` | 4 chars |
| Negation | `not (a == b)` | `!=a b` | 8 chars |

The key insight: each nested prefix operator saves 2 characters (no parentheses needed). Flat binary expressions save 1 character. The deeper the nesting, the bigger the savings.

Overall: **22% fewer tokens, 42% fewer characters** vs infix.

## More nesting examples

Prefix operators nest by each operator greedily consuming the next two operands. Those operands can themselves be operator expressions:

```ilo
-- Two levels: (a * b) + c
+*a b c

-- Two levels, right-heavy: a * (b + c)
*a +b c

-- Three levels: ((a + b) * c) >= 100
>=*+a b c 100

-- Symmetric: (a * b) - (c * d)
-*a b *c d

-- Four levels: (((a + b) * c) - d) / e
/-*+a b c d e

-- Mixed comparisons: (x + y) >= (a * b)
>=+x y *a b
```

### Reading deeply nested prefix

Read left-to-right. Each operator grabs the next two values (which may themselves be operator expressions):

`/-*+a b c d e`

| Step | Expression | Meaning |
|------|-----------|---------|
| 1 | `+a b` | add a and b |
| 2 | `* _ c` | multiply result and c |
| 3 | `- _ d` | subtract d from result |
| 4 | `/ _ e` | divide result by e |

This is equivalent to `(((a + b) * c) - d) / e` in infix - note how 4 pairs of parentheses disappear entirely.

### Same-precedence prefix-pair trap

The outer prefix op binds the inner prefix subexpression as its **left** operand, regardless of operator precedence. With two same-precedence ops side by side this disagrees with the natural left-to-right reading:

```ilo
*/a b c     -- (a/b) * c   ← NOT (a*b)/c
/*a b c     -- (a*b) / c   ← NOT (a/b)*c
+-a b c     -- (a-b) + c   ← NOT (a+b)-c
-+a b c     -- (a+b) - c   ← NOT (a-b)+c
```

The ilo runtime emits a `hint:` diagnostic on these four shapes after a successful run. To force the other grouping, either swap the operator pair or bind the inner result first:

```ilo
-- Want (a*b)/c with a=6, b=2, c=3:
r=*a b;/r c    -- bind, then divide → 4
/*a b c        -- equivalent, swapping the prefix-pair order
```

Different-precedence pairs like `+*a b c` (= `(a*b)+c`) and same-op repeats like `++a b c` (= `(a+b)+c`) match the left-to-right reading naturally and don't fire the hint.

### Operand rules

Operator operands must be atoms (literals, variable references, field access) or nested prefix operators. Function calls are generally not valid operands - bind their results first:

```ilo
-- WRONG: *n fac -n 1    (fac is treated as an atom, not a call)
-- RIGHT: r=fac -n 1;*n r (bind the call result, then use it)
```

**Exception: known-arity idents expand inline.** When a binop operand is an identifier whose arity is known (a defined function or a fixed-arity builtin), the parser expands it as a call by consuming the right number of following atoms - mirroring the existing `??` behaviour:

```ilo
sq x:n>n;*x x main xs:L n>n;+sum xs sq hd xs    -- = +(sum xs) (sq (hd xs))
```

This keeps simple compositions paren-free without forcing a bind-first rewrite. For anything more complex, bind the call result and use the variable.
