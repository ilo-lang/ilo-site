---
title: HTTP
description: Use this when making HTTP requests or wiring external endpoints as typed ilo functions.
---

Use this when making HTTP requests or wiring external endpoints as typed ilo functions.

HTTP builtins require the native binary. They are not available in the npm/WASM build.

## Builtins

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `get` | `t > R t t` | HTTP GET (returns Result) | `get "https://..."` |
| `$` | `t > R t t` | HTTP GET shorthand (sugar for `get`) | `$"https://..."` |
| `post` | `t t > R t t` | HTTP POST (url, body) | `post url body` |
| `get` | `t M > R t t` | HTTP GET with headers | `get url headers` |
| `post` | `t t M > R t t` | HTTP POST with headers | `post url body headers` |
| `env` | `t > R t t` | Read environment variable | `env "API_KEY"` |

`$` is syntactic sugar, `$url` compiles to `get url`.

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
