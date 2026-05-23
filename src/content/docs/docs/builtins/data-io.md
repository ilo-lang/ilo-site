---
title: Data & I/O
description: Use this when reading or writing files, parsing CSV/JSON, or accessing environment variables.
---

Use this when reading or writing files, parsing CSV/JSON, or accessing environment variables. For network I/O see [HTTP](/docs/builtins/http/).

ilo has built-in support for reading and writing files and accessing environment variables. All I/O builtins return `R` (Result) types, use `!` to auto-unwrap.

## Reading files

`rd path` reads a file with format auto-detected from the extension:

| Extension | Returns |
|-----------|---------|
| `.csv` | `R _ t` -- list of lists (grid) |
| `.tsv` | `R _ t` -- list of lists (grid) |
| `.json` | `R _ t` -- parsed JSON value |
| other | `R _ t` -- raw text string |

```ilo
load p:t>R _ t;rd p
```

Force a specific format with a second argument:

```ilo
load p:t>R _ t;rd p "json"
```

### Reading lines

`rdl path` reads a file as a list of lines:

```ilo
lines p:t>R L t t;rdl p
```

### Parsing buffers

`rdb string format` parses a string in a given format - useful for data received from HTTP responses:

```ilo
parse s:t>R _ t;rdb s "json"
```

### Listing directories

`lsd dir` returns the entries of `dir` (filenames only, not full paths), sorted lexicographically. Both file and directory entries are included. Missing directories surface as `Err`; empty directories return `[]`, not `Err`.

Renamed from `ls` in 0.12.1 so the natural `ls=rdl! p` binding for "lines" stays free for user code.

```ilo
entries d:t>R (L t) t;lsd d
```

### Recursive walk

`walk dir` does a depth-first traversal of `dir` and returns every path it finds relative to `dir`, sorted. Symlinks are not followed (matches the safer of the two `find` defaults and avoids the cycle trap that bites recursive globs in symlinked trees).

Unreadable subdirectories (most commonly permission-denied: sandbox roots, sibling-user homes, `/var/db` on macOS) are silently skipped. The locked dir's own entry is still in the result; just its contents are not enumerated. This means `walk /` or `walk ~/` produce useful output instead of aborting on the first locked sibling. An unreadable *root* still returns `Err`, so "starting point unreadable" is distinguishable from "some descendant unreadable".

```ilo
all p:t>R (L t) t;walk p
```

### Glob

`glob dir pat` returns the paths under `dir` (relative, sorted) that match a shell-style pattern. `*`/`?`/`[abc]` match within a single path segment; `**` matches any number of nested segments (including zero), so `**/*.ilo` finds every `.ilo` file in the tree, including ones in `dir` itself. No matches returns `[]`, not `Err`. Shares `walk`'s traversal, so unreadable subdirectories are skipped silently here too.

```ilo
ilo-files d:t>R (L t) t;glob d "**/*.ilo"
csv-here d:t>R (L t) t;glob d "*.csv"
```

### File metadata

Four atomic primitives sit alongside the directory enumerators. The shape is deliberately not one fat `stat` map: agents that want the size pay the size cost, agents that want a predicate pay the predicate cost, and the natural one-liners stay one token wide.

- `fsize path > R n t` returns the file size in bytes. `Err` on missing, permission-denied, or path-is-directory.
- `mtime path > R n t` returns the last modification time as Unix epoch seconds (`f64`, fractional preserved). `Err` on missing or permission-denied. Pairs with `now` for "is this file older than N seconds" checks.
- `isfile path > b` returns `true` iff `path` resolves to a regular file. Missing, permission-denied, and non-file all collapse to `false`.
- `isdir path > b` returns `true` iff `path` resolves to a directory. Same `false`-on-failure collapse as `isfile`.

The asymmetry between size/mtime (`R n t`) and the predicates (`b`) is deliberate. Predicates almost always feed into a single-token branch (`?isfile p{...}`), so collapsing the error tier into `false` is the right ergonomic — Python uses the same convention for `os.path.isfile`. Size and mtime callers usually want to distinguish "missing" from "permission-denied" from "this is a directory, not a file", so the error tier stays exposed.

All four follow symlinks (POSIX `stat`, not `lstat`). Metadata calls are leaf queries where "what does this path resolve to?" is almost always the question; `walk` and `glob` are the place where symlink-following needs to be off (for cycle safety).

```ilo
sz p:t>R n t;fsize p
isnew p:t>b;t=mtime! p;d=-(now)t;<d 3600.0   -- modified in the last hour
kind p:t>t;f=isfile p;d=isdir p;?f{true:"file";false:?d{true:"dir";false:"other"}}
```

A common composition pattern is filtering `walk` output to keep only regular files:

```ilo
files d:t>L t;xs=walk! d;flt (p:t>b;isfile cat [d "/" p] "") xs
```

### Path manipulation

`dirname`, `basename`, and `pathjoin` are pure-text path operations. No I/O, no Result wrapper, total on all inputs. Unix forward-slash semantics; Windows backslash handling is a 0.13.0 concern.

`dirname path` returns the POSIX parent directory:

- `dirname "/a/b/c.txt"` → `"/a/b"`
- `dirname "/"` → `"/"` (root is its own parent, POSIX)
- `dirname "/a"` → `"/"` (single-component absolute path)
- `dirname "foo.txt"` → `""` (no directory component; POSIX returns `"."` here, ilo returns `""` so the cat round-trip below stays clean)
- `dirname "foo/"` → `""` (trailing slash stripped, no directory component remains)
- `dirname ""` → `""`

`basename path` returns the POSIX final path segment:

- `basename "/a/b/c.txt"` → `"c.txt"`
- `basename "/"` → `"/"` (root is its own basename, POSIX edge)
- `basename "foo/"` → `"foo"` (trailing slash stripped first)
- `basename ""` → `""`

`pathjoin parts` joins a list of segments with `/`, collapsing duplicate separators at joints and dropping empty segments. The list form (not variadic) avoids the arity-inference trap that `fmt`'s variadic shape lives with:

- `pathjoin ["a" "b" "c.txt"]` → `"a/b/c.txt"`
- `pathjoin ["a/" "/b/" "c.txt"]` → `"a/b/c.txt"` (joint slashes deduped)
- `pathjoin []` → `""`
- `pathjoin ["foo"]` → `"foo"`
- `pathjoin ["/" "a"]` → `"/a"` (leading absolute root preserved)
- `pathjoin ["" "a" ""]` → `"a"` (empty segments dropped)

Round-trip:

```ilo
-- Split a path and rejoin it; the result equals the original.
roundtrip p:t>t;pathjoin [dirname p basename p]
```

## Writing files

`wr path data` writes data to a file. Format can be specified as a third argument:

```ilo
save>R t t;wr "out.txt" "hello world"
```

Structured output with format:

```ilo
csv>R t t;wr "out.csv" [[1,2],[3,4]] "csv"
json>R t t;wr "data.json" [1,2,3] "json"
```

## Environment variables

`env key` reads an environment variable, returning `R t t`:

```ilo
home>R t t;env "HOME"
```

Auto-unwrap with `!`:

```ilo
home>t;env! "HOME"
```

`.env` and `.env.local` files in the working directory are loaded automatically.

## JSON

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `rdb` | `t t > R _ t` | Parse data (format: `"json"`, `"csv"`) | `rdb data "json"` |
| `jpth` | `t t > R _ t` | Extract JSON path; Ok variant is the typed leaf (number→`n`, string→`t`, array→`L _`, object→record) | `jpth data "users.0.name"` |
| `jdmp` | `_ > t` | Dump value as JSON string | `jdmp [1,2,3]` |
| `jpar` | `t > R _ t` | Parse JSON string to value | `jpar '{"a":1}'` |
| `jpar!` | `t > _` | Parse JSON and auto-unwrap the Result. Inside an `R`-returning function, Err propagates to the caller; otherwise use `jpar!!` to panic on parse error. | `r=jpar! body;r.name` |
| `jpar-list` | `t > R (L _) t` | Parse JSON string, assert top-level is array | `@x (jpar-list! body){...}` |

## Time

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `now` | `> n` | Current Unix timestamp (seconds) | `now` |
| `sleep` | `n > _` | Pause current engine for `ms` milliseconds | `sleep 100` |
| `dtfmt` | `n t > R t t` | Format Unix epoch as text (strftime, UTC) | `dtfmt 1700000000 "%Y-%m-%d"` |
| `dtparse` | `t t > R n t` | Parse text to Unix epoch (strftime, UTC) | `dtparse "2024-01-15" "%Y-%m-%d"` |
| `dtparse-rel` | `t n > R n t` | Resolve relative-date phrase to epoch anchored at `now` (today/yesterday/tomorrow, `N days/weeks/months ago`, `in N days/weeks/months`, `last/next/this <weekday>`, ISO-8601 passthrough) | `dtparse-rel "last friday" (now)` |
| `dur-parse` | `t > R n t` | Parse human duration string into seconds. Accepts `s`/`m`/`h`/`d`/`w` abbreviations and full names (singular + plural), decimal quantities, mixed sequences. Months are **not** supported (variable length); use explicit day counts. A leading `-` is sticky — it applies to every following token until an explicit `+` resets it, so `"-1m 30s"` = `-90`. | `dur-parse "1.5 hours"` |
| `dur-fmt` | `n > t` | Format seconds as human-readable duration. Drops zero parts, uses largest units, preserves fractional seconds (up to 3 dp, trailing zeros stripped). Negative values get a single leading `-` which round-trips through `dur-parse`. | `dur-fmt 9720` → `"2h 42m"` |
| `add-mo` | `n n > n` | Add N calendar months to epoch, snapping to last valid day (Jan 31 + 1 = Feb 28/29). N may be negative. Returns epoch at 00:00 UTC. | `add-mo 1706659200 1` → `1709164800` |
| `last-dom` | `n > n` | Epoch of the last day of the month containing `dt`, at 00:00 UTC. | `last-dom 1707955200` → `1709164800` (Feb 29 2024) |
| `next-business-day` | `n > n` | Next weekday after `dt` (Fri→Mon, Sat→Mon, Sun→Mon, Mon-Thu→+1d). Returns 00:00 UTC. | `next-business-day 1705622400` → `1705881600` |
| `day-of-week` | `n > n` | Day of week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat. | `day-of-week 1705276800` → `1` (Monday) |
| `tz-offset` | `t n > R n t` | UTC offset in seconds for a named IANA timezone at a given Unix epoch. DST-aware (chrono-tz). Positive = east of UTC. `Err` on unknown timezone name. | `tz-offset "Europe/London" 1719792000` → `3600` (BST) |

## Auto-unwrap `!`

Any function returning `R` (Result) can be called with `!` to auto-unwrap:

```ilo
r=$url              -- r is R t t (Result)
v=$!url             -- v is t (auto-unwrapped, propagates error)
data=rdb! r "json"  -- auto-unwrap parse result
```

See [Error Handling](/docs/reference/error-handling/) for full details on `!`, `?`, `??`, and Result types.

## Aliases

| Long form | Short form |
|-----------|------------|
| `read` | `rd` |
| `write` | `wr` |
| `readbuf` | `rdb` |
