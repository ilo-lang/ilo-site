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

Newlines inside `[...]` or `(...)` are treated as whitespace, not statement separators, so list literals and parenthesised expressions can span multiple lines without problems. Windows CRLF (`\r\n`) is normalised to LF before parsing, so files edited on Windows work identically.
