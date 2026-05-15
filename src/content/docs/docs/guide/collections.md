---
title: Collections
description: Lists, maps, and data operations
---

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

Number functions that pair well with lists:

```ilo
flr 3.7         -- → 3 (floor)
cel 3.2         -- → 4 (ceiling)
rou 3.5         -- → 4 (round)
```

### Higher-order functions

Pass functions to `map`, `flt`, and `fld` to transform, filter, and reduce lists. Most builtins have a short and long form, both work: `flt` or `filter`, `fld` or `fold`, `srt` or `sort`, etc. See the full [alias table](/docs/reference/builtins#builtin-aliases). The examples below use short forms inline and long forms in multiline.

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

Negative indices count from the end (Python-style); bounds clamp instead of wrapping:

```bash
ilo 'f xs:L n>L n;slc xs 0 -1' 10,20,30,40   # drop the last
# → [10, 20, 30]

ilo 'f xs:L n>L n;slc xs -2 (len xs)' 10,20,30,40   # keep last two
# → [30, 40]
```

`at xs i`, `take n xs`, and `drop n xs` follow the same rule. `take -1 xs` keeps all but the last element; `drop -1 xs` keeps only the last.

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

### `sum` and `avg`

```bash
ilo 'f xs:L n>n;sum xs' 1,2,3,4,5
# → 15

ilo 'f xs:L n>n;avg xs' 2,4,6
# → 4
```

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

## String builtins

Built-in functions for text manipulation:

| Call | Meaning |
|------|---------|
| `trm s` | trim leading and trailing whitespace |
| `spl s sep` | split text by separator |
| `fmt tmpl args...` | format string with `{}` placeholders |
| `cat xs sep` | join list of text with separator |

### `trm` - trim whitespace

```bash
ilo 'f s:t>t;trm s' "  hello  "
# → hello
```

### `spl` - split text

```bash
ilo 'f s:t>L t;spl s ","' "a,b,c"
# → [a, b, c]
```

### `fmt` - format strings

`{}` placeholders are filled left-to-right:

```bash
ilo 'f>t;fmt "{} + {} = {}" 1 2 3' f
# → 1 + 2 = 3
```

### `cat` - join list with separator

```bash
ilo 'f xs:L t>t;cat xs ", "' a,b,c
# → a, b, c
```

### `rgx` - regex extract

`rgx pat s` extracts all matches of a regex pattern from a string. Without capture groups it returns all matches; with groups it returns the first match's captures:

```bash
ilo 'f s:t>L t;rgx "\\d+" s' "abc 123 def 456"
# → [123, 456]
```
