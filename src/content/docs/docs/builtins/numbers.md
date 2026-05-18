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
| `rnd` | `n n > n` | Round to N decimal places | `rnd 3.14159 2` -> `3.14` |

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

## Conversions

| Function | Signature | Description | Example |
|----------|-----------|-------------|---------|
| `str` | `_ > t` | Convert to string | `str 42` -> `"42"` |
| `num` | `t > n` | Parse string to number | `num "42"` -> `42` |

## Aliases

| Long form | Short form |
|-----------|------------|
| `average` | `avg` |
| `floor` | `flr` |
| `ceil` | `cel` |
| `round` | `rnd` |
| `number` | `num` |
| `string` | `str` |
