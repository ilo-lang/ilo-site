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

