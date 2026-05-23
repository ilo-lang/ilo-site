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
| `getx` | `t > R (M t _) t` | HTTP GET, rich response (status, headers, body) | `getx url` |
| `getx` | `t M > R (M t _) t` | HTTP GET, rich response, with request headers | `getx url headers` |
| `pstx` | `t t > R (M t _) t` | HTTP POST, rich response | `pstx url body` |
| `pstx` | `t t M > R (M t _) t` | HTTP POST, rich response, with request headers | `pstx url body headers` |
| `run` | `t L > R (M t t) t` | Spawn `cmd` with argv list. No shell, no glob. | `run "git" ["status"]` |
| `$` | `t L > R (M t t) t` | `run` shorthand (sugar for `run`) | `$"git" ["status"]` |
| `env` | `t > R t t` | Read environment variable | `env "API_KEY"` |

In 0.12.0 the `$` sigil was rebound from HTTP `get` (parochial — `$` for HTTP is unique to ilo) to the new `run` builtin (argv-list process spawn). `$cmd argv` compiles to `run cmd argv`. HTTP `get` is still called by name.

`post` was renamed to `pst` to bring it into line with the I/O compression family (`rd`, `wr`, `srt`, `flt`, `fld`, `fmt`). The old name no longer resolves; the verifier surfaces a did-you-mean hint pointing at `pst`.

`get-to` and `pst-to` add an explicit per-request timeout in milliseconds. The timeout rounds up to the nearest second internally (minreq granularity). On timeout, the call returns `Err` just like any other connection failure.

```ilo
-- 5-second timeout on GET
r=get-to url 5000

-- 3-second timeout on POST
r=pst-to url body 3000
```

## Rich-response variants: getx / pstx

`get` / `pst` / `get-to` / `pst-to` return `R t t` — body only. That is the right shape for fire-and-forget GETs and POSTs but blocks every workflow that needs response metadata: conditional requests (304 Not Modified branching on `If-None-Match`), redirect following, rate-limit headers (`X-RateLimit-Remaining`), pagination Link headers, cookie capture, status-code branching beyond Ok/Err.

`getx` and `pstx` are the rich variants. The success arm is a `Map[Text, _]` with three keys:

- `status` (`n`) — HTTP status code (200, 304, 404, 500, ...). Non-2xx responses are still Ok with the status surfaced; only transport failure (DNS, connection refused, timeout) returns Err.
- `headers` (`M t t`) — response headers. Header names are lowercased.
- `body` (`t`) — response body decoded as UTF-8.

Both accept the same optional trailing `M t t` request-headers map as `get`/`pst`.

```ilo
-- Conditional request: branch on 304 vs 200
fetch>R t t;h=mset mmap "if-none-match" "\"abc123\"";r=getx! "https://api.example.com/data" h;st=mget!! r "status";?(=st 304){~"not modified"};~mget!! r "body"

-- Read a rate-limit header
r=getx! "https://api.github.com/users/octocat";rem=mget!! (mget!! r "headers") "x-ratelimit-remaining"
```

Existing `get`/`pst` shapes are untouched. Pick `get` when body is all you need; pick `getx` when you need status or headers. Tree-bridge dispatched, so VM and Cranelift JIT inherit identical semantics.

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
