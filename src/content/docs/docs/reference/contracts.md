---
title: Optional Contracts
description: Optional req/ens clauses for lightweight precondition checking. Prototype, pattern-based.
---

> **Prototype.** Contracts are experimental: parsed and stored, but the
> precondition checker uses simple structural pattern matching, not a full SMT
> solver. They may emit false positives when guard logic is too complex to match
> structurally.

ilo supports optional preconditions (`req`) and postconditions (`ens`) on
function declarations. They are **strictly opt-in** — functions without `req`/`ens`
behave exactly as before. When present, the verifier does a lightweight structural
check at call sites and emits a warning (`ILO-W030`) if it cannot prove the
precondition from preceding guards.

## Syntax

`req` and `ens` are contextual keywords placed after the return type (and any
optional effect set), before the `;`/body:

```ilo
-- Precondition only
f x:n>n req x>=0;<x 0;-x x;x

-- Postcondition only
abs x:n>n ens result>=0;<x 0;-x x;x

-- Both
div a:n b:n>R n t req b!=0 ens result>=0;=b 0 ^"divide by zero";~/a b
```

## How the checker works

The verifier scans every call site of a function with a `req` clause. For each
call site, it looks at **preceding braceless guard statements** for a pattern
that implies the precondition.

| Precondition | Satisfying guard | Example |
|---|---|---|
| `req b!=0` | `=b 0 ^"..."` | guard rejects zero divisor |
| `req x>=0` | `>=x 0 ^"..."` or `>x 0 ^"..."` | guard rejects negatives |
| `req x>0` | `>x 0 ^"..."` | guard rejects zero/negatives |
| `req x<=0` | `<=x 0 ^"..."` or `<x 0 ^"..."` | guard rejects positives |
| `req x<0` | `<x 0 ^"..."` | guard rejects zero/positives |

If no matching guard is found, the verifier emits **ILO-W030** — a **warning**,
not an error. The program still compiles and runs; runtime guards remain intact.

## Postconditions

Postconditions (`ens`) are stored on the declaration. They appear in `ilo explain`
output and serve as documentation. Postconditions are **not verified** in this
prototype; a future version may add body-level checking.

```ilo
abs x:n>n ens result>=0;<x 0;-x x;x
```

`ilo explain abs` shows the contract alongside the function signature.

## ILO-W030

```
warning[ILO-W030]: call to 'div' may violate precondition b!=0 — add a guard
  --> calc.ilo:3:12
   |
3 | calc x:n y:n>R n t;div x y
   |            ^^^^^^^^
   = hint: guard before the call: e.g. `=b!=0 ^"..."` or wrap the call in a match on R
```

**Warning-only.** The program compiles and runs. Runtime guards (`=b 0 ^"..."`)
catch the actual violation at runtime if it occurs. `ilo check --strict`
elevates ILO-W030 to an exit-code failure for CI pipelines.

## Examples

### Division with precondition

```ilo
div a:n b:n>R n t req b!=0;=b 0 ^"divide by zero";~/a b

-- Caller WITHOUT guard: ILO-W030 fires
calc x:n y:n>R n t;div x y

-- Caller WITH guard: no warning
calc-safe x:n y:n>R n t;=y 0 ^"bad arg";div x y
```

### Absolute value with postcondition

```ilo
abs x:n>n ens result>=0;<x 0;-x x;x
```

### Non-negative list length

```ilo
safe-len xs:L n ens result>=0;len xs
```

## Limitations (prototype)

- **Pattern matching only.** The checker matches guards structurally — it does
  not use an SMT solver, so complex guard logic (nested conditions, indirect
  reasoning) may produce false-positive warnings.
- **Literal comparisons.** Only guards comparing a variable to a literal
  (`=b 0`, `>=x 0`) are matched. Guards comparing two variables (`=x y`) are
  not yet supported.
- **Postconditions not verified.** `ens` clauses are stored and shown by
  `ilo explain` but not checked against the function body.
- **Future.** A v2 with Z3 SMT proving behind a feature flag is planned but
  not shipped.

## Stability

Experimental. The `req`/`ens` syntax and ILO-W030 diagnostic may change in a
future release. Contracts do not affect programs that don't declare them.
