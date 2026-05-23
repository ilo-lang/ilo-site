---
title: Introduction
description: What is ilo and why does it exist?
---

**ilo** is a token-optimised programming language for AI agents. Named from the [Toki Pona](https://en.wikipedia.org/wiki/Toki_Pona) word for ["tool"](https://sona.pona.la/wiki/ilo), it's designed to minimise the total token cost when AI agents write and run programs.

## The problem

AI agents pay three costs per program:

1. **Generation tokens** - producing the code
2. **Error feedback** - reading error messages when something goes wrong
3. **Retries** - regenerating after failures

Traditional languages weren't designed for this.

## The solution

Here's the same program in Python and ilo - a function that computes subtotal plus tax:

```python
def tot(p: float, q: float, r: float) -> float:
    s = p * q
    t = s * r
    return s + t
```

```ilo
tot p:n q:n r:n>n;s=*p q;t=*s r;+s t
```

The ilo version is **0.33× the tokens** and **0.22× the characters**. Both are typed, both have named variables, both do the same thing.

The savings come from three things:

- **Prefix notation** eliminates parentheses: `+*a b c` instead of `(a * b) + c`
- **Short names** - single-char variables (`x`, `n`, `s`), short function names (`dbl`, `fac`), and builtins with compact aliases (`len`, `hd`, `flt`)
- **Type verification** catches errors before execution with compact codes (`ILO-T004`) - not a full stack trace
- **Constrained vocabulary** means fewer valid next-tokens, fewer wrong choices, fewer retries

## Run a program

```bash
# Run inline
ilo 'tot p:n q:n r:n>n;s=*p q;t=*s r;+s t' 10 20 30

# Run from file
ilo program.ilo tot 10 20 30
```

For the current release and what's new, see the [release notes on GitHub](https://github.com/ilo-lang/ilo/releases).

