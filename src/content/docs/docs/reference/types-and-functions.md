---
title: Types & Functions
description: Use this when declaring functions, return types, or working with ilo's type sigils.
---

Use this when declaring functions, return types, or working with ilo's type sigils.

Every ilo function declares its parameter types and return type inline:

```text
funcname param1:type param2:type>returntype;body
```

## Type sigils

| Sigil | Type | Description |
|-------|------|-------------|
| `n` | Number | Integers and floats |
| `t` | Text | Strings |
| `b` | Boolean | `true` / `false` |
| `_` | Any | Wildcard, accepts any type |
| `L` | List | Ordered collection `[1 2 3]` |
| `M` | Map | Key-value pairs `{"key" "val"}` |
| `R` | Result | Success or error value |
| `O` | Optional | Nil or a value: `O n` |

`_` means "don't care", same as in match patterns. Use it for mixed-type lists (`L _`), results where you ignore a type (`R _ t`), or generic parameters (`x:_`).

## Examples

```ilo
dbl x:n>n;*x 2                            -- number → number
greet first:t last:t>t;fmt "{} {}" first last -- text params, text return
notzero x:n>b;!=x 0                       -- ! is logical NOT; returns a bool
pi>n;3.14159                              -- zero-arg function
```

## Multiple statements

In a file, use newlines and indentation:

```ilo
calc a:n b:n > n  -- two numbers in, number out
  s = + a b       -- sum
  p = * a b       -- product
  + s p           -- return sum + product
```

Inline, use `;` instead:

```bash
ilo 'calc a:n b:n>n;s=+a b;p=*a b;+s p' 3 4
```

Each statement binds a variable or returns a value. The last expression is the return value.

## Discarding a value (`_=expr`)

Use `_=expr` to explicitly discard a value and suppress the `ILO-T033` warning for mutation-shaped builtins (`mset`, `mdel`, `+=`) used for their side effects:

```text
_=mset m "visited" true   -- discard the new map; side-effect only
_=prnt debug-value        -- discard return, keep the print
```

The `_` sigil tells the verifier the discard is intentional. Without it, `mset m k v` as a bare statement silently drops the returned map and fires ILO-T033. For most cases you *do* want the assignment form (`m=mset m k v`) - `_=` is reserved for genuine fire-and-forget calls.

Newlines inside `[...]` or `(...)` are treated as whitespace, not statement separators, so list literals and parenthesised expressions can span multiple lines without problems. Windows CRLF (`\r\n`) is normalised to LF before parsing, so files edited on Windows work identically.

## Sum types (discriminated unions)

`type Name = V1 | V2(payloadType) | ...` declares a sum type at top level. Each variant may carry one payload:

```ilo
type shape = circle(n) | square(n) | point

area s:shape>n;?s{circle(r):*3.14 *r r; square(d):*d d; point:0}
```

Construct with `circle 5` (payload variant) or bare `point`; match with `tag(binding):` or `tag:` arms. Sum types are exhaustively matched - the verifier emits `ILO-T024` if a branch is missing.

## Generics

Sum type declarations accept type parameters, enabling reusable polymorphic variants:

```ilo
type result<a,b> = ok(a) | err(b)
type opt<a> = some(a) | none
```

Construct and match them exactly like non-generic sum types; the concrete type is inferred from context. For functions, the `_` (any) type accepts any value:

```ilo
identity x:_>_;x
```

There are no `'a`-style type variables on functions, no bounds, and no `where` clauses.

## Brace-lambda multi-statement body

A brace-lambda (`{params> stmts}`) gives a lambda a compact multi-statement body, anywhere a single-expression lambda is accepted:

```ilo
transform xs:L n>L n;map {x> s=*x x; +s 1} xs
```

Param names are bare (types inferred as `_`) and there is no explicit return type.

### `panic`

`panic msg` aborts immediately with a message (valid in any return-type context):

```ilo
assert-positive x:n>n;>x 0 x;panic "expected positive"
```

### Match alternatives

A match arm can cover multiple patterns with `|`:

```ilo
classify x:n>t;?x{0|1|2:"small"; _:"large"}
```

As of 26.5 an or-pattern only parses in the **first** arm; a later arm containing `|` fails with `ILO-P003` ([ILO-509](https://linear.app/ilo-lang/issue/ILO-509)). Put the or-pattern first, or expand the later arms into single patterns.

