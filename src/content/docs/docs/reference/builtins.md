---
title: Built-in Functions
description: Complete reference for ilo's built-in functions
---

## Arithmetic Operators

| Operator | Description | Example | Result |
|----------|-------------|---------|--------|
| `+` | Add | `+3 4` | `7` |
| `-` | Subtract | `-10 3` | `7` |
| `*` | Multiply | `*3 4` | `12` |
| `/` | Divide | `/10 2` | `5` |
| `%` | Modulo | `%10 3` | `1` |

## Comparison Operators

| Operator | Description | Example | Result |
|----------|-------------|---------|--------|
| `==` | Equal | `==a b` | `true`/`false` |
| `!=` | Not equal | `!=a b` | `true`/`false` |
| `>` | Greater than | `>a b` | `true`/`false` |
| `<` | Less than | `<a b` | `true`/`false` |
| `>=` | Greater or equal | `>=a b` | `true`/`false` |
| `<=` | Less or equal | `<=a b` | `true`/`false` |

## Logic

| Operator | Description | Example |
|----------|-------------|---------|
| `&` | Logical AND | `&a b` |
| `\|` | Logical OR | `\|a b` |
| `!` | Logical NOT | `!a` |

## Text

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `cat` | `t t > t` | Concatenate two strings | `cat "hello" " world"` → `"hello world"` |
| `len` | `t > n` | String length | `len "hello"` → `5` |
| `trm` | `t > t` | Trim whitespace | `trm " hi "` → `"hi"` |
| `spl` | `t t > L t` | Split string by delimiter | `spl "a,b,c" ","` → `["a","b","c"]` |
| `has` | `t t > b` | Check if string contains substring | `has "hello" "ell"` → `true` |
| `rgx` | `t t > L t` | Regex match (returns captures) | `rgx "abc123" "[0-9]+"` → `["123"]` |
| `rgxall` | `t t > L (L t)` | All matches with captures - one inner list per match. With no capture groups, each inner list holds the whole match. | `rgxall "(\\w+)=(\\d+)" "a=1 b=2"` → `[["a","1"],["b","2"]]` |
| `rgxall1` | `t t > L t` | All matches of a single-group pattern, flattened. With no capture groups, returns the list of whole matches. Errors at verify-time if the pattern has 2+ capture groups - use `rgxall` instead. | `rgxall1 "(\\d+)" "a=1 b=2"` → `["1","2"]` |
| `fmt` | `t ... > t` | Format string with values. **`fmt` is pure-functional sprintf, not print** — a bare `fmt "..." v` statement is silently discarded on every engine. Use `prnt fmt "..." v` to print or `line=fmt "..." v` to capture. The verifier emits **ILO-T032** when `fmt`/`fmt2` is a non-tail statement with no binding (tail position, e.g. `f v:n>t;fmt "x={}" v`, is the documented "return formatted text" idiom and does not warn) | `fmt "{} is {}" "sky" "blue"` |

## Collections (Lists)

| Function | Alias | Signature | Description | Example |
|----------|-------|-----------|-------------|---------|
| `len` | `length` | `L _ > n` | List length | `len [1,2,3]` → `3` |
| `hd` | `head` | `L _ > _` | First element | `hd [1,2,3]` → `1` |
| `tl` | `tail` | `L _ > L _` | All elements except first | `tl [1,2,3]` → `[2,3]` |
| `at` | | `L _ n > _` | i-th element (0-indexed; negative counts from end; float `i` auto-floors) | `at [10,20,30] 1` → `20`; `at xs 1.7` floors to `at xs 1` |
| `rev` | `reverse` | `L _ > L _` | Reverse a list | `rev [1,2,3]` → `[3,2,1]` |
| `srt` | `sort` | `L _ > L _` | Sort a list | `srt [3,1,2]` → `[1,2,3]` |
| `srt` | `sort` | `fn L _ > L _` | Sort by key function | `srt cmp xs` |
| `slc` | `slice` | `L _ n n > L _` | Slice (start, end) | `slc [1,2,3,4] 1 3` → `[2,3]` |
| `flat` | `flatten` | `L L _ > L _` | Flatten nested lists | `flat [[1,2],[3]]` → `[1,2,3]` |
| `unq` | `unique` | `L _ > L _` | Remove duplicates | `unq [1,2,2,3]` → `[1,2,3]` |
| `has` | `contains` | `L _ _ > b` | Check if list contains element | `has [1,2,3] 2` → `true` |

## Higher-Order Functions

| Function | Alias | Signature | Description | Example |
|----------|-------|-----------|-------------|---------|
| `map` | | `fn L _ > L _` | Apply function to each element | `map dbl [1,2,3]` |
| `mapr` | | `fn L _ > R (L _) _` | Map with short-circuit Result propagation: collects Ok values, returns the first Err | `mapr num ["1","2","3"]` → `~[1,2,3]` |
| `flt` | `filter` | `fn L _ > L _` | Keep elements where function returns true | `flt pos [1,-2,3]` |
| `ct` | `count` | `fn L _ > n` | Count elements where predicate returns true. Predicate must return `b` (verifier error otherwise). Allocation-free vs `len (flt fn xs)`. | `ct pos [-1,2,-3,4]` → `2` |
| `fld` | `fold` | `fn _ L _ > _` | Reduce list to single value | `fld add 0 [1,2,3]` |
| `grp` | `group` | `fn L _ > M t L _` | Group elements by function result | `grp cat xs` |

## Aggregation

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `sum` | `L n > n` | Sum a list of numbers | `sum [1,2,3]` → `6` |
| `avg` | `L n > n` | Average of a list of numbers | `avg [2,4,6]` → `4` |
| `min` | `L n > n` | Minimum element of a numeric list (error if empty) | `min [3,1,4,1,5]` → `1` |
| `max` | `L n > n` | Maximum element of a numeric list (error if empty) | `max [3,1,4,1,5]` → `5` |
| `min` | `n n > n` | Minimum of two numbers | `min 3 7` → `3` |
| `max` | `n n > n` | Maximum of two numbers | `max 3 7` → `7` |
| `median` | `L n > n` | Median of a numeric list | `median [1,2,3,4,5]` → `3` |
| `stdev` | `L n > n` | Sample standard deviation (divides by N-1) | `stdev [2,4,4,4,5,5,7,9]` |
| `variance` | `L n > n` | Sample variance (divides by N-1) | `variance [...]` |

## Maps

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `mmap` | `> M` | Create empty map | `m=mmap` |
| `mget` | `M t > _` | Get value by key | `mget m "key"` |
| `mset` | `M t _ > M` | Set key-value pair | `mset m "key" val` |
| `mhas` | `M t > b` | Check if key exists | `mhas m "key"` |
| `mkeys` | `M > L t` | Get all keys | `mkeys m` |
| `mvals` | `M > L _` | Get all values | `mvals m` |
| `mdel` | `M t > M` | Remove key, return new map | `mdel m "key"` |

## Type Conversion

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `str` | `_ > t` | Convert to string | `str 42` → `"42"` |
| `num` | `t > n` | Parse string to number | `num "42"` → `42` |
| `abs` | `n > n` | Absolute value | `abs -5` → `5` |
| `flr` | `n > n` | Floor | `flr 3.7` → `3` |
| `cel` | `n > n` | Ceiling | `cel 3.2` → `4` |
| `rnd` | `n n > n` | Round to N decimal places | `rnd 3.14159 2` → `3.14` |

## I/O & HTTP

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `get` | `t > R t t` | HTTP GET (returns Result) | `get "https://..."` |
| `$` | `t > R t t` | HTTP GET shorthand (sugar for `get`) | `$"https://..."` |
| `post` | `t t > R t t` | HTTP POST (url, body) | `post url body` |
| `get` | `t M > R t t` | HTTP GET with headers | `get url headers` |
| `post` | `t t M > R t t` | HTTP POST with headers | `post url body headers` |
| `rd` | `t > R t t` | Read file | `rd "data.txt"` |
| `rd` | `t t > R t t` | Read file with format | `rd "data.csv" "csv"` |
| `wr` | `t t > R t t` | Write file (path, content) | `wr "out.txt" data` |
| `wr` | `t t t > R t t` | Write file with format | `wr "out.json" data "json"` |
| `env` | `t > R t t` | Read environment variable | `env "API_KEY"` |

> **Note:** `$` is syntactic sugar -`$url` compiles to `get url`. HTTP builtins (`get`, `$`, `post`) require the native binary; they are not available in the npm/WASM build.

## JSON

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `rdb` | `t t > R _ t` | Parse data (format: `"json"`, `"csv"`) | `rdb data "json"` |
| `jpth` | `t t > R t t` | Extract JSON path | `jpth data "users.0.name"` |
| `jdmp` | `_ > t` | Dump value as JSON string | `jdmp [1,2,3]` |
| `jpar` | `t > R _ t` | Parse JSON string to value | `jpar '{"a":1}'` |

## Output

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `prnt` | `_ > _` | Print value and return it | `prnt "hello"` |

## Time

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `now` | `> n` | Current Unix timestamp (seconds) | `now` |
| `sleep` | `n > _` | Pause current engine for `ms` milliseconds | `sleep 100` |
| `dtfmt` | `n t > R t t` | Format Unix epoch as text (strftime, UTC) | `dtfmt 1700000000 "%Y-%m-%d"` |
| `dtparse` | `t t > R n t` | Parse text to Unix epoch (strftime, UTC) | `dtparse "2024-01-15" "%Y-%m-%d"` |

## Auto-unwrap `!`

Any function returning `R` (Result) can be called with `!` to auto-unwrap:

```ilo
r=$url           -- r is R t t (Result)
v=$!url           -- v is t (auto-unwrapped, propagates error)
data=rdb! r "json"  -- auto-unwrap parse result
```

See [Error Handling](/docs/guide/error-handling/) for full details on `!`, `?`, `??`, and Result types.

## Dot-notation indexing

Access list elements and record fields with `.`:

```ilo
xs.0          -- first element of list xs
xs.2          -- third element
xs.i          -- i-th element when `i` is a bound variable in scope
user.name     -- field "name" of record/map
data.users.0  -- chained access
```

The variable-index form `xs.i` is sugar for `at xs i`. The parser builds a
field-access node and a post-parse desugar pass rewrites it whenever the
field identifier resolves to a binding in the current scope (parameter,
let, foreach, range, match-arm). If the identifier is also a declared
field on a record type, the rewrite is skipped and the strict `.field`
record-access semantics apply.

Safe navigation with `.?` returns `nil` instead of erroring on missing keys:

```ilo
user.?email   -- nil if "email" doesn't exist
```

## Builtin aliases

All builtins accept long-form names that resolve to the canonical short form. ilo will emit a hint suggesting the short form:

| Long form | Short form |
|-----------|------------|
| `length` | `len` |
| `head` | `hd` |
| `tail` | `tl` |
| `reverse` | `rev` |
| `sort` | `srt` |
| `slice` | `slc` |
| `unique` | `unq` |
| `filter` | `flt` |
| `count` | `ct` |
| `fold` | `fld` |
| `flatten` | `flat` |
| `concat` | `cat` |
| `contains` | `has` |
| `group` | `grp` |
| `average` | `avg` |
| `print` | `prnt` |
| `trim` | `trm` |
| `split` | `spl` |
| `format` | `fmt` |
| `regex` | `rgx` |
| `read` | `rd` |
| `write` | `wr` |
| `readbuf` | `rdb` |
| `floor` | `flr` |
| `ceil` | `cel` |
| `round` | `rnd` |
| `string` | `str` |
| `number` | `num` |
