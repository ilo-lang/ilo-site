---
title: Syntax Experiments
description: Use this when researching syntax design decisions; nine variants benchmarked against Claude Haiku.
---

Use this when researching syntax design decisions; nine variants benchmarked against Claude Haiku.

Nine syntax variants for the same language, tested against Claude Haiku. Most initial assumptions about what would save tokens were wrong.

## Setup

Each variant implements the same five programs: a simple function, one with dependencies, a data transform, a tool interaction with error handling, and a multi-step workflow. Measured with cl100k_base token counts, then tested against Claude Haiku with zero prior knowledge - generating correct code from just a spec and examples.

## The variants

The same function across three variants:

**idea1** - readable, Haskell-ish:

```
total price:number quantity:number rate:number -> number
  subtotal = multiply price quantity
  tax = multiply subtotal rate
  add subtotal tax
```

**idea7** - dense wire format:

```ilo
tot p:n q:n r:n>n;s=*p q;t=*s r;+s t
```

**idea9** - ultra-dense with short names (the winner):

```ilo
tot p:n q:n r:n>n;s=*p q;t=*s r;+s t
```

## Results

```
Idea                          Tokens   vs Py   Chars   vs Py   Score
--------------------------------------------------------------------
python-baseline                  871   1.00x    3635   1.00x       -
idea1                            921   1.06x    3108   0.86x    10.0
idea1-compact                    677   0.78x    2564   0.71x    10.0
idea2-tool-calling               983   1.13x    3203   0.88x    10.0
idea3-constrained-decoding       598   0.69x    2187   0.60x    10.0
idea4-ast-bytecode               584   0.67x    1190   0.33x     9.8
idea5-workflow-dag               710   0.82x    2603   0.72x    10.0
idea6-mcp-composition            956   1.10x    2978   0.82x     9.5
idea7-dense-wire                 351   0.40x    1292   0.36x    10.0
idea8-ultra-dense                285   0.33x     901   0.25x    10.0
idea9-ultra-dense-short          287   0.33x     787   0.22x    10.0
```

idea9 uses 0.33x the tokens and 0.22x the characters of Python, with 10/10 generation accuracy. idea4 (a bytecode-like format) was the only one that dipped below 10.

## Surprises

**Positional arguments are the biggest win.** Going from `charge(pid:pid, amt:amt)` to just `charge pid amt` eliminates parens, colons, and repeated parameter names. The single largest token reduction across all variants. The concern about parameter-swap errors was completely unfounded - 10/10 accuracy across all task types.

**Short variable names don't save tokens.** `order` and `ord` are both single tokens in cl100k_base. The tokenizer already handles common English words efficiently. Abbreviating only saves characters, not tokens. That's why idea8 (285 tokens) and idea9 (287 tokens) are nearly identical despite idea9 being 114 characters shorter.

**Sigils beat keywords, but not by as much as you'd think.** Replacing `match` with `?` and `for` with `@` saves characters more than tokens. The real win is disambiguation - a sigil can never be confused with a variable name, which reduces generation errors.

**Spec quality trumps syntax cleverness.** Going from 8/10 to 10/10 generation accuracy just by adding better operator examples to the spec. The spec is part of the prompt. If it's ambiguous, the LLM will struggle no matter how clean your syntax is.

**The bytecode format was a trap.** idea4 (integer-ID based AST) had great character efficiency (0.33x) but was the only variant that dropped below 10/10 accuracy. Making things machine-optimal at the character level can make them harder for LLMs to work with. The model needs *some* semantic signal.

## Cold-LLM test

The real validation: give Haiku the spec and examples, then ask it to write completely new programs in unfamiliar task domains. Not reformatting - actually understanding the language and producing novel code.

```
Per-task breakdown (Full test, /10):

Idea                        workflow  data_pipe  decision  api_orch
--------------------------------------------------------------------
idea7-dense-wire               10.0      10.0      10.0      10.0
idea8-ultra-dense               10.0      10.0      10.0      10.0
idea9-ultra-dense-short         10.0      10.0      10.0      10.0
idea4-ast-bytecode              10.0      10.0       9.0      10.0
idea6-mcp-composition            9.0      10.0       9.0      10.0
```

The dense formats weren't just parseable, they were *learnable*.

## Takeaway

idea1 through idea3 were designed by intuition, without proper benchmarks. The comparison harness made the difference. Measure first, design second.
