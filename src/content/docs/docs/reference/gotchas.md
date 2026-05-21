---
title: Gotchas
description: Use this when something parses unexpectedly or you hit a common ilo trap.
---

Use this when something parses unexpectedly or you hit a common ilo trap.

## `?` and `_`: context-sensitive symbols

`?` has two meanings, `_` has two meanings:

| Context | Syntax | Meaning |
|---------|--------|---------|
| Type annotation | `x:_` | Any/unknown type (wildcard) |
| Match expression | `?x{...}` | Match on value |
| Prefix ternary | `?=x 0 10 20` | Conditional expression |
| Match wildcard | `_:"default"` | Catch-all arm |

`_` means "don't care" in both type annotations and match patterns. `?` is always a conditional/match operator.

```ilo
f x:_>t;?x{n v:"number";t v:"text";_:"other"}
```

Here `_` after `:` is the any type, `?` starts a match, and `_:` in the match is the wildcard arm.

## Subtraction spacing: `a - b` needs spaces both sides

The lexer packs a leading `-` (no preceding space) into the number token, so `a -1.5` is `Number(a), Number(-1.5)` not `a, Minus, 1.5`. This is deliberate so call args and list elements read naturally:

```ilo
mod n -2        -- mod(n, -2) - glued -2 is the call's second arg
sub 5 -3        -- sub(5, -3)
[1 -2 3]        -- list of [1, -2, 3]
+a -3           -- a + (-3) - glued -3 is the binop's second operand
```

The downside: `0 -1.5` at statement position is **not** subtraction. The parser sees `Number(0), Number(-1.5)` and errors with:

```
ILO-P001: expected declaration, got number `-1.5`
hint: for subtraction, write `a - b` with spaces both sides (e.g. `0 - 1.5`).
      for a negative value as an expression, wrap in parens: `(-1.5)`.
```

Three idiomatic shapes:

```ilo
0 - 1.5         -- canonical subtraction (spaces both sides)
(-1.5)          -- bare negative value as an expression
mod n -2        -- glued -N as call arg / list element / binop operand (load-bearing)
```

The lexer auto-splits `-N` back into `Minus + Number` when the previous token introduces a fresh-expression position (`;`, newline, `=`, `{`, `(`, or `-`), so `-0 v` at the start of a body, `r=-1 x`, `{-1}`, and `(-1)` all work. After an Ident, `[`, or another prefix binop, the glued form is preserved.

## Ternary brace shapes: three canonical forms

`?` followed by braces is one operator with three shapes. Mixing them produces `ILO-P009`. The hint is context-aware: the parser looks at the arm shape and tells you which form you were closest to.

```ilo
?cond{T_arm; F_arm}             -- if/else on a boolean (exactly 2 arms)
?expr{val:T; val:T; _:T}        -- match on a value (one arm per case, `_:` catch-all)
?expr{Ok:body; Err:body}        -- match on a result/option (variant tags as arm keys)
```

Common misfires:

```ilo
?x{1:"a";2:"b"}                 -- ILO-P009: looks like match-on-value, missing `_:` catch-all
?cond{a;b;c}                    -- ILO-P009: 3 unlabelled arms, ternary takes exactly 2
?r{Ok:v}                        -- ILO-P009: result match missing `Err:` arm
```

Pick the shape by intent: boolean -> 2 arms, no labels. Value match -> `val:` labels plus `_:` default. Variant match -> tag names as keys, all variants covered.

## Call vs binary-op: `dx=xj 0-xi`

Whitespace-juxtaposition is the call syntax in ilo. Any bare name followed by another token in an expression parses as a call, not as "name then operator". The classic case:

```ilo
f xi:n xj:n>n;dx=xj 0-xi;dx
```

This parses as `dx=(xj 0) - xi`, a call to `xj` with argument `0`, whose result is subtracted from `xi`. Verification fails with `ILO-T005` because `xj` is a number, not a function. The error message includes the call-vs-binop hint pointing at the canonical fixes.

In ilo's prefix-operator world the agent almost always meant one of:

```ilo
-xj xi                         -- subtract: prefix `-` means `xj - xi`
nxi=0-xi;+xj nxi               -- pre-bind the operand, then add
```

The misparse comes up when an agent reaches for infix arithmetic between a parameter and a subexpression. Pre-binding the operand always resolves the ambiguity, and `ilo --explain ILO-T005` includes the full walkthrough.

## `zip` returns lists, not tuples

ilo has no tuple type. `zip xs ys` returns `L (L n)` - a list of two-element lists. Destructure pairs with `at pair 0` / `at pair 1`, not `pair.0` / `pair.1` when the pair name is unbound.

```ilo
-- DON'T: zs=zip xs ys; +tup.0 tup.1   -- 'tup' never bound; reads as tuple access
-- DO:    zs=zip xs ys;
          map (pair:L n>n;+at pair 0 at pair 1) zs
```

`ILO-T004` on `tup.0` / `pair.0` carries a hint naming the exact `at <name> <N>` call. The field-access sugar (`pair.0`) is still valid once `pair` is bound to an `L T` parameter; the diagnostic only fires when the identifier is unbound, which is the agent-frequent shape after a `zip`.

