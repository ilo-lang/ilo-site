---
title: Text
description: Use this when concatenating, formatting, splitting, searching, or matching strings.
---

Use this when concatenating, formatting, splitting, searching, or matching strings.

## Core operations

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `cat` | `t t > t` | Concatenate two strings | `cat "hello" " world"` -> `"hello world"` |
| `len` | `t > n` | String length | `len "hello"` -> `5` |
| `trm` | `t > t` | Trim whitespace | `trm " hi "` -> `"hi"` |
| `spl` | `t t > L t` | Split string by delimiter | `spl "a,b,c" ","` -> `["a","b","c"]` |
| `has` | `t t > b` | Check if string contains substring | `has "hello" "ell"` -> `true` |

## Regex

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `rgx` | `t t > L t` | Regex match (returns captures) | `rgx "abc123" "[0-9]+"` -> `["123"]` |
| `rgxall` | `t t > L (L t)` | All matches with captures, one inner list per match. With no capture groups, each inner list holds the whole match. | `rgxall "(\\w+)=(\\d+)" "a=1 b=2"` -> `[["a","1"],["b","2"]]` |
| `rgxall1` | `t t > L t` | All matches of a single-group pattern, flattened. With no capture groups, returns the list of whole matches. Errors at verify-time if the pattern has 2+ capture groups, use `rgxall` instead. | `rgxall1 "(\\d+)" "a=1 b=2"` -> `["1","2"]` |
| `rgxall-multi` | `L t t > L t` | Multi-pattern flat-match. Apply each pattern in the list to the string and concatenate hits in pattern order. Per-pattern semantics follow `rgxall1` (0 groups -> whole matches; 1 group -> capture-1 strings; 2+ groups errors). | `rgxall-multi ["\\d+" "[A-Z]+"] "x=1 ERR=2"` -> `["1","2","ERR"]` |

## Formatting

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `fmt` | `t ... > t` | Format string with values | `fmt "{} is {}" "sky" "blue"` |

`fmt` is pure-functional sprintf, **not print**. A bare `fmt "..." v` statement is silently discarded on every engine. Use `prnt fmt "..." v` to print or `line=fmt "..." v` to capture. The verifier emits **ILO-T032** when `fmt`/`fmt2` is a non-tail statement with no binding (tail position, e.g. `f v:n>t;fmt "x={}" v`, is the documented "return formatted text" idiom and does not warn).

## Conversion

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `str` | `_ > t` | Convert any value to string | `str 42` -> `"42"` |
| `num` | `t\|n > R n t` | Polymorphic: parse text or identity-wrap a number as Ok. Saves the `num (str x)` roundtrip when `x` may already be numeric (e.g. from `jpar!` on a JSON number) | `num "42"` -> `Ok 42`, `num 42` -> `Ok 42` |

## Output

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `prnt` | `_ > _` | Print value and return it | `prnt "hello"` |

## Aliases

| Long form | Short form |
|-----------|------------|
| `concat` | `cat` |
| `length` | `len` |
| `trim` | `trm` |
| `split` | `spl` |
| `contains` | `has` |
| `format` | `fmt` |
| `regex` | `rgx` |
| `print` | `prnt` |
