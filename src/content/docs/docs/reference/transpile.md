---
title: Transpile
description: Compile an ilo program to JavaScript or Python source. Use this when you need to run ilo logic in a JS or Python runtime — browser, Node, embedded Python, or any non-ilo host.
---

Compile an ilo program to JavaScript or Python source. Use this when you need to run ilo logic in a JS or Python runtime — browser, Node, embedded Python, or any non-ilo host.

## Targets

```bash
ilo build file.@ --emit js -o file.js          # ES module
ilo build file.@ --emit python -o file.py      # Python 3.8+
```

Same `ilo build` subcommand as the native AOT path; the `--emit` flag chooses the target.

## What gets emitted

- **JS**: ES module with arrow-function bodies, kebab-case → camelCase rename (`make-id` → `makeId`), Result encoded as `["ok", v]` / `["err", e]` tuples, records as plain objects with `_type` key. Builtin mapping: `len` → `.length`, `abs/min/max/flr/cel/sqrt` → `Math.*`, `prnt` → `console.log`, `jdmp/jpar` → `JSON.stringify/parse`, `rnd` → `Math.random()`, list append → spread.
- **Python**: idiomatic Python 3 source with type hints. Same Result-as-tuple shape. Records as `@dataclass`.

## Limitations

The transpiled output is **not a full ilo runtime** — it covers the canonical surface (functions, prefix expressions, guards, match, Result, records, lists, maps, common builtins). Features that don't have a clean host equivalent are deferred:

- **JS**: file I/O, `defer`/`errdefer`, `World`/capabilities, tagged sum-type match patterns, generic monomorphisation (best-effort), full builtin coverage
- **Python**: pattern-match arms that depend on ilo-specific match semantics, World/capabilities

For production code that needs full ilo semantics, ship the native binary (`ilo build`) or run via JIT (`ilo run --jit`).

## When to use it

| Use case | Reach for |
|---|---|
| Browser script | `--emit js` |
| Existing Python codebase calling ilo | `--emit python` |
| Cross-platform native binary | native AOT (no `--emit`) |
| Hot numeric loop on the server | `ilo run --jit` |
| One-off CLI invocation | `ilo run` |

## Related

- `ilo build` — native AOT compile (default target)
- Engines reference — VM, JIT, AOT comparison
