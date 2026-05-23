---
title: Real-World Examples
description: Practical ilo programs for common tasks
---

Practical patterns you can copy and adapt. Each example is a complete, runnable program.

## Data pipeline

Fetch JSON from an API, filter positive values, sum them:

```ilo
fetch url:t>R _ t;r=($!url);rdb! r "json"
pos x:_>b;>x 0
proc rows:L _>n;clean=flt pos rows;sum clean
```

Three functions, no boilerplate. `$!` auto-unwraps the HTTP response. `rdb!` parses JSON. `flt` keeps only elements where `pos` returns true.

## API status checker

Hit a URL and report whether it responded:

```ilo
check url:t>t
  r=$url
  ?r{~v:fmt "{}: ok" url;^e:fmt "{}: {}" url e}
```

```bash
ilo 'check url:t>t;r=$url;?r{~v:fmt "{}: ok" url;^e:fmt "{}: {}" url e}' "http://httpbin.org/get"
# -> http://httpbin.org/get: ok
```

`$url` makes an HTTP GET. The result is matched: `~v` (Ok) or `^e` (Err).

## CSV processing

```bash
# Column count of the first row
ilo 'f p:t>R n t;d=rd! p;~len d.0' f data.csv
```

`rd!` reads and parses the CSV file (returns `R`, so the function must too). `d.0` indexes the first row.

## Text processing

Count unique words in a file:

```bash
ilo 'f p:t>R n t;t=rd! p "raw";ws=spl t " ";~len (unq ws)' f document.txt
```

Extract all emails from text:

```bash
ilo 'f s:t>L t;rgx "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" s' \
  "contact alice@example.com or bob@test.org"
# -> [alice@example.com, bob@test.org]
```

Sort words by length:

```ilo
wlen s:t>n;len s
by-len ws:L t>L t;srt wlen ws
```

```bash
ilo examples/sort-by-key.ilo by-len '["banana","fig","apple","kiwi"]'
# -> ["fig", "kiwi", "apple", "banana"]
```

## Environment config

Read an env var with a fallback:

```ilo
cfg>t
  k=env "API_KEY"
  ?k{~v:v;^e:"missing API_KEY"}
```

`env` returns a `Result`. The match provides the value or a default.

## Tool interaction

Declare external tools, then compose them like regular functions:

```ilo
tool get-user"Retrieve user by ID" uid:t>R profile t timeout:5,retry:2
tool send-email"Send notification email" to:t subject:t body:t>R _ t timeout:10,retry:1

type profile{id:t;name:t;email:t;verified:b}

notify uid:t msg:t>R _ t
  u=get-user! uid
  !u.verified{^"user not verified"}
  send-email! u.email "Notification" msg
  ~_
```

Tools are type-checked at compile time. `get-user!` unwraps the result, propagating errors automatically.

## Python vs ilo

A tax-inclusive total calculation in both languages.

**Python** (93 chars, ~30 tokens):

```python
def total(price: float, quantity: int, rate: float) -> float:
    sub = price * quantity
    tax = sub * rate
    return sub + tax
```

**ilo** (38 chars, ~10 tokens):

```ilo
tot p:n q:n r:n>n;s=*p q;t=*s r;+s t
```

Same semantics. 0.33x the tokens, 0.22x the characters. For an AI agent paying per token, this adds up fast across thousands of tool calls.

## Sum types

Classify HTTP status codes using a discriminated union:

```ilo
type status S{ok:n; redirect:n t; err:n t}

describe s:status>t
  ?s{
    ok code: fmt "OK {}" code
    redirect code loc: fmt "→ {} {}" code loc
    err code msg: fmt "error {}: {}" code msg
  }
```

## Parallel processing

Double 10 000 numbers in parallel:

```bash
ilo 'double x:n>n;*x 2 main>L n;par-map double (range 0 10000)' main
```

## defer for cleanup

Read a file and guarantee close on exit:

```ilo
read-lines path:t>R L t t
  f = open! path
  defer close f
  ~rdl! f
```

## use<- chain

Chain operations without nesting:

```ilo
process path:t>R n t
  use<- f=open! path
  use<- rows=parse-csv! f
  ~sum (map (r:L _>n;num! r.0) rows)
```

## Pagination (tail-recursive accumulator)

Canonical pattern for iterating paged APIs: tail-recursive accumulator + empty-token termination + Result chain (`!` propagation). No stack growth regardless of page count.

```ilo
-- fetch-page: one HTTP call; returns ~[items next-token] or Err.
fetch-page url:t token:t>R (L _) t
  b=get! fmt "{}&cursor={}" url token
  items=jpar-list! b
  nxt=default-on-err (jpth b "next_cursor") ""
  ~[items nxt]

-- fetch-all: tail-recursive; empty token signals end-of-pages.
fetch-all url:t token:t acc:L n>R (L n) t
  =token "" ~acc
  r=fetch-page! url token
  page=at r 0
  nxt=at r 1
  fetch-all url nxt +acc page

-- Entry: seed with empty token and empty accumulator.
all-items>R (L n) t
  fetch-all "https://api.example.com/items" "" []
```

The `fld` builtin threads a numeric accumulator if you want a running total instead of collecting all items:

```ilo
sum-all>R n t
  xs=fetch-all! "https://api.example.com/items" "" []
  ~fld (a:n x:n>n;+a x) xs 0
```

## What's next

- Run `ilo -ai` to get the compact spec for your AI agent
- Read the full [language specification](https://github.com/ilo-lang/ilo/blob/main/SPEC.md)
- Browse [example programs](https://github.com/ilo-lang/ilo/tree/main/examples)
- Try the REPL: `ilo repl`
