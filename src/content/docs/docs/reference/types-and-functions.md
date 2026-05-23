---
title: Types & Functions
description: Use this when declaring functions, return types, or working with ilo's type sigils.
---

Use this when declaring functions, return types, or working with ilo's type sigils.

Every ilo function declares its parameter types and return type inline:

```ilo
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
truthy x:_>b;!!x                          -- any type, boolean return
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

```ilo
_=mset m "visited" true   -- discard the new map; side-effect only
_=prnt debug-value        -- discard return, keep the print
```

The `_` sigil tells the verifier the discard is intentional. Without it, `mset m k v` as a bare statement silently drops the returned map and fires ILO-T033. For most cases you *do* want the assignment form (`m=mset m k v`) — `_=` is reserved for genuine fire-and-forget calls.

Newlines inside `[...]` or `(...)` are treated as whitespace, not statement separators, so list literals and parenthesised expressions can span multiple lines without problems. Windows CRLF (`\r\n`) is normalised to LF before parsing, so files edited on Windows work identically.

## Sum types (discriminated unions)

`S` declares an enum-like sum type. Each variant can carry a payload:

```ilo
type shape S{circle:n; rect:n n; point}

area s:shape>n
  ?s{
    circle r: *3.14 *r r
    rect w h: *w h
    point: 0
  }
```

Sum types are exhaustively matched — the verifier emits `ILO-T024` if a branch is missing. Recursive sum types (e.g. linked lists, trees) are supported. Generics (`S{ok:T; err:E}`) let you parameterise variants over type variables.

## Generics

Functions accept type variables, written with a leading `'`:

```ilo
identity x:'a>'a;x

wrap x:'a>L 'a;[x]
```

Bounded generics constrain the type variable to a set of concrete types:

```ilo
to-str x:('a n|t)>t;str x
```

Multi-bound (comma-separated) and the full `where` clause form are supported for more complex constraints. The VM and JIT dispatch generics via monomorphisation at the call site.

## Brace-lambda multi-statement body

Lambdas (anonymous functions) can now have multi-statement bodies using `{|...|}`:

```ilo
transform xs:L n>L n
  map {|x:n>n; s=*x x; +s 1|} xs
```

The `{|...|} ` delimiters let a lambda span multiple statements in inline position, anywhere a single-expression lambda was previously required.

## Gleam-style additions

### `use<-` chain

`use<-` threads a value through a callback chain without nesting:

```ilo
main>R _ t
  use<- f=open! "data.txt"
  use<- rows=parse-csv! f
  ~len rows
```

Each `use<-` desugars to a callback; errors propagate via the `!` unwrap. The style eliminates the pyramid of doom from deeply-nested `?` matches.

### `todo` and `panic`

`todo` is a compile-safe placeholder that passes type-checking but aborts at runtime with a `todo: not implemented` message:

```ilo
complex-fn x:n>n;todo
```

`panic msg` aborts immediately with a message (equivalent to `^msg` at the top level, but valid in any return-type context):

```ilo
assert-positive x:n>n;>x 0 x;panic "expected positive"
```

### Match alternatives

A single match arm can cover multiple patterns with `|`:

```ilo
classify x:n>t;?x{0|1:"tiny"; 2|3|4:"small"; _:"large"}
```

### Multi-subject match

`?` can take a tuple of subjects:

```ilo
pair-kind a:b b:b>t;?{a b}{true true:"both"; false false:"neither"; _:"mixed"}
```
