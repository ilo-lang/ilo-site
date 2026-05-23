---
title: The REPL
description: Use this when running an interactive ilo session for experimenting or prototyping.
---

Use this when running an interactive ilo session for experimenting or prototyping.

## Start a session

```bash
ilo repl
```

You get an interactive prompt where you can define functions and evaluate expressions:

```ilo
ilo> dbl x:n>n;*x 2
ilo> dbl 5
10
ilo> inc x:n>n;+x 1
ilo> inc 10
11
```

Functions, types, and aliases persist across lines. Build up a program incrementally.

## Multi-line input

The REPL supports multi-line input for type definitions and functions. Continuation is triggered by:

- **Unclosed braces** - type definitions spanning multiple lines
- **Trailing `;`** - signals more statements to come

```
> type point{
..   x:n
..   y:n
.. }
defined type: point{x:n;y:n}

> cls sp:n>t;
..   >=sp 1000 "gold";
..   >=sp 500 "silver";
..   "bronze"

defined: cls(sp:n) -> t
```

A blank line or balanced braces submit the input.

## Pipes in the REPL

Chain functions you've already defined:

```ilo
ilo> dbl x:n>n;*x 2
ilo> inc x:n>n;+x 1
ilo> 5 >> dbl >> inc
11
```

## Commands

| Command | What it does |
|---------|-------------|
| `:defs` | Show all definitions (functions, types, aliases) |
| `:w file.ilo` | Save definitions to a file |
| `:clear` | Start fresh |
| `:help` | Show help |
| `:q` | Quit |

## JSON mode

For agent integration, use `-j` to get structured JSON output:

```bash
ilo repl -j
```

Success:
```json
{"ok": 10}
```

Error:
```json
{"code": "ILO-T004", "message": "undefined variable 'y'", "severity": "error", "suggestion": "did you mean 'x'?"}
```

The `-j` flag also works outside the REPL: `ilo 'dbl x:n>n;*x 2' -j 5`

## Tips

- Define helper functions first, then compose them
- Use `:defs` to remind yourself what's in scope
- Use `:w` to save a working session to a file when you're happy with it
