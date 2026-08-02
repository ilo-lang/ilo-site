---
title: Effects
description: Compile-time side-effect sigils (/http /fs /io /net /ml /time /rand) for static capability tracking in ilo.
---

Effect sigils are optional annotations appended to a function signature that declare which side effects the function may perform. They are **compile-time only** — no runtime overhead, no runtime interception. The verifier checks that declared sigils cover all side-effectful calls in the body.

## Syntax

Append sigils after the return type (and after any `^effect_set`):

```ilo
fetch url:t>R t t /http
save path:t data:t>R _ t /fs
log msg:t>R _ t /io
analyze data:t>R t t /http /ml
pure-sum xs:L n>n;sum xs
```

## Sigil reference

| Sigil | Covers |
|-------|--------|
| `/http` | HTTP builtins (`get`, `post`, `get-many`, `get-stream`, `pst-stream`, `del`, `put`, `pat`, `opt`, `hed`, `pstx`, `getx`, `get-to`) and all external tools (MCP / HTTP providers) |
| `/fs` | Filesystem builtins (`rd`, `rdb`, `rdl`, `rdjl`, `wr`, `wrl`, `ls`, `walk`, `glob`, `isfile`, `isdir`) |
| `/io` | Console / environment (`prnt`, `env`, `env-all`) |
| `/net` | Subprocess execution (`run`, `run2`, `run-full-env`, `run2-full-env`) |
| `/ml` | LLM inference (reserved; no builtins tagged yet) |
| `/time` | Time builtins (`now`, `now-ms`, `sleep`) |
| `/rand` | Random builtins (`rnd`, `rndn`) |

## Rules

- **No sigils = pure.** The verifier rejects calls to side-effectful builtins or tools in a function with no effect sigils.
- **Declared must cover actual.** If the body calls a builtin or function with effect `/http`, the signature must declare `/http`.
- **Over-declaring is safe.** Declaring `/http` but never calling HTTP is fine — no warning.
- **Transitive propagation.** Calling a function declared `/http` makes the caller require `/http` too.
- **External tools are `/http`.** Tool declarations (`tool name ...`) are assigned `Effect::Http` at every call site.

## Warnings and enforcement

Undeclared effects produce **ILO-W051** — a warning by default. Promote to a build failure with `--strict`:

```bash
ilo check file.ilo --strict    # ILO-W051 becomes exit-code failure
```

The warning message includes the undeclared effect(s) and a hint showing the sigil(s) to add:

```
warning[ILO-W051]: undeclared effect: function declared `pure` but body uses `/http`
  --> example.ilo:2:1
  = suggestion: add the effect sigil(s) to the signature: `/http` or remove the side-effectful call
```

## Examples

### Pure function (no sigils)

```ilo
add a:n b:n>n;+a b
```

No side-effectful calls — no sigils needed.

### HTTP + filesystem

```ilo
fetch-and-save url:t path:t>R _ t /http /fs
  r=get! url
  wr path r
```

Declares both `/http` (for `get`) and `/fs` (for `wr`). Calling `get` is covered by `/http`; calling `wr` is covered by `/fs`.

### Undeclared effect (ILO-W051)

```ilo
broken url:t path:t>R _ t /http
  r=get! url
  wr path r
```

`wr` requires `/fs` but the signature only declares `/http`. The verifier emits ILO-W051.

### Transitive propagation

```ilo
helper url:t>R t t /http
  get! url

caller url:t>R t t /http
  helper! url
```

`caller` calls `helper` which is `/http`, so `caller` must also declare `/http`. Without it: ILO-W051.

## Design notes

- Effect sigils are **not** a full algebraic effect system. There is no `perform`/`handle`/`resume`. They are compile-time annotations only.
- The effect set is **fixed** (not user-defined). The seven sigils cover the standard library's side-effectful surface.
- Effect sigils complement the existing runtime capability flags (`--allow-net`, `--allow-read`, `--allow-write`, `--allow-run`). Sigils are static (compile-time, per-function); capability flags are dynamic (runtime, per-process).
