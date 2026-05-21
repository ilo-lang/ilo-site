---
title: HTTP and process
description: Use this when making HTTP requests, spawning child processes, or wiring external endpoints as typed ilo functions.
---

Use this when making HTTP requests, spawning child processes, or wiring external endpoints as typed ilo functions.

HTTP and process-spawn builtins require the native binary. They are not available in the npm/WASM build.

## Builtins

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `get` | `t > R t t` | HTTP GET (returns Result) | `get "https://..."` |
| `get` | `t M > R t t` | HTTP GET with headers | `get url headers` |
| `get-to` | `t n > R t t` | HTTP GET with timeout (ms) | `get-to url 5000` |
| `pst` | `t t > R t t` | HTTP POST (url, body). Renamed from `post` in 0.12.0 | `pst url body` |
| `pst` | `t t M > R t t` | HTTP POST with headers | `pst url body headers` |
| `pst-to` | `t t n > R t t` | HTTP POST with timeout (ms) | `pst-to url body 5000` |
| `put` | `t t > R t t` | HTTP PUT (url, body) | `put url body` |
| `put` | `t t M > R t t` | HTTP PUT with headers | `put url body headers` |
| `pat` | `t t > R t t` | HTTP PATCH (url, body) | `pat url body` |
| `pat` | `t t M > R t t` | HTTP PATCH with headers | `pat url body headers` |
| `del` | `t > R t t` | HTTP DELETE | `del url` |
| `del` | `t M > R t t` | HTTP DELETE with headers | `del url headers` |
| `hed` | `t > R t t` | HTTP HEAD (body typically empty; success via Ok/Err) | `hed url` |
| `hed` | `t M > R t t` | HTTP HEAD with headers | `hed url headers` |
| `opt` | `t > R t t` | HTTP OPTIONS | `opt url` |
| `opt` | `t M > R t t` | HTTP OPTIONS with headers | `opt url headers` |
| `run` | `t L > R (M t t) t` | Spawn `cmd` with argv list. No shell, no glob. | `run "git" ["status"]` |
| `$` | `t L > R (M t t) t` | `run` shorthand (sugar for `run`) | `$"git" ["status"]` |
| `env` | `t > R t t` | Read environment variable | `env "API_KEY"` |

In 0.12.0 the `$` sigil was rebound from HTTP `get` (parochial — `$` for HTTP is unique to ilo) to the new `run` builtin (argv-list process spawn). `$cmd argv` compiles to `run cmd argv`. HTTP `get` is still called by name.

`post` was renamed to `pst` to bring it into line with the I/O compression family (`rd`, `wr`, `srt`, `flt`, `fld`, `fmt`). The old name no longer resolves; the verifier surfaces a did-you-mean hint pointing at `pst`.

`get-to` and `pst-to` add an explicit per-request timeout in milliseconds. The timeout rounds up to the nearest second internally (minreq granularity). On timeout, the call returns `Err` just like any other connection failure.

`put`, `pat`, `del`, `hed`, `opt` round out the HTTP verb cluster (PUT, PATCH, DELETE, HEAD, OPTIONS). `put`/`pat` take a body like `pst`; `del`/`hed`/`opt` take only the URL (DELETE bodies exist in RFC 7231 but are honoured by almost no API, so the headers-only variant is the canonical shape). All five return `R t t` and accept the same `!` / `!!` auto-unwrap as `pst`. The cluster is intentionally limited to the seven safe methods (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS); TRACE and CONNECT are out of scope.

```ilo
-- 5-second timeout on GET
r=get-to url 5000

-- 3-second timeout on POST
r=pst-to url body 3000
```

## Process spawn

ilo provides two process-spawn primitives: `run` and `run2`. Both share the same no-shell-no-glob security model, the same concurrency and cap policy, and the same UTF-8 handling. They differ only in what the `Ok` payload looks like.

`run cmd argv` returns a loose Map with text values for stdout, stderr, and exit code.

```ilo
r=run "echo" ["hi"]
-- Ok({"stdout":"hi\n","stderr":"","code":"0"})

$"git" ["status" "--short"]
-- equivalent: $ is the sigil shortcut for run
```

`run2 cmd argv` returns a typed `RunResult` record with dot-access. `exit` is a number (`n`), not text, so numeric comparisons work directly.

```ilo
r=run2!! "echo" ["hi"]
-- RunResult{stdout:"hi\n"; stderr:""; exit:0}

=0 r.exit   -- true
<0 r.exit   -- false (signal-killed processes surface as exit:-1 on Unix)
```

Prefer `run2` for new code. `run` is kept for compatibility.

**No shell, no interpolation, no glob.** The argv list is passed directly to `std::process::Command::args`. There is no `sh -c`, no string concatenation between `cmd` and `argv`, and no glob expansion. This is the principled defence against shell injection.

**Non-zero exit is NOT an error.** `Err` is reserved for spawn failures (command not found, permission denied, output cap exceeded). A child that returns a non-zero exit code surfaces in the `Ok` arm; the caller inspects `exit` (run2) or `code` (run) and branches.

**Captured output is capped at 10 MiB per stream.** Either stream exceeding the cap returns an `Err` rather than partial capture.

**Inherits parent env + cwd.** No override knobs in v1. Stdin is `/dev/null`.

## Example

```ilo
fetch url:t>R t t;get url
```

Auto-unwrap with `!` propagates errors automatically:

```ilo
f url:t>R t t;r=get! url;~r
```

See [Error Handling](/docs/reference/error-handling/) for full details on `!` and Result types.

## Parsing Content-Type and other `;`-delimited headers

There is no dedicated `ct-parse` builtin. The same recipe handles `Content-Type`, `Cache-Control`, `Cookie`, `Set-Cookie` attributes, and any other header with `key=value` parameters after a `;` separator: `spl` on `;`, `trm`, lowercase, then `spl "="` for the parameter:

```ilo
raw = "application/json; charset=utf-8"
parts = spl raw ";"
m0 = at parts 0
media = lwr (trm m0)                          -- "application/json"
n = len parts
cs = ?(>=n 2){at parts 1}{""}
kv = spl (trm cs) "="
charset = ?(=(len kv) 2){lwr (at kv 1)}{""}   -- "utf-8" or ""
```

Don't bind to `ct`, it collides with a builtin name (`ILO-P011`). Use `raw`, `ctype`, or similar.

For `,`-joined values such as `Accept: text/html, application/json`, `spl ","` first and loop the resulting list through the same recipe.

## HTTP tools (typed endpoints)

Tool declarations let you wire external HTTP endpoints as typed ilo functions. Create a `tools.json` file:

```json
{
  "tools": {
    "weather": {
      "url": "https://api.example.com/weather"
    },
    "lookup": {
      "url": "https://api.example.com/lookup"
    }
  }
}
```

Each key is the tool name. The value must include a `url` field.

```bash
ilo --tools tools.json 'get-weather city:t>R t t;weather city' "London"
```

Tools are type-checked at load time, the agent cannot call a tool with the wrong parameter types.

See also [Tools](/docs/builtins/tools/) for MCP integration.
