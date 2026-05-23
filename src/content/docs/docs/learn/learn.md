---
title: Learning Path
description: Use this when you want a guided progression from zero to fluent ilo, in order.
---

Use this when you want a guided progression from zero to fluent ilo.

ilo is small. You can learn it in an afternoon. Here is the order I would read the docs in.

## 1. Why ilo exists

Start with the [Manifesto](/docs/learn/manifesto/). It explains the one metric ilo optimises for (total tokens from intent to working code) and why every design choice follows from that.

If you want a faster pitch first, the [Introduction](/docs/learn/introduction/) shows the same program in Python and ilo side by side.

## 2. Get it running

[Getting Started](/docs/learn/getting-started/) takes you from install to a multi-function program in one page. If you need platform-specific install details, [Install](/docs/learn/install/) has every option.

## 3. Read real programs

[Real-World Examples](/docs/learn/examples/) shows complete, working programs: HTTP + JSON, data pipelines, file processing. Skim these to build a feel for what idiomatic ilo looks like.

## 4. Learn the language

Once you can run a program, work through the [Reference](/docs/reference/language/) section in this order:

1. [Primitives](/docs/reference/primitives/) - the type sigils
2. [Types & Functions](/docs/reference/types-and-functions/) - function syntax
3. [Prefix Notation](/docs/reference/prefix-notation/) - operators
4. [Guards & Control Flow](/docs/reference/guards/) - replaces if/else
5. [Loops](/docs/reference/loops/) - foreach, ranges, while
6. [Error Handling](/docs/reference/error-handling/) - Result, `!`, `?`
7. [Pipes](/docs/reference/pipes/) - chain transforms
8. [Memory Model](/docs/reference/memory-model/) - how data is owned

## 5. Reach for builtins

The [Builtins](/docs/builtins/numbers/) section is the stdlib reference. Each page covers one concern:

- [Numbers](/docs/builtins/numbers/), [Text](/docs/builtins/text/), [Collections](/docs/builtins/collections/)
- [Data & I/O](/docs/builtins/data-io/), [HTTP](/docs/builtins/http/), [Tools](/docs/builtins/tools/)

## 6. When you get stuck

- [Gotchas](/docs/reference/gotchas/) for the common traps
- [Diagnostics](/docs/reference/diagnostics/) for error codes
- `ilo --explain ILO-XNNN` from the CLI for any error
