---
title: Numbers
description: Use this when doing arithmetic, comparisons, aggregation, or numeric conversions.
---

Use this when doing arithmetic, comparisons, aggregation, or numeric conversions.

## Arithmetic operators

| Operator | Description | Example | Result |
|----------|-------------|---------|--------|
| `+` | Add | `+3 4` | `7` |
| `-` | Subtract | `-10 3` | `7` |
| `*` | Multiply | `*3 4` | `12` |
| `/` | Divide | `/10 2` | `5` |
| `%` | Modulo | `%10 3` | `1` |

## Comparison operators

| Operator | Description | Example |
|----------|-------------|---------|
| `==` | Equal | `==a b` |
| `!=` | Not equal | `!=a b` |
| `>` | Greater than | `>a b` |
| `<` | Less than | `<a b` |
| `>=` | Greater or equal | `>=a b` |
| `<=` | Less or equal | `<=a b` |

All comparisons return `b`.

## Logic

| Operator | Description | Example |
|----------|-------------|---------|
| `&` | Logical AND | `&a b` |
| `\|` | Logical OR | `\|a b` |
| `!` | Logical NOT | `!a` |

## Math

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `abs` | `n > n` | Absolute value | `abs -5` -> `5` |
| `flr` | `n > n` | Floor | `flr 3.7` -> `3` |
| `cel` | `n > n` | Ceiling | `cel 3.2` -> `4` |
| `rou` | `n > n` | Round to nearest integer (banker's rounding) | `rou 3.7` -> `4` |
| `rnd` | `> n` | Random float in `[0, 1)`. Aliases: `rand`, `random`. Read this as random, not round; for rounding use `rou`. | `rnd` -> `0.42…` |
| `rnd` | `n n > n` | Random integer in `[a, b]` inclusive | `rnd 1 6` -> dice |
| `rndn` | `n n > n` | One sample from N(mu, sigma) (Box-Muller) | `rndn 0 1` -> `0.34…` |
| `seed` | `n > _` | Set the shared PRNG state (SplitMix64). All subsequent `rnd`/`rndn` on every engine use this state. Default seed is deterministic (no wall-clock). Returns `_`. For entropy: `seed (now-ms)`. | `seed 42` |

## Aggregation

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `sum` | `L n > n` | Sum a list of numbers | `sum [1,2,3]` -> `6` |
| `avg` | `L n > n` | Average of a list of numbers | `avg [2,4,6]` -> `4` |
| `min` | `L n > n` | Minimum element of a numeric list (error if empty) | `min [3,1,4,1,5]` -> `1` |
| `max` | `L n > n` | Maximum element of a numeric list (error if empty) | `max [3,1,4,1,5]` -> `5` |
| `min` | `n n > n` | Minimum of two numbers | `min 3 7` -> `3` |
| `max` | `n n > n` | Maximum of two numbers | `max 3 7` -> `7` |
| `median` | `L n > n` | Median of a numeric list | `median [1,2,3,4,5]` -> `3` |
| `stdev` | `L n > n` | Sample standard deviation (divides by N-1) | `stdev [2,4,4,4,5,5,7,9]` |
| `variance` | `L n > n` | Sample variance (divides by N-1) | `variance [...]` |
| `argmax` | `L n > n` | Index of max element (first occurrence wins on ties; errors on empty) | `argmax [3,1,9,2]` -> `2` |
| `argmin` | `L n > n` | Index of min element (first occurrence wins on ties; errors on empty) | `argmin [3,1,9,2]` -> `1` |
| `argsort` | `L n > L n` | Sorted-index permutation ascending (stable; empty returns `[]`) | `argsort [3,1,2]` -> `[1,2,0]` |

## Conversions

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `str` | `_ > t` | Convert to string | `str 42` -> `"42"` |
| `num` | `t\|n > R n t` | Polymorphic: parse text or identity-wrap a number as Ok. Saves the `num (str x)` roundtrip when `x` may already be numeric (e.g. from `jpar!` on a JSON number) | `num "42"` -> `Ok 42`, `num 42` -> `Ok 42` |

## Aliases

| Long form | Short form |
|-----------|------------|
| `average` | `avg` |
| `floor` | `flr` |
| `ceil` | `cel` |
| `round` | `rou` |
| `random` | `rnd` |
| `rand` | `rnd` |
| `number` | `num` |
| `string` | `str` |
