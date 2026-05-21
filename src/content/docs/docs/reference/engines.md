---
title: Engines
description: Use this when you need to pick or understand an ilo execution engine (VM, JIT, AOT).
---

Use this when you need to pick or understand an ilo execution engine.

ilo programs verify once and then run on either the bytecode VM or Cranelift (JIT or AOT). Both accept the same source. They differ only in start-up cost, peak throughput, and platform reach.

## Engine profiles

| Engine | Start-up | Throughput | Use when |
|--------|----------|------------|----------|
| **VM** (bytecode) | Low | Medium | Default for every workload; covers every language feature |
| **JIT** (Cranelift) | Medium | High | Hot loops, benchmarks, long-running services |
| **AOT** | Highest (build) | Highest | Shipping a single native binary with no runtime |

As of 0.13.0 ilo ships with two engines: the VM and Cranelift. The tree-walking interpreter was removed as a user-selectable engine; the shared runtime module (`src/runtime/`) stays in-tree as the internal dispatch target for ~30 builtins routed through the VM/Cranelift tree-bridge — HOF / regex / fmt / IO / sleep / ct / rsrt / closure-bind-ctx / crypto / calendar shapes the VM and Cranelift haven't lifted natively. The VM bails to it transparently; per ILO-234 the round-trip cost is negligible.

The CLI picks a sensible default per command. To force an engine, see `--vm` / `--jit` in the [CLI Reference](/docs/reference/cli/).

## Contracts every engine shares

- **Same verifier.** A program that verifies on one engine verifies on all.
- **Same builtins.** Every builtin behaves identically across engines, except where the engine lacks the underlying capability (HTTP is unavailable in the WASM build).
- **Same diagnostics.** Error codes (`ILO-T...`, `ILO-R...`) match across engines. See [Diagnostics](/docs/reference/diagnostics/).
- **Same float semantics.** All engines use IEEE-754 f64.

## Engine-specific notes

### VM
- Default engine for `ilo run` on a native binary.
- Capped at 256 registers per function (`ILO-T035`).
- Internally bails to the shared runtime module for a small set of HOFs (`map`/`flt`/`fld`/`srt`/`rsrt` with a ctx arg), regex (`rgx`/`rgxall`/`rgxall1`), variadic `fmt`, 2-arg `rd`/`rdb`, 1-arg `sleep`, and 2/3-arg `ct`/`rsrt`. Transparent: same output, same diagnostics, no user-visible difference.

### JIT (Cranelift)
- Enabled with `--features cranelift` in a source build.
- Best for hot loops and numeric kernels.

### AOT
- Produces a standalone native binary.
- See `ilo build` in the [CLI Reference](/docs/reference/cli/).

## Picking an engine

If you do not know, do not pick. The default is right for most programs. Reach for `--engine` only when you have measured a reason. See [Benchmarks](/docs/reference/benchmarks/) for numbers.
