---
title: Getting Started
description: Use this when you want a single page that takes you from install to your first multi-function ilo program.
---

This page walks you from a fresh machine to a working multi-function ilo program. For install options on every platform, see [Install](/docs/learn/install/).

## Install

The fastest path on macOS or Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/ilo-lang/ilo/main/install.sh | sh
```

Verify it works:

```bash
ilo 'dbl x:n>n;*x 2' 5
# 10
```

If you use Claude Code, run `/plugin marketplace add ilo-lang/ilo` then `/plugin install ilo-lang/ilo` and your agent picks up ilo automatically. See [Install](/docs/learn/install/) for npm, Windows, source builds, and other agents.

## Your first program

Create `hello.ilo`:

```ilo
greet name:t > t
  +"hello " name
```

Run it:

```bash
ilo hello.ilo greet "world"
# hello world
```

That's a complete ilo program. Here is what each part means:

| Part | Meaning |
|------|---------|
| `greet` | function name |
| `name:t` | parameter `name`, type text |
| `> t` | returns text |
| `+"hello " name` | body: concatenate two strings (prefix `+`) |

Now try numbers. Create `math.ilo`:

```ilo
add a:n b:n > n  -- n = number, t = text
  + a b          -- prefix: + a b means a + b
```

```bash
ilo math.ilo add 3 4
# 7
```

## Inline mode

You can also run ilo without a file. Semicolons replace newlines and indentation:

```bash
ilo 'add a:n b:n>n;+a b' 3 4
# 7
```

This is the form AI agents use, same language, just compressed to one line. See the [CLI Reference](/docs/reference/cli/) for more.

## Multiple functions

ilo programs can contain multiple functions. Each function is a named declaration separated by a newline (in files) or a space (inline):

Save this as `math.ilo`:

```ilo
dbl x:n>n;*x 2
inc x:n>n;+x 1
sq x:n>n;*x x
```

### Selecting a function from the CLI

When a program has multiple functions, name the one you want to run after the filename:

```bash
ilo math.ilo dbl 5
# 10

ilo math.ilo sq 5
# 25
```

If you omit the function name, ilo runs the first one:

```bash
ilo math.ilo 5
# 10  (runs dbl, the first function)
```

Inline programs work the same way:

```bash
ilo 'dbl x:n>n;*x 2 sq x:n>n;*x x' dbl 5
# 10

ilo 'dbl x:n>n;*x 2 sq x:n>n;*x x' sq 5
# 25
```

### Functions can call each other

Functions in the same program can reference each other:

```ilo
dbl x:n > n        -- double a number
  *x 2             -- multiply x by 2

quad x:n > n       -- quadruple a number
  dbl(dbl x)       -- double x, then double again
```

```bash
ilo 'dbl x:n>n;*x 2 quad x:n>n;dbl(dbl x)' quad 3
# 12
```

For splitting functions across files, see [Imports](/docs/reference/imports/).

## Where to next

- [Manifesto](/docs/learn/manifesto/) for the why
- [Real-World Examples](/docs/learn/examples/) for end-to-end programs
- [Reference](/docs/reference/language/) for the full language spec
- [Builtins](/docs/builtins/numbers/) for the stdlib
