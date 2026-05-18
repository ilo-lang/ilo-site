---
title: Engines
description: Use this when you need to pick or understand an ilo execution engine (tree, VM, JIT, AOT).
---

Use this when you need to pick or understand an ilo execution engine.

ilo programs verify once and then run on one of four engines. Every engine accepts the same source. They differ only in start-up cost, peak throughput, and platform reach.

## Engine profiles

| Engine | Start-up | Throughput | Use when |
|--------|----------|------------|----------|
| **Tree-walk** | Lowest | Lowest | One-shot scripts, REPL, smallest binary, WASM build |
| **VM** (bytecode) | Low | Medium | Default for repeated invocations and long programs |
| **JIT** (Cranelift) | Medium | High | Hot loops, benchmarks, long-running services |
| **AOT** | Highest (build) | Highest | Shipping a single native binary with no runtime |

The CLI picks a sensible default per command. To force an engine, see `--engine` in the [CLI Reference](/docs/reference/cli/).

## Contracts every engine shares

- **Same verifier.** A program that verifies on one engine verifies on all.
- **Same builtins.** Every builtin behaves identically across engines, except where the engine lacks the underlying capability (HTTP is unavailable in the WASM build).
- **Same diagnostics.** Error codes (`ILO-T...`, `ILO-R...`) match across engines. See [Diagnostics](/docs/reference/diagnostics/).
- **Same float semantics.** All engines use IEEE-754 f64.

## Engine-specific notes

### Tree-walk
- Lowest binary size. Used by the WASM/npm distribution.
- HTTP and process builtins (`get`, `pst`, `run`, `$`) are not available in WASM.

### VM
- Default engine for `ilo run` on a native binary.
- Capped at 256 registers per function (`ILO-T035`).

### JIT (Cranelift)
- Enabled with `--features cranelift` in a source build.
- Best for hot loops and numeric kernels.

### AOT
- Produces a standalone native binary.
- See `ilo build` in the [CLI Reference](/docs/reference/cli/).

## Picking an engine

If you do not know, do not pick. The default is right for most programs. Reach for `--engine` only when you have measured a reason. See [Benchmarks](/docs/reference/benchmarks/) for numbers.
