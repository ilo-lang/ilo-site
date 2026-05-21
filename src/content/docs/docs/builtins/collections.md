---
title: Collections
description: Use this when working with lists, maps, or other collection operations.
---

Use this when working with lists, maps, or other collection operations.

## Lists

Lists use `L` followed by the element type: `L n` (list of numbers), `L t` (list of text). Elements are separated by spaces or commas. Variables and expressions work as elements.

```ilo
nums=[1 2 3 4 5]        -- L n (list of numbers)
words=["hi" "bye"]      -- L t (list of text)
w="world"
greet=["hi" w]          -- L t (variables work too)
args=["search" 10 true] -- L _ (mixed types)
```

### Operations

Built-in functions for working with lists:

```ilo
len nums        -- → 5
hd nums         -- → 1 (first element)
tl nums         -- → [2 3 4 5] (rest)
nums.2          -- → 3 (dot-notation, zero-indexed)
+=nums 6        -- → [1 2 3 4 5 6] (append)
rev nums        -- → [5 4 3 2 1] (reverse)
srt nums        -- → [1 2 3 4 5] (sort ascending)
rev(srt nums)   -- → [5 4 3 2 1] (sort descending)
```

#### `srt` / `sort` with key function

`srt` also accepts a key function for sort-by (`srt fn list`):

```ilo
neg x:n>n;-x                              -- negate a number
srt neg nums                              -- sort by negative → [5 4 3 1 1]

slen s:t>n;len s                          -- string length as key
srt slen ["banana" "fig" "apple" "kiwi"]  -- → [fig kiwi apple banana]
```

`rsrt` mirrors `srt` and also takes a key function for descending sort-by (`rsrt fn list`):

```ilo
slen s:t>n;len s                            -- string length as key
rsrt slen ["banana" "fig" "apple" "kiwi"]   -- → [banana apple kiwi fig]
```

Both `srt` and `rsrt` also accept a 3-arg `fn ctx list` form where `fn` takes `(elem, ctx)`. This is the cross-engine alternative when you want explicit state without forming a closure.

`srt` is **stable**: elements (or items with equal keys, for the key-function form) keep their relative input order. This matters when merging parallel streams sorted by a shared key — e.g. timeline events that share a timestamp keep their per-source ordering inside each tie group. The guarantee holds on every engine (tree, VM, Cranelift JIT, Cranelift AOT). `argsort` is also stable; `rsrt` mirrors `srt`'s stability.

Number functions that pair well with lists:

```ilo
flr 3.7         -- → 3 (floor)
cel 3.2         -- → 4 (ceiling)
rou 3.5         -- → 4 (round)
```

### Higher-order functions

Pass functions to `map`, `flt`, and `fld` to transform, filter, and reduce lists. Most builtins have a short and long form, both work: `flt` or `filter`, `fld` or `fold`, `srt` or `sort`, etc. See the full [alias table](/docs/builtins/numbers#aliases). The examples below use short forms inline and long forms in multiline.

#### `map`

`map fn list` applies `fn` to every element, returning a new list:

```ilo
dbl x:n>n;*x 2 main xs:L n>L n;map dbl xs  -- → [2 4 6 8 10]
```

Or as a file:

```ilo
double x:n > n           -- double a number
  *x 2                   -- multiply x by 2

main nums:L n > L n      -- map double over a list
  map double nums        -- → [2 4 6 8 10]
```

#### `flt` / `filter`

`flt fn list` keeps only elements where `fn` returns true:

```ilo
pos x:n>b;>x 0 main xs:L n>L n;flt pos xs  -- → [1 2 3 4 5]
```

Or as a file:

```ilo
positive x:n > b         -- is positive?
  > x 0                  -- x greater than 0

main nums:L n > L n      -- keep only positives
  filter positive nums   -- → [1 2 3 4 5]
```

#### `fld` / `fold`

`fld fn init list` reduces a list to a single value. Applies `fn` to an accumulator and each element left-to-right. Like `reduce` in JavaScript or `foldl` in Haskell:

```ilo
add a:n b:n>n;+a b main xs:L n>n;fld add 0 xs  -- → 15
```

Or as a file:

```ilo
add a:n b:n > n          -- add two numbers
  +a b                   -- return a + b

main nums:L n > n        -- sum via fold
  fold add 0 nums       -- → 15
```

#### `sum`

Shorthand for folding with addition:

```ilo
sum nums                 -- → 15
```

#### Inline lambdas

Instead of declaring a one-off helper, pass a function literal directly to any HOF:

```ilo
by-dist xs:L n>L n;srt (x:n>n;abs x) xs              -- sort by distance from zero
nonempty ws:L t>L t;flt (s:t>b;>(len s) 0) ws        -- keep non-empty strings
sumsq xs:L n>n;fld (a:n x:n>n;+a *x x) xs 0          -- sum of squares
```

Syntax is the same as a top-level function declaration, wrapped in parens, no name: `(<param>:<type> ...><return-type>;<body>)`. The body can capture variables from the enclosing scope:

```ilo
above xs:L n thr:n>L n;flt (x:n>b;>x thr) xs         -- captures `thr`
```

## Dot-notation indexing

Access elements by index (zero-based) using `.`. Works on lists and maps:

```ilo
xs.0            -- first element
xs.2            -- third element
data.users.0    -- chained access
```

Safe navigation with `.?` returns nil instead of erroring:

```ilo
user.?email     -- nil if "email" doesn't exist
```

## Iterating with `@`

`@` is ilo's loop construct. It iterates over a list or range, and returns the last iteration's value:

```ilo
sq-last xs:L n>n;@x xs{*x x}
```

```bash
ilo 'sq-last xs:L n>n;@x xs{*x x}' 3,4,5
# → 25  (last element 5, squared)
```

Use `@` with a range to loop over numbers:

```bash
ilo 'f>n;s=0;@i 0..5{s=+s i};s' f
# → 10  (sum of 0+1+2+3+4)
```

Use braces when the body has multiple statements:

```bash
ilo 'f>L n;xs=[];@i 0..3{xs=+=xs i};xs' f
# → [0, 1, 2]
```

## Slice, contains, and append

Common operations for working with lists and text:

### `slc` - slice a list or text

`slc xs a b` returns elements from index `a` up to (but not including) `b`:

```bash
ilo 'f xs:L n>L n;slc xs 1 3' 10,20,30,40
# → [20, 30]
```

Negative indices count from the end (Python-style); bounds clamp instead of wrapping. One ergonomic exception: when the start is non-negative and the end is exactly `-1`, the end is read as `len xs` (Python/JS "to end of list/text" sugar):

```bash
ilo 'f xs:L n>L n;slc xs 2 -1' 10,20,30,40   # "to end" sugar
# → [30, 40]

ilo 'f xs:L n>L n;slc xs 0 -1' 10,20,30,40   # full list (-1 = to end)
# → [10, 20, 30, 40]

ilo 'f xs:L n>L n;slc xs -2 (len xs)' 10,20,30,40   # keep last two
# → [30, 40]

ilo 'f xs:L n>L n;slc xs -3 -1' 10,20,30,40   # negative start: Python style
# → [20, 30]

ilo 'f xs:L n>L n;slc xs 0 -2' 10,20,30,40   # end -2 keeps Python style
# → [10, 20]
```

`at xs i`, `take n xs`, and `drop n xs` follow the same Python-style rule. To "drop the last element" use `take -1 xs` (the `slc xs 0 -1` shape was repurposed as the "to end" sugar above):

```bash
ilo 'f xs:L n>L n;take -1 xs' 10,20,30,40   # drop the last
# → [10, 20, 30]
```

`drop -1 xs` keeps only the last.

### `has` - contains check

`has xs v` tests membership. Works on lists (element check) and text (substring check):

```bash
ilo 'f xs:L n>b;has xs 3' 1,2,3,4
# → true

ilo 'f s:t>b;has s "llo"' "hello"
# → true
```

### `+=` - append to list

`+=xs v` appends an element to a list:

```bash
ilo 'f xs:L n>L n;+=xs 99' 1,2,3
# → [1, 2, 3, 99]
```

### `lst` - set element at index (list-set / `lset`)

`lst xs i v` returns a new list with index `i` replaced by `v`. This is the canonical list-update builtin: same role as `lset`, `setat`, or `set-at` in other languages, and exactly what you'd write `xs[i] = v` for in Python. `lset` is the long-form alias. Lists are immutable, so rebind the result:

```bash
ilo 'f xs:L n>L n;lst xs 1 99' 10,20,30
# → [10, 99, 30]
```

Negative indices count from the end (same convention as `at`/`slc`):

```bash
ilo 'f xs:L n>L n;lst xs -1 99' 10,20,30
# → [10, 20, 99]
```

Reach for `lst` whenever you'd reach for in-place index assignment in another language. For flat-array 2D grids, combine with stride arithmetic: `grid=lst grid (+(*r w) c) v`.

## Maps (`M k v`)

Maps are key-value collections, like dictionaries in Python or objects in JavaScript. Keys are typed: text (`t`) or integer (`n`). `Int(1)` and `Text("1")` are distinct, so a numeric index map and a string-keyed map can't accidentally collide. Maps are immutable: `mset` and `mdel` return new maps rather than modifying in place.

```ilo
idx=mmap
idx=mset idx 7 "seven"     -- integer key, no str conversion
mget idx 7                 -- → "seven"
mhas idx "7"               -- → false (Int and Text are distinct)
```

### Creating maps with `mmap` and `mset`

```ilo
scores>n
  m=mmap
  m=mset m "alice" 99
  m=mset m "bob" 87
  mget m "alice"
```

```bash
ilo 'scores>n;m=mmap;m=mset m "alice" 99;m=mset m "bob" 87;mget m "alice"' scores
# → 99
```

### Map builtins

| Call | Returns | Meaning |
|------|---------|---------|
| `mmap` | `M t _` | create empty map |
| `mset m k v` | `M k v` | new map with key set |
| `mget m k` | value or nil | value at key |
| `mget-or m k default` | `v` | value at key, or `default` if missing |
| `mhas m k` | `b` | key exists? |
| `mkeys m` | `L t` | sorted list of keys |
| `mvals m` | `L v` | values sorted by key |
| `mdel m k` | `M k v` | new map without key |
| `len m` | `n` | number of entries |

### Checking keys with `mhas`

```bash
ilo 'check>b;m=mset mmap "x" "1";mhas m "x"' check
# → true
```

## Aggregation

Functions that reduce a collection to a single value:

### `sum`, `prod`, and `avg`

```bash
ilo 'f xs:L n>n;sum xs' 1,2,3,4,5
# → 15

ilo 'f xs:L n>n;prod xs' 1,2,3,4,5
# → 120

ilo 'f xs:L n>n;avg xs' 2,4,6
# → 4
```

`sum []` returns 0 (additive identity). `prod []` returns 1 (multiplicative identity).

### `cumsum` and `cprod`

Running (prefix) accumulations over a numeric list:

```bash
ilo 'f>L n;cumsum [1,2,3,4]' f
# → [1, 3, 6, 10]

ilo 'f>L n;cprod [1,2,3,4]' f
# → [1, 2, 6, 24]
```

Output length always matches input length. Empty input returns `[]`.

### `ewm` - exponential moving average

`ewm xs a > L n` smooths a numeric list with the IIR recurrence
`ewm[0] = xs[0]`, `ewm[i] = a*xs[i] + (1-a)*ewm[i-1]`. The smoothing factor
`a` must lie in `[0, 1]`; out-of-range values raise `ILO-R009` at runtime.

```bash
ilo 'f>L n;ewm [1,2,3,4,5] 0.5' f
# → [1, 1.5, 2.25, 3.125, 4.0625]
```

Boundary cases: `a=0` freezes at `xs[0]` (constant output); `a=1` reproduces
`xs` exactly. Empty input returns `[]`; a single-element list passes through
unchanged regardless of `a`. Replaces the fold-with-running-state pattern in
one call.

### `where` - parallel-list conditional select

`where cond xs ys > L a` is the NumPy `np.where` equivalent: for each `i`,
`output[i] = xs[i] if cond[i] else ys[i]`. All three lists must be the same
length; a mismatch raises `ILO-R009` at runtime. The element type of `xs` /
`ys` is preserved in the output.

```bash
ilo 'f>L n;where [true, false, true] [1, 2, 3] [10, 20, 30]' f
# → [1, 20, 3]
```

Replaces the
`map (i:n>_;?h (at cond i) (at xs i) (at ys i)) (range 0 (len xs))` recipe in
one call. Empty input returns `[]`. Works for any element type: lists of
numbers, text, or any other ilo value type are all supported as long as
`xs` and `ys` share the same element type.

### `grp` - group by key function

`grp fn xs` groups a list by a key function, returning `M t (L a)`:

```ilo
cl x:n>t;>x 5{"big"}{"small"}
classify xs:L n>M t L n;grp cl xs
```

```bash
ilo 'cl x:n>t;>x 5{"big"}{"small"} classify xs:L n>M t L n;grp cl xs' classify 1,3,7,10,2
# → {big: [7, 10], small: [1, 3, 2]}
```

### `flat` - flatten nested lists

Flattens one level of nesting:

```bash
ilo 'f>L n;flat [[1, 2], [3], [4, 5]]' f
# → [1, 2, 3, 4, 5]
```

### `unq` - deduplicate

Removes duplicates while preserving order:

```bash
ilo 'f xs:L t>L t;unq xs' a,b,a,c,b
# → [a, b, c]
```

## Function reference

| Function | Alias | Signature | Description |
|----------|-------|-----------|-------------|
| `len` | `length` | `L _ > n` | List length |
| `hd` | `head` | `L _ > _` | First element |
| `tl` | `tail` | `L _ > L _` | All elements except first |
| `at` | | `L _ n > _` | i-th element (0-indexed; negative counts from end; float `i` auto-floors) |
| `lget-or` | | `L a n a > a` | element at index `i`, or `default` if out of range (negative indices like `at`; never errors on OOB) |
| `lst` | `lset` | `L a n a > L a` | list-set: new list with index `i` replaced by `v` (same role as `lset`/`setat` in other languages; rebind because lists are immutable) |
| `rev` | `reverse` | `L _ > L _` | Reverse a list |
| `srt` | `sort` | `L _ > L _` | Sort a list |
| `srt` | `sort` | `fn L _ > L _` | Sort by key function |
| `rsrt` | | `L _ > L _` | Sort a list descending |
| `rsrt` | | `fn L _ > L _` | Sort descending by key function |
| `slc` | `slice` | `L _ n n > L _` | Slice (start, end) |
| `flat` | `flatten` | `L L _ > L _` | Flatten one level of nesting |
| `unq` | `unique` | `L _ > L _` | Remove duplicates |
| `has` | `contains` | `L _ _ > b` | Membership |
| `map` | | `fn L _ > L _` | Apply function to each element |
| `mapr` | | `fn L _ > R (L _) _` | Map with short-circuit Result propagation: collects Ok values, returns the first Err |
| `default-on-err` | | `R T E T > T` | Unwrap `R T E` to `T`, returning the default if Err. Mirror of `??` for Result (`??` is nil-coalesce for `O T` only). Prefer over `?r{~v:v;^_:d}` when the error payload is unused. |
| `flt` | `filter` | `fn L _ > L _` | Keep elements where function returns true |
| `ct` | `count` | `fn L _ > n` | Count elements where predicate returns true. Allocation-free vs `len (flt fn xs)`. |
| `fld` | `fold` | `fn _ L _ > _` | Reduce list to single value |
| `grp` | `group` | `fn L _ > M t L _` | Group elements by function result |
| `mmap` | | `> M` | Create empty map |
| `mget` | | `M t > _` | Get value by key |
| `mset` | | `M t _ > M` | Set key-value pair |
| `mhas` | | `M t > b` | Check if key exists |
| `mkeys` | | `M > L t` | Get all keys |
| `mvals` | | `M > L _` | Get all values |
| `mdel` | | `M t > M` | Remove key, return new map |

### Variable-index dot-notation

The variable-index form `xs.i` is sugar for `at xs i`. The parser builds a field-access node and a post-parse desugar pass rewrites it whenever the field identifier resolves to a binding in the current scope (parameter, let, foreach, range, match-arm). If the identifier is also a declared field on a record type, the rewrite is skipped and the strict `.field` record-access semantics apply.

## See also

- [Text](/docs/builtins/text/) for string operations (`trm`, `spl`, `fmt`, `cat`, `rgx`)
- [Numbers](/docs/builtins/numbers/) for numeric aggregation (`min`, `max`, `median`, `stdev`)
