---
title: Memory Model
description: How ilo manages memory, compared to Rust, Zero, and Go
---

## Short version

ilo manages memory with reference counting. You write no memory annotations. The compiler and runtime handle it. Future versions add compile-time optimisations (escape analysis, in-place mutation) to reduce overhead, still without anything appearing in your source.

## What you write

```ilo
sum xs:L n>n;total=0;@x xs{total=+total x};total
```

No `&`, no `ref<T>`, no `let mut`, no lifetime parameters. Memory is the runtime's problem.

## Four approaches in the wild

| Language | Where memory rules live | User writes |
|----------|------------------------|-------------|
| **Rust** | In the source | `&value`, `&mut value`, `'a` lifetimes, ownership |
| **Zero** | In the source (lighter) | `ref<T>`, `mutref<T>`, `owned<T>` |
| **Go** | In the compiler | Nothing. Escape analysis at compile time |
| **ilo** | In the runtime (and future compiler) | Nothing. RC at runtime |

Each row is a deliberate choice with real costs and real benefits. Rust's borrow checker proves the absence of whole bug classes at compile time, with zero runtime overhead, at the cost of source-level annotations and a steep learning curve. Zero takes a lighter version of the same idea, asking for `ref<T>` / `mutref<T>` / `owned<T>` where Rust asks for lifetimes. Go puts the work in the compiler: escape analysis decides what goes on the stack, and a tracing garbage collector handles the rest. ilo sits closest to Go in spirit, but uses reference counting instead of a tracing collector, and pushes more optimisation work onto the compiler over time.

## Why ilo chose this

**Principle 1: Token-conservative.** Every memory annotation an agent has to write is tokens spent. `&mut`, `ref<T>`, lifetime parameters: all of these show up in source, and an agent pays for them on every generation. ilo's goal is the smallest source that gets the job done, so memory annotations sit outside the source entirely.

**Principle 4: Language-agnostic.** Borrow checking is a learned skill. Agents that have not been trained on Rust often produce code that fails the borrow checker on the first try, then retry, then retry again. Each retry is more tokens. By keeping memory rules out of the source, ilo removes a whole category of compile errors that an untrained agent would otherwise generate.

**Principle 6: Verified before execution.** ilo still wants strong guarantees, just not via the borrow checker. The verifier proves that types align, calls resolve, results are handled, and side effects are explicit. Memory safety comes from a different mechanism (RC plus a cycle detector) rather than from source-level proofs. The end-user property is the same: no use-after-free, no data races, no null dereferences.

## What this means in practice

- No use-after-free. RC keeps live values alive.
- No data races. ilo has no mutable shared state across threads in user code.
- No null dereferences. `O` and `R` must be matched before use.
- Bounds-checked list access.
- Cycles handled by ilo's cycle detector.
- Some runtime overhead vs borrow-checked languages. Typical figure is 10 to 20 percent on pointer-heavy code, less on arithmetic or string-heavy code. Real numbers depend on the workload and the engine (tree-walking, bytecode VM, or JIT).

## What's coming

Compile-time optimisation is on the roadmap. The plan is escape analysis plus automatic linearity inference: the compiler proves which values don't need RC, and skips the increment/decrement work for them. Invisible to your source, real runtime speedup.

In-place mutation for uniquely-owned values is the same idea applied to collections. If the compiler can prove a list has exactly one owner, an append doesn't need to copy. None of this surfaces as syntax. The contract with the agent stays: write the program, the runtime handles memory.

Timing depends on contributor capacity. See the public roadmap for current state.

## When ilo isn't the right choice

If you need:

- Sub-10KB native binaries
- Compile-time-proven absence of memory cycles
- Zero runtime memory overhead
- Direct control over memory layout

then ilo isn't the right tool for that part of your stack. Look at **Zero** for small native binaries with capability-checked safety, or **Rust** for full compile-time memory proofs and tight control over allocation. ilo composes well with both: an ilo program can shell out to a native binary written in either, and a host process in Rust or Zero can drive ilo as an embedded engine.

The honest framing: ilo trades a small amount of runtime cost for a much smaller surface area in the source. That tradeoff is correct for AI agents generating code in a loop. It is not correct for every workload.

## Further reading

- [Manifesto](/docs/manifesto/): why ilo makes the design choices it does
- [Built-in Functions](/docs/reference/builtins/): the closed-world API surface
- [Specification](/docs/reference/spec/): the full language reference
