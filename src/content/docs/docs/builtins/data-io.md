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
| `jpth` | `t t > R t t` | Extract JSON path | `jpth data "users.0.name"` |
| `jdmp` | `_ > t` | Dump value as JSON string | `jdmp [1,2,3]` |
| `jpar` | `t > R _ t` | Parse JSON string to value | `jpar '{"a":1}'` |

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
