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
| `cat` | `L t t > t` | Join list of text with separator | `cat ["a","b","c"] ","` → `"a,b,c"` |
| `len` | `t > n` | String length (bytes) | `len "hello"` → `5` |
| `trm` | `t > t` | Trim whitespace | `trm " hi "` → `"hi"` |
| `spl` | `t t > L t` | Split string by delimiter | `spl "a,b,c" ","` → `["a","b","c"]` |
| `has` | `t t > b` | Check if string contains substring | `has "hello" "ell"` → `true` |
| `chars` | `t > L t` | Explode into single-char strings | `chars "hi"` → `["h","i"]` |
| `ord` | `t > n` | Unicode codepoint of first char | `ord "A"` → `65` |
| `chr` | `n > t` | Single-char string for codepoint | `chr 65` → `"A"` |
| `upr` | `t > t` | Uppercase (ASCII) | `upr "abc"` → `"ABC"` |
| `lwr` | `t > t` | Lowercase (ASCII) | `lwr "ABC"` → `"abc"` |
| `cap` | `t > t` | Capitalise first char | `cap "abc"` → `"Abc"` |
| `padl` | `t n > t` | Left-pad to width | `padl "7" 3` → `"  7"` |
| `padr` | `t n > t` | Right-pad to width | `padr "7" 3` → `"7  "` |
| `rgx` | `t t > L t` | Regex: no groups→all matches; groups→first match captures | `rgx "[0-9]+" "abc123"` → `["123"]` |
| `rgxall` | `t t > L (L t)` | Every regex match as a list of captures | `rgxall "[0-9]+" "1 2 3"` |
| `rgxsub` | `t t t > t` | Regex substitute all matches | `rgxsub "[0-9]+" "#" "a1b2"` → `"a#b#"` |
| `fmt` | `t ... > t` | Format string, `{}` placeholders | `fmt "{} is {}" "sky" "blue"` |
| `fmt2` | `t ... > t` | Format with `{:fmt}` spec strings | `fmt2 "{:.2}" 3.14159` → `"3.14"` |

## Collections (Lists)

| Function | Alias | Signature | Description | Example |
|----------|-------|-----------|-------------|---------|
| `len` | `length` | `L _ > n` | List length | `len [1,2,3]` → `3` |
| `hd` | `head` | `L _ > _` | First element | `hd [1,2,3]` → `1` |
| `tl` | `tail` | `L _ > L _` | All elements except first | `tl [1,2,3]` → `[2,3]` |
| `rev` | `reverse` | `L _ > L _` | Reverse a list | `rev [1,2,3]` → `[3,2,1]` |
| `srt` | `sort` | `L _ > L _` | Sort a list | `srt [3,1,2]` → `[1,2,3]` |
| `srt` | `sort` | `fn L _ > L _` | Sort by key function | `srt cmp xs` |
| `rsrt` | | `L _ > L _` | Sort descending | `rsrt [1,3,2]` → `[3,2,1]` |
| `slc` | `slice` | `L _ n n > L _` | Slice (start, end); negative indices count from end, bounds clamp | `slc [1,2,3,4] -2 4` → `[3,4]` |
| `at` | | `L _ n > _` | Index (0-based; negative counts from end) | `at [1,2,3] -1` → `3` |
| `lst` | `lset` | `L _ n _ > L _` | Update at index (returns new list) | `lst [1,2,3] 0 9` → `[9,2,3]` |
| `take` | | `n L _ > L _` | First `n` elements (n<0: all but last `abs n`) | `take 2 [1,2,3]` → `[1,2]` |
| `drop` | | `n L _ > L _` | Drop first `n` (n<0: keep only last `abs n`) | `drop -1 [1,2,3]` → `[3]` |
| `flat` | `flatten` | `L L _ > L _` | Flatten nested lists | `flat [[1,2],[3]]` → `[1,2,3]` |
| `unq` | `unique` | `L _ > L _` | Remove duplicates | `unq [1,2,2,3]` → `[1,2,3]` |
| `uniqby` | | `fn L _ > L _` | Dedupe by key function | `uniqby fst xs` |
| `zip` | | `L _ L _ > L (L _)` | Pairwise zip | `zip [1,2] ["a","b"]` → `[[1,"a"],[2,"b"]]` |
| `enumerate` | | `L _ > L (L _)` | Pair each element with index | `enumerate ["a","b"]` → `[[0,"a"],[1,"b"]]` |
| `range` | | `n n > L n` | Half-open range `[a, b)` | `range 0 3` → `[0,1,2]` |
| `chunks` | | `n L _ > L (L _)` | Non-overlapping chunks | `chunks 2 [1,2,3,4]` → `[[1,2],[3,4]]` |
| `window` | | `n L _ > L (L _)` | Sliding windows | `window 2 [1,2,3]` → `[[1,2],[2,3]]` |
| `cumsum` | | `L n > L n` | Running sum | `cumsum [1,2,3]` → `[1,3,6]` |
| `frq` | | `L _ > M _ n` | Frequency map | `frq ["a","a","b"]` → `{"a":2,"b":1}` |
| `has` | `contains` | `L _ _ > b` | Check if list contains element | `has [1,2,3] 2` → `true` |

## Higher-Order Functions

| Function | Alias | Signature | Description | Example |
|----------|-------|-----------|-------------|---------|
| `map` | | `fn L _ > L _` | Apply function to each element | `map dbl [1,2,3]` |
| `flt` | `filter` | `fn L _ > L _` | Keep elements where function returns true | `flt pos [1,-2,3]` |
| `fld` | `fold` | `fn L _ _ > _` | Left fold: reduce list to single value | `fld add xs 0` |
| `grp` | `group` | `fn L _ > M _ L _` | Group elements by function result | `grp cat xs` |
| `flatmap` | | `fn L _ > L _` | Map then flatten one level | `flatmap pair xs` |
| `partition` | | `fn L _ > L (L _)` | Split into `[passing, failing]` by predicate | `partition pos xs` → `[[1,2],[-1]]` |

### Inline lambdas

Pass a function literal directly to a HOF instead of declaring a one-off helper:

```ilo
by-dist xs:L n>L n;srt (x:n>n;abs x) xs
nonempty ws:L t>L t;flt (s:t>b;>(len s) 0) ws
sumsq xs:L n>n;fld (a:n x:n>n;+a *x x) xs 0
```

Syntax: `(<param>:<type> ...><return-type>;<body>)`. The lambda body can reference variables from the enclosing scope (closure capture).

## Aggregation and Statistics

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `sum` | `L n > n` | Sum a list of numbers | `sum [1,2,3]` → `6` |
| `avg` | `L n > n` | Mean of a list of numbers | `avg [2,4,6]` → `4` |
| `median` | `L n > n` | Median | `median [1,2,3]` → `2` |
| `quantile` | `L n n > n` | Sample quantile (p clamped to [0,1]) | `quantile xs 0.5` |
| `stdev` | `L n > n` | Sample standard deviation (N-1) | `stdev xs` |
| `variance` | `L n > n` | Sample variance (N-1) | `variance xs` |

## Sets

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `setunion` | `L _ L _ > L _` | Set union (deduped, sorted) | `setunion [1,2] [2,3]` → `[1,2,3]` |
| `setinter` | `L _ L _ > L _` | Set intersection | `setinter [1,2] [2,3]` → `[2]` |
| `setdiff` | `L _ L _ > L _` | Set difference `a - b` | `setdiff [1,2,3] [2]` → `[1,3]` |

## Linear Algebra

Row-major matrices (`L (L n)`) and flat vectors (`L n`).

| Function | Signature | Description |
|----------|-----------|-------------|
| `transpose` | `L (L n) > L (L n)` | Transpose matrix |
| `matmul` | `L (L n) L (L n) > L (L n)` | Matrix product |
| `dot` | `L n L n > n` | Vector dot product |
| `solve` | `L (L n) L n > L n` | Solve `Ax = b` (LU with partial pivoting) |
| `inv` | `L (L n) > L (L n)` | Matrix inverse |
| `det` | `L (L n) > n` | Determinant |
| `fft` | `L n > L (L n)` | Discrete FFT (real samples → `[re, im]` pairs) |
| `ifft` | `L (L n) > L n` | Inverse FFT |

## Maps

Keys are typed: text (`t`) or integer (`n`). `Int(1)` and `Text("1")` are distinct keys. Float keys floor to integer at the builtin boundary.

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `mmap` | `> M` | Create empty map | `m=mmap` |
| `mget` | `M k > _` | Get value by key (nil if missing) | `mget m "key"` or `mget m 7` |
| `mset` | `M k _ > M` | Set key-value pair | `mset m 7 val` |
| `mhas` | `M k > b` | Check if key exists | `mhas m "key"` |
| `mkeys` | `M > L k` | Get all keys (sorted) | `mkeys m` |
| `mvals` | `M > L _` | Get all values (sorted by key) | `mvals m` |
| `mdel` | `M k > M` | Remove key, return new map | `mdel m "key"` |

```ilo
idx=mmap
idx=mset idx 7 "seven"     -- integer key, no str conversion
mget idx 7                 -- → "seven"
mhas idx "7"               -- → false (Int and Text are distinct)
```

`jdmp` stringifies numeric keys for JSON output (JSON object keys are always strings).

## Math and Type Conversion

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `str` | `_ > t` | Convert to string | `str 42` → `"42"` |
| `num` | `t > R n t` | Parse string to number | `num "42"` → `~42` |
| `abs` | `n > n` | Absolute value | `abs -5` → `5` |
| `min` | `n n > n` | Minimum of two numbers | `min 3 5` → `3` |
| `max` | `n n > n` | Maximum of two numbers | `max 3 5` → `5` |
| `mod` | `n n > n` | Remainder (errors on zero divisor) | `mod 10 3` → `1` |
| `clamp` | `n n n > n` | Restrict `x` to `[lo, hi]` | `clamp 7 0 5` → `5` |
| `flr` | `n > n` | Floor | `flr 3.7` → `3` |
| `cel` | `n > n` | Ceiling | `cel 3.2` → `4` |
| `rou` | `n > n` | Round to nearest int (banker's) | `rou 3.5` → `4` |
| `rnd` | `> n` / `n n > n` | Random float [0,1) or random int [a,b] | `rnd 1 10` |
| `rndn` | `n n > n` | Normal-distribution sample (mu, sigma) | `rndn 0 1` |
| `pow` | `n n > n` | Power | `pow 2 10` → `1024` |
| `sqrt` | `n > n` | Square root | `sqrt 9` → `3` |
| `exp` | `n > n` | Natural exponent `e^n` | `exp 1` → `2.718…` |
| `log` | `n > n` | Natural log | `log 2.718` → `~1` |
| `log10` | `n > n` | Base-10 log | `log10 100` → `2` |
| `log2` | `n > n` | Base-2 log | `log2 8` → `3` |
| `sin` / `cos` / `tan` | `n > n` | Trig (radians) | `sin 0` → `0` |
| `atan2` | `n n > n` | Two-arg arctangent (y, x) | `atan2 1 1` |

## I/O & HTTP

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `get` | `t > R t t` | HTTP GET (returns Result) | `get "https://..."` |
| `$` | `t > R t t` | HTTP GET shorthand (sugar for `get`) | `$"https://..."` |
| `post` | `t t > R t t` | HTTP POST (url, body) | `post url body` |
| `get` | `t M > R t t` | HTTP GET with headers | `get url headers` |
| `post` | `t t M > R t t` | HTTP POST with headers | `post url body headers` |
| `get-many` | `L t > L (R t t)` | Concurrent GET fan-out (max 10 parallel) | `get-many urls` |
| `rd` | `t > R _ t` | Read file (format auto-detected from extension) | `rd "data.txt"` |
| `rd` | `t t > R _ t` | Read file with explicit format | `rd "data.csv" "csv"` |
| `rdl` | `t > R (L t) t` | Read file as list of lines | `rdl "data.txt"` |
| `rdjl` | `t > L (R _ t)` | Read JSONL file (one parse result per line) | `rdjl "events.jsonl"` |
| `rdb` | `t t > R _ t` | Parse string/buffer in given format | `rdb resp "json"` |
| `wr` | `t t > R t t` | Write text to file | `wr "out.txt" data` |
| `wr` | `t _ t > R t t` | Write with format (`"csv"`, `"tsv"`, `"json"`) | `wr "out.json" data "json"` |
| `wrl` | `t L t > R t t` | Write list of lines (joins with `\n`) | `wrl "out.txt" lines` |
| `env` | `t > R t t` | Read environment variable | `env "API_KEY"` |
| `sleep` | `n > _` | Pause for `ms` milliseconds | `sleep 100` |

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
| `sleep` | `n > _` | Pause for `ms` milliseconds | `sleep 100` |
| `dtfmt` | `n t > R t t` | Format Unix epoch as text (strftime, UTC) | `dtfmt 1700000000 "%Y-%m-%d"` → `~"2023-11-14"` |
| `dtparse` | `t t > R n t` | Parse text to Unix epoch (strftime, UTC) | `dtparse "2024-01-15" "%Y-%m-%d"` |

## Auto-unwrap `!` and Panic-unwrap `!!`

Any function returning `R` (Result) or `O` (Optional) can be called with `!` to auto-unwrap. On error, `!` propagates `^e` to the caller (requires the enclosing function to also return `R`/`O`):

```ilo
r=$url           -- r is R t t (Result)
v=$!url           -- v is t (auto-unwrapped, propagates error)
data=rdb! r "json"  -- auto-unwrap parse result
```

`!!` is the same shape, but on error it aborts the program with a runtime diagnostic and exit 1 — no constraint on the enclosing return type. Use it from `main` and one-shot scripts where there is nowhere sensible to propagate to:

```ilo
main>t;xs=rdl!! "input.txt";cat xs "\n"   -- read file, abort with diagnostic if missing
main>n;num!! "42"                            -- parse number, abort on parse error
```

See [Error Handling](/docs/guide/error-handling/) for full details on `!`, `!!`, `?`, `??`, and Result types.

## Dot-notation indexing

Access list elements and record fields with `.`:

```ilo
xs.0          -- first element of list xs
xs.2          -- third element
user.name     -- field "name" of record/map
data.users.0  -- chained access
```

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
