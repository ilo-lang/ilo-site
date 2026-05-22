---
title: Primitives
description: Use this when you need to look up an ilo type sigil or scalar/literal form.
---

Use this when you need to look up an ilo type sigil or scalar/literal form.

## Scalar types

| Sigil | Meaning | Literal example |
|-------|---------|-----------------|
| `n` | number (f64) | `42`, `3.14`, `-7` |
| `u32` | unsigned 32-bit integer | `42u`, `0u` |
| `u64` | unsigned 64-bit integer | `42U`, `0U` |
| `i64` | signed 64-bit integer | `42L`, `-7L` |
| `t` | text (string) | `"hello"`, `"line\n"` |
| `b` | bool | `true`, `false` |
| `_` | nil / wildcard | `nil` |

`u32`/`u64`/`i64` are native integer types with wrapping semantics and dedicated bitwise operators. Use them when you need exact integer widths (crypto, binary protocols, WASM interop).

## Container types

| Sigil | Meaning | Example |
|-------|---------|---------|
| `L T` | list of `T` | `L n`, `L t`, `L _` |
| `M K V` | map from `K` to `V` | `M t n` |
| `R T E` | result, ok=`T`, err=`E` | `R n t` |
| `O T` | optional `T` | `O n` |
| `S a b c` | sum type / discriminated union | `S red green blue` |
| `F A R` | function type | `F n t` (takes `n`, returns `t`) |

## Result and option literals

```ilo
ok=~42            -- R _ _ with ok payload 42
bad=^"oh no"      -- R _ t with err payload
some=?42          -- O n with value
none=?            -- O _ empty
```

## Comments

```ilo
-- single-line comment
```

There are no multi-line comments. The double-hyphen runs to end of line.

## Identifiers

- Lowercase only. `myVar` is an error (`ILO-L003`).
- Hyphens are allowed inside identifiers. Underscores are not (`ILO-L002`).
- Short by convention: 1 to 3 chars for locals, 2 to 4 for functions.

See [Types & Functions](/docs/reference/types-and-functions/) for how primitives compose into function signatures.
