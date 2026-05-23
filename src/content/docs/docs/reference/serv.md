---
title: The Server
description: Long-lived JSON request/response loop for agent integration. Use this when an agent or tool wants to compile, check, run, or trace ilo programs without spawning a new process per request.
---

Long-lived JSON request/response loop for agent integration. Use this when an agent or tool wants to compile, check, run, or trace ilo programs without spawning a new process per request.

Distinct from `ilo httpd`, which serves user-facing HTTP traffic on a port you choose. `ilo serv` speaks an internal JSON-RPC dialect on stdin/stdout, intended for tooling.

## Start the server

```bash
ilo serv
```

The process reads newline-delimited JSON requests from stdin and writes newline-delimited JSON responses to stdout. It keeps running until stdin closes or the host kills it.

## Request shape

Each request is one JSON object on a single line. Methods mirror the CLI subcommands:

```json
{"method":"check","source":"main>_;prnt +2 2"}
{"method":"run","source":"main>n;fib 10","func":"fib","args":[10]}
{"method":"trace","source":"...","func":"...","args":[...]}
{"method":"ast","source":"..."}
{"method":"graph","source":"..."}
```

`source` is the program text. Optional fields mirror the CLI flags.

## Response shape

Each response is one JSON object with a stable `schemaVersion`:

```json
{"schemaVersion":1,"ok":true,"result":{...}}
{"schemaVersion":1,"ok":false,"diagnostics":[{"code":"ILO-P003","message":"...","span":{...},"fixPlans":[...]}]}
```

Diagnostics carry typed error codes, source spans, and `FixSafety`-classified fix plans (per ILO-360). No screen-scraping required.

## Safety

`ilo serv` accepts untrusted source. The AST depth cap (`ILO-P103`, default 256) and the runtime / output guards (`ILO-R016`, `ILO-R017`) apply per request. Cap overrides:

```bash
ilo --max-ast-depth 512 serv
ilo --max-runtime 30 --max-output-bytes 10000000 serv
```

Capability flags (`--allow-net`, `--allow-read`, `--allow-write`, `--allow-run`) pass through to `run` requests.

## When to use it

| Use case | Reach for |
|---|---|
| Interactive prototyping by a human | `ilo repl` |
| HTTP traffic from a browser / client | `ilo httpd` |
| Agent driving the compiler/runtime | `ilo serv` |
| One-shot CLI invocations | `ilo check` / `ilo run` / `ilo build` |

The per-process startup overhead matters at scale — a tool that compiles thousands of snippets per minute should run `ilo serv` once and stream requests, not fork `ilo check` per snippet.

## Protocol stability

`schemaVersion` on every response. Schema changes bump the version. Older clients can detect and either adapt or refuse to parse. The expectation per Manifesto P6 (Structured Compiler-to-Agent Surface) is that this contract is stable enough for agents to depend on across releases.

## Related

- `ilo httpd` — user-facing HTTP server backed by a handler function
- `ilo apply` — apply a typed fix plan to source (often consumed from `ilo check` output)
- `ilo trace` — line-of-execution trace mode, useful when debugging an agent's program
