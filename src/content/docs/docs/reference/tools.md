---
title: Tool Policies
description: Runtime safety limits on tool calls. Optional policy{domain,tokens,rate} block in tool declarations.
---

Runtime safety limits on tool calls. Optional `policy{...}` block after `timeout`/`retry` in a `tool` declaration.

## Syntax

```ilo
tool name "description" (args) > R _ t timeout:30,retry:2 policy{domain:"...",tokens:500,rate:10}
```

All fields are optional. A `policy{}` block with no fields is valid (no restrictions). When omitted entirely, tool calls behave as before with no limits.

## Fields

| Field | Type | Effect | Violation error |
|-------|------|--------|-----------------|
| `domain` | text | URL must match this host. Supports `*.example.com` wildcard (matches `api.example.com` and `example.com`). Checked against the first text argument, which is conventionally the URL for HTTP tools. | `^"policy: domain mismatch - url host 'evil.com' not in allowed domain 'api.weather.com'"` |
| `tokens` | number | Maximum tokens consumed per call. Intended for LLM-backed tools where the response size determines cost. | `^"policy: token budget exceeded"` |
| `rate` | number | Maximum calls per minute. Enforced at dispatch time. | `^"policy: rate limit exceeded"` |

Policy violations return a `^"policy: ..."` Result error **before** the tool call proceeds. The caller handles them with `!` propagation or `?` match like any other Result error.

## Example

```ilo
tool weather "get weather" (city:t) > R _ t timeout:30,retry:2 policy{domain:"api.weather.com",tokens:500,rate:10}
```

```ilo
fetch city:t>R t t
;r=weather! city
;?r{^e:^+"failed: "e;~v:v}
```

A call with a URL outside `api.weather.com` returns `^"policy: domain mismatch ..."` instead of hitting the endpoint.

## How it works

Policy enforcement happens at tool dispatch time in every backend (tree interpreter, register VM). The domain check extracts the host from the first text argument and matches it against the declared domain pattern. Without a `policy` block, tool calls have no restrictions (backward compatible).

## When to use

- **`domain`**: restrict HTTP tools to known-safe endpoints. Prevents an agent from accidentally calling a different URL than intended.
- **`tokens`**: cap cost on LLM-backed tools. Prevents runaway spending on autonomous loops.
- **`rate`**: throttle high-frequency tool calls. Prevents flooding an API with requests.

All three are opt-in. A tool without `policy{...}` works exactly as before.
