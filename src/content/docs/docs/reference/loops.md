---
title: Loops
description: Use this when iterating with foreach, range, while, or controlling flow with `brk` and `cnt`.
---

Use this when iterating with foreach, range, while, or controlling flow with `brk` and `cnt`.

ilo has three loop constructs: **foreach** (`@`), **range** (`@..`), and **while** (`wh`). All return the last iteration's body value (`nil` if the loop never executes).

## Foreach: `@binding list{body}`

Iterates over each element in a list:

Inline:

```ilo
sq-last xs:L n>n;@x xs{*x x}
```

Or as a file:

```ilo
sq-last xs:L n > n     -- list of numbers in, number out
  @x xs {             -- for each x in xs
    * x x              -- square x
  }                    -- returns last squared value
```

```bash
ilo 'sq-last xs:L n>n;@x xs{*x x}' 3,4,5
# → 25  (last element 5, squared)
```

Variables from the outer scope can be updated inside the loop body:

```ilo
total xs:L n > n       -- sum a list manually
  s = 0                -- accumulator
  @x xs {             -- for each x in xs
    s = + s x          -- add x to s
  }
  s                    -- return the sum
```

```bash
ilo 'total xs:L n>n;s=0;@x xs{s=+s x};s' 1,2,3
# → 6
```

The loop binding (`x`) is fresh each iteration. Outer variables (`s`) persist across iterations.

## Range: `@binding start..end{body}`

ilo's equivalent of a traditional `for` loop. Iterates from `start` (inclusive) to `end` (exclusive):

Inline:

```ilo
f>n;s=0;@i 0..5{s=+s i};s
```

Or as a file:

```ilo
f > n                  -- no params, returns number
  s = 0                -- accumulator
  @i 0..5 {           -- i goes 0, 1, 2, 3, 4
    s = + s i          -- add i to s
  }
  s                    -- → 10
```

```bash
ilo 'f>n;s=0;@i 0..5{s=+s i};s' f
# → 10  (0+1+2+3+4)
```

Building a list with a range:

```bash
ilo 'f>L n;xs=[];@i 0..3{xs=+=xs i};xs' f
# → [0, 1, 2]
```

Both bounds can be variables or expressions:

```bash
ilo 'f n:n>n;s=0;@i 0..n{s=+s i};s' 4
# → 6  (0+1+2+3)
```

If `start >= end`, the loop never executes.

## While: `wh condition{body}`

Loops while the condition is truthy:

Inline:

```ilo
f>n;i=0;s=0;wh <i 5{i=+i 1;s=+s i};s
```

Or as a file:

```ilo
f > n                  -- no params, returns number
  i = 0               -- counter
  s = 0               -- accumulator
  wh < i 5 {          -- while i < 5
    i = + i 1         -- increment i
    s = + s i         -- add i to s
  }
  s                    -- → 15
```

```bash
ilo 'f>n;i=0;s=0;wh <i 5{i=+i 1;s=+s i};s' f
# → 15  (1+2+3+4+5)
```

Unlike `@`, while loops don't create a fresh binding per iteration; all variables persist.

## Loops stay flat

In most languages, loops with conditions inside them create deep nesting. Compare the Python equivalent of counting passing scores with early exit on a perfect score:

```python
def count_passing(scores):
    count = 0
    for score in scores:
        if score == 100:
            return count + 1
        if score >= 60:
            count += 1
    return count
```

In ilo, [guards](/docs/reference/guards) inside loops keep the body flat. No indentation creep:

```ilo
count-passing scores:L n > n
  c = 0
  @s scores {
    = s 100 { ret + c 1 }   -- perfect score, return early
    >= s 60 { c = + c 1 }   -- passing score, increment
  }
  c
```

Guards return or continue without nesting. Add more conditions and the indentation stays the same: each guard is an independent flat check.

## Break and continue

`brk` exits the enclosing loop. `cnt` skips to the next iteration:

```ilo
f > n
  i = 0
  wh true {           -- infinite loop
    i = + i 1
    >= i 3 { brk }    -- break when i reaches 3
  }
  i                    -- → 3
```

```bash
ilo 'f>n;i=0;wh true{i=+i 1;>=i 3{brk}};i' f
# → 3
```

Continue example, skip iterations where `i >= 3`:

```bash
ilo 'f>n;i=0;s=0;wh <i 5{i=+i 1;>=i 3{cnt};s=+s i};s' f
# → 3  (1+2, skips 3, 4, 5)
```

Both `brk` and `cnt` work inside guards within loops. `brk expr` accepts an optional value (currently discarded; the loop returns the last body value before the break).

## Early return from loops

Use `ret` to return from the enclosing function inside a loop:

Inline:

```ilo
first-big xs:L n>n;@x xs{>=x 10{ret x}};0
```

Or as a file:

```ilo
first-big xs:L n > n        -- find first element >= 10
  @x xs {                  -- loop over list
    >= x 10 { ret x }       -- if x >= 10, return it
  }
  0                          -- fallback if none found
```

```bash
ilo 'first-big xs:L n>n;@x xs{>=x 10{ret x}};0' 3,7,12,5
# → 12
```

## Choosing the right loop

| | Foreach `@` | Range `@..` | While `wh` |
|--|-------------|-------------|------------|
| **Syntax** | `@x xs{…}` | `@i a..b{…}` | `wh cond{…}` |
| **Use when** | Iterating a list | Counting over numbers | Custom stop condition |
| **Fresh binding** | Yes | Yes | No |

For simple list transforms, prefer [`map`](/docs/builtins/collections#higher-order-functions), [`flt`](/docs/builtins/collections#higher-order-functions), and [`fld`](/docs/builtins/collections#higher-order-functions). Loops are for when you need mutable state or early exit.

## Parallel map: `par-map`

`par-map` is a parallel version of `map` that distributes work across threads:

```ilo
double x:n>n;*x 2
main>L n;par-map double (range 0 1000)
```

```bash
ilo 'double x:n>n;*x 2 main>L n;par-map double (range 0 1000)' main
```

`par-map` accepts an optional chunk size to control granularity:

```ilo
par-map double xs 64     -- chunk every 64 elements
```

The chunk size tunes the work-stealing scheduler: smaller chunks improve load balancing at the cost of higher overhead; larger chunks reduce overhead but may leave threads idle. As of 0.13.0, `par-map` has a native VM opcode (`PAR_MAP`) and the Cranelift JIT can JIT the inner function before dispatching to threads.

`par-map` is safe only for pure functions with no shared mutable state. The verifier does not enforce this automatically; use effect sets (see `World` capability) to annotate and restrict side-effectful code.

## Tail-call optimisation

ilo deliberately has no `loop` keyword — every iteration shape that can't be written with `@` foreach should be expressed as a tail-recursive function. To make that safe, the runtime guarantees that **tail calls do not consume host-stack frames**: a function that recurses only in tail position can run to arbitrary depth, because the runtime rebinds parameters in place rather than pushing a frame.

```ilo
-- Count down from n to 0. Runs at any depth.
count-down n:n>n;=n 0 0;count-down -n 1

-- Tail-recursive sum. `acc` carries the partial result.
sum-acc xs:L n acc:n>n;empty=len xs;=empty 0 acc;sum-acc tl xs +acc hd xs
```

A call is in **tail position** when its return value is the function's return value:

- the last statement of a function body,
- the expression of a `ret` statement,
- an arm of a `?` match that is itself in tail position,
- the body of a braceless guard.

Calls inside `@` foreach, `@..` range, or `wh` loops are **not** in tail position — the loop header runs after each iteration, so the call's return doesn't become the function's return. Operands of further computation (e.g. `*n fac -n 1`) are also not in tail position.

The peephole only fires when the callee is a direct user-defined function name (not a `FnRef` in scope, not a closure, not a builtin, not a tool) and the call has no auto-unwrap (`!` / `!!`). These constraints cover the common recursive-accumulator and state-machine shapes.

Tail-call optimisation is supported across all engines. The bytecode VM (`--vm`) emits `OP_TAILCALL` and reuses the current call frame; the Cranelift JIT and AOT backends lower tail calls to `return_call` (shipped in 0.13.0, ILO-15 + ILO-45). The tree-walker interpreter has been removed from the public CLI. All three backends guarantee bounded stack depth for tail-recursive programs.
