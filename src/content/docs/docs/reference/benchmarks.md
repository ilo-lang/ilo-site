---
title: Benchmarks
description: Use this when comparing ilo runtime performance against other languages or across engines.
---

Use this when comparing ilo runtime performance against other languages or across engines.

Micro-benchmarks comparing ilo's execution engines against compiled, JIT, and interpreted languages. Each benchmark runs **10000 iterations** and reports the median per-call time in nanoseconds.

:::note
These are micro-benchmarks. They measure raw execution speed, not end-to-end agent workflow performance. ilo's primary optimisation target is **total token cost** (generation + errors + retries), not runtime speed.
:::

## Execution engines

ilo has three public execution backends (the tree-walking interpreter is internal-only as of 0.12.x):

| Backend | Flag | Notes |
|---------|------|-------|
| **ilo AOT** | `ilo compile` | Cranelift ahead-of-time compiler → standalone native binary |
| **ilo VM** | `ilo` *(default)* / `--vm` | Register-based bytecode virtual machine, all opcodes |
| **ilo JIT** | `ilo --jit` | Cranelift-based just-in-time compiler, opt-in for hot loops |

## Languages tested

| Category | Languages |
|----------|-----------|
| **Compiled (AOT)** | Rust (`rustc -O`), Go, C# (.NET), Kotlin (JVM) |
| **JIT** | LuaJIT, Node.js (V8), TypeScript (tsx/V8), PyPy 3 |
| **ilo** | ilo JIT, ilo VM |
| **Interpreted** | Lua, Ruby, PHP, Python 3 (CPython) |

## Results


### numeric

*sum 1..1000 (pure arithmetic loop)*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| Rust (native) | 329ns | **fastest** |
| LuaJIT | 442ns | 1.3x |
| Node/V8 | 451ns | 1.4x |
| TypeScript | 456ns | 1.4x |
| Kotlin (JVM) | 528ns | 1.6x |
| Go | 665ns | 2.0x |
| PyPy 3 | 1.5us | 4.5x |
| Lua | 4.2us | 12.7x |
| ilo JIT | 4.2us | 12.9x |
| ilo AOT | 5.3us | 16.0x |
| C# (.NET) | 5.9us | 18.0x |
| PHP | 6.7us | 20.2x |
| ilo VM | 14.7us | 44.7x |
| Ruby | 20.6us | 62.7x |
| Python 3 | 29.5us | 89.6x |

### string

*build 100-char string via concat*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| Rust (native) | 138ns | **fastest** |
| Node/V8 | 420ns | 3.0x |
| TypeScript | 433ns | 3.1x |
| PyPy 3 | 770ns | 5.6x |
| LuaJIT | 798ns | 5.8x |
| PHP | 1.3us | 9.3x |
| Python 3 | 2.1us | 15.5x |
| C# (.NET) | 2.2us | 15.9x |
| Kotlin (JVM) | 2.2us | 16.1x |
| Go | 3.4us | 24.3x |
| ilo JIT | 3.5us | 25.0x |
| ilo VM | 5.0us | 36.1x |
| Ruby | 5.1us | 36.7x |
| Lua | 5.2us | 37.7x |
| ilo AOT | 7.5us | 54.2x |

### record

*create 100 structs, sum fields*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| Go | 124ns | **fastest** |
| LuaJIT | 132ns | 1.1x |
| Kotlin (JVM) | 281ns | 2.3x |
| TypeScript | 288ns | 2.3x |
| Node/V8 | 341ns | 2.8x |
| PyPy 3 | 446ns | 3.6x |
| C# (.NET) | 449ns | 3.6x |
| ilo JIT | 743ns | 6.0x |
| ilo AOT | 814ns | 6.6x |
| ilo VM | 3.5us | 28.5x |
| PHP | 4.1us | 33.0x |
| Lua | 7.6us | 61.1x |
| Ruby | 8.6us | 69.4x |
| Python 3 | 8.6us | 69.7x |

### mixed

*build 100 records, JSON-serialise*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| TypeScript | 5.3us | **fastest** |
| Node/V8 | 5.3us | 1.0x |
| Go | 6.2us | 1.2x |
| Kotlin (JVM) | 7.8us | 1.5x |
| PHP | 8.6us | 1.6x |
| LuaJIT | 8.6us | 1.6x |
| Rust (native) | 9.7us | 1.8x |
| Ruby | 18.6us | 3.5x |
| PyPy 3 | 21.0us | 4.0x |
| Python 3 | 27.9us | 5.3x |
| C# (.NET) | 30.8us | 5.8x |
| ilo VM | 41.8us | 7.9x |
| ilo AOT | 46.4us | 8.8x |
| ilo JIT | 49.0us | 9.2x |
| Lua | 50.2us | 9.5x |

### guards

*classify 1000 values via guard chains*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| Go | 394ns | **fastest** |
| Node/V8 | 1.0us | 2.6x |
| TypeScript | 1.0us | 2.6x |
| Kotlin (JVM) | 1.1us | 2.7x |
| Rust (native) | 1.5us | 3.8x |
| LuaJIT | 1.9us | 4.8x |
| PyPy 3 | 4.4us | 11.2x |
| C# (.NET) | 6.8us | 17.3x |
| ilo JIT | 6.8us | 17.4x |
| ilo AOT | 8.7us | 22.1x |
| PHP | 26.7us | 67.7x |
| Lua | 27.9us | 70.9x |
| Ruby | 38.9us | 98.6x |
| ilo VM | 53.3us | 135.3x |
| Python 3 | 65.6us | 166.4x |

### recurse

*fibonacci(10), recursive calls*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| Rust (native) | 137ns | **fastest** |
| Go | 176ns | 1.3x |
| Kotlin (JVM) | 191ns | 1.4x |
| LuaJIT | 235ns | 1.7x |
| C# (.NET) | 362ns | 2.6x |
| TypeScript | 387ns | 2.8x |
| Node/V8 | 421ns | 3.1x |
| ilo JIT | 543ns | 4.0x |
| ilo AOT | 1.0us | 7.6x |
| PyPy 3 | 1.2us | 9.1x |
| Lua | 2.8us | 20.1x |
| Ruby | 3.1us | 23.0x |
| PHP | 5.0us | 36.5x |
| Python 3 | 6.0us | 43.9x |
| ilo VM | 6.9us | 50.5x |

### foreach

*build list of 100, sum via foreach*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| Rust (native) | 62ns | **fastest** |
| Go | 330ns | 5.3x |
| TypeScript | 473ns | 7.6x |
| PyPy 3 | 575ns | 9.3x |
| Node/V8 | 623ns | 10.0x |
| PHP | 1.0us | 16.3x |
| Kotlin (JVM) | 1.2us | 19.0x |
| C# (.NET) | 1.3us | 21.2x |
| LuaJIT | 1.4us | 21.9x |
| Python 3 | 2.1us | 33.2x |
| Ruby | 3.1us | 49.5x |
| Lua | 3.8us | 61.6x |
| ilo JIT | 11.2us | 181.3x |
| ilo AOT | 13.2us | 212.9x |
| ilo VM | 14.7us | 236.7x |

### while

*sum 0..99 via while loop*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| Rust (native) | 1ns | **fastest** |
| TypeScript | 73ns | 73.0x |
| Node/V8 | 81ns | 81.0x |
| Go | 111ns | 111.0x |
| LuaJIT | 119ns | 119.0x |
| Kotlin (JVM) | 192ns | 192.0x |
| PyPy 3 | 274ns | 274.0x |
| ilo JIT | 423ns | 423.0x |
| C# (.NET) | 557ns | 557.0x |
| PHP | 707ns | 707.0x |
| ilo AOT | 828ns | 828.0x |
| Lua | 982ns | 982.0x |
| ilo VM | 1.5us | 1496.0x |
| Ruby | 2.3us | 2341.0x |
| Python 3 | 2.6us | 2614.0x |

### pipe

*chain 4 function calls × 100 (call overhead)*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| Go | 45ns | **fastest** |
| LuaJIT | 118ns | 2.6x |
| TypeScript | 165ns | 3.7x |
| Node/V8 | 179ns | 4.0x |
| Kotlin (JVM) | 211ns | 4.7x |
| PyPy 3 | 464ns | 10.3x |
| Rust (native) | 485ns | 10.8x |
| ilo JIT | 558ns | 12.4x |
| ilo AOT | 781ns | 17.4x |
| C# (.NET) | 798ns | 17.7x |
| Lua | 4.2us | 93.2x |
| Ruby | 6.2us | 138.1x |
| PHP | 6.5us | 144.5x |
| ilo VM | 6.7us | 149.8x |
| Python 3 | 10.2us | 227.8x |

### file

*read JSON file, parse 20 records, sum scores*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| Rust (native) | 10.7us | **fastest** |
| Node/V8 | 12.0us | 1.1x |
| TypeScript | 12.7us | 1.2x |
| LuaJIT | 14.2us | 1.3x |
| PHP | 14.6us | 1.4x |
| Lua | 16.2us | 1.5x |
| ilo JIT | 16.3us | 1.5x |
| ilo VM | 16.6us | 1.6x |
| ilo AOT | 17.7us | 1.7x |
| Kotlin (JVM) | 17.7us | 1.7x |
| Ruby | 17.9us | 1.7x |
| Python 3 | 19.4us | 1.8x |
| Go | 20.5us | 1.9x |
| C# (.NET) | 22.0us | 2.1x |
| PyPy 3 | 23.1us | 2.2x |

### api

*HTTP GET JSON, parse 20 records, sum scores*

| Language | ns/call | vs fastest |
|----------|--------:|------------|
| PyPy 3 | 762ns | **fastest** |
| Python 3 | 2.2us | 2.9x |
| LuaJIT | 46.1us | 60.5x |
| Lua | 54.7us | 71.8x |
| Rust (native) | 161.2us | 211.6x |
| ilo AOT | 167.0us | 219.2x |
| PHP | 186.4us | 244.6x |
| Kotlin (JVM) | 186.4us | 244.6x |
| Go | 192.7us | 252.9x |
| C# (.NET) | 229.6us | 301.3x |
| Node/V8 | 275.6us | 361.7x |
| TypeScript | 282.8us | 371.1x |
| Ruby | 284.4us | 373.2x |
| ilo VM | 942.3us | 1236.6x |
| ilo JIT | 3.3ms | 4325.0x |

## Methodology

- All benchmarks run on the same machine (Darwin arm64) in a single session
- Each benchmark warms up before timing begins
- Compiled languages use optimised builds (`-O2` / `-O`)
- V8 and LuaJIT benefit from JIT warmup during the iteration loop
- Results are from 2026-03-13
