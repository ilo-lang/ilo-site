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
| `pst` | `t t > R t t` | HTTP POST (url, body). Renamed from `post` in 0.12.0 | `pst url body` |
| `pst` | `t t M > R t t` | HTTP POST with headers | `pst url body headers` |
| `run` | `t L > R (M t t) t` | Spawn `cmd` with argv list. No shell, no glob. | `run "git" ["status"]` |
| `$` | `t L > R (M t t) t` | `run` shorthand (sugar for `run`) | `$"git" ["status"]` |
| `env` | `t > R t t` | Read environment variable | `env "API_KEY"` |

In 0.12.0 the `$` sigil was rebound from HTTP `get` (parochial — `$` for HTTP is unique to ilo) to the new `run` builtin (argv-list process spawn). `$cmd argv` compiles to `run cmd argv`. HTTP `get` is still called by name.

`post` was renamed to `pst` to bring it into line with the I/O compression family (`rd`, `wr`, `srt`, `flt`, `fld`, `fmt`). The old name no longer resolves; the verifier surfaces a did-you-mean hint pointing at `pst`.

## Process spawn

`run cmd argv` is the only process-spawn primitive. The first argument is the program (text), the second is the argv list (`L t`), and the result is a `Result` whose `Ok` carries a three-key Map of `stdout` / `stderr` / `code` as text.

```ilo
r=run "echo" ["hi"]
-- Ok({"stdout":"hi\n","stderr":"","code":"0"})

$"git" ["status" "--short"]
-- equivalent: $ is the sigil shortcut for run
```

**No shell, no interpolation, no glob.** The argv list is passed directly to `std::process::Command::args`. There is no `sh -c`, no string concatenation between `cmd` and `argv`, and no glob expansion. This is the principled defence against shell injection.

**Non-zero exit is NOT an error.** `Err` is reserved for spawn failures (command not found, permission denied, output cap exceeded). A child that returns a non-zero exit code surfaces as `Ok({"stdout":..., "stderr":..., "code":"<n>"})`; the caller inspects `code` and branches.

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
