---
title: Imports
description: Use this when splitting an ilo program across multiple files.
---

Use this when splitting an ilo program across multiple files.

Split programs across files with `use`:

```ilo
use "math-lib.ilo"
```

All declarations from the imported file merge into a flat namespace - no modules, no qualification.

## Full import

```ilo
-- math-lib.ilo
dbl n:n>n;*n 2
half n:n>n;/n 2
sq n:n>n;*n n
```

```ilo
-- main.ilo
use "math-lib.ilo"

round-trip n:n>n;h=half n;r=dbl h;+r 0
hyp-sq a:n b:n>n;sa=sq a;sb=sq b;+sa sb
```

```bash
ilo main.ilo round-trip 10
# -> 10

ilo main.ilo hyp-sq 3 4
# -> 25
```

## Scoped imports

Import only specific functions with a bracketed list:

```ilo
use "math-lib.ilo" [dbl sq]
```

Now only `dbl` and `sq` are available. `half` is not imported. Requesting a name that does not exist in the file is an error (`ILO-P019`).

## Re-exports

A file can re-export names it imported, making them available to any file that imports it:

```ilo
-- utils.ilo
use "math-lib.ilo" [dbl sq]
pub dbl sq       -- re-export these names
```

Any file using `utils.ilo` automatically gets `dbl` and `sq` without needing to import `math-lib.ilo` directly.

## Conditional imports

Import a file only when a condition is met at parse time (useful for platform-specific or feature-gated code):

```ilo
use "web.ilo" if wasm
use "native-http.ilo" if !wasm
```

The `if` condition is evaluated before type-checking; only the matching branch is resolved.

## Lazy loading

Prefix `lazy` to defer resolution until first call, reducing startup cost for large optional modules:

```ilo
lazy use "heavy-lib.ilo"
```

The module is loaded and type-checked on the first call to any of its functions, not at program start.

## Import rules

- Paths are **relative to the importing file's directory**
- `use` must appear at the **top of the file**, before any function definitions
- Imports are **transitive**: if `a.ilo` uses `b.ilo`, then `main.ilo` using `a.ilo` gets `b.ilo`'s declarations too
- **Circular imports** are detected and reported as an error (`ILO-P018`)
- All imported functions are **type-checked** as part of the full program
- `use` in inline mode (no file context) is an error (`ILO-P017`)

## Multi-file example

```ilo
-- validators.ilo
positive n:n>b;>n 0
in-range n:n lo:n hi:n>b;a=>=n lo;b=<=n hi;?a{true:b;false:false}
```

```ilo
-- app.ilo
use "validators.ilo" [positive in-range]

check-age age:n>t;?{positive age:?(in-range age 0 150){true:"valid";false:"out of range"};false:"negative"}
```
