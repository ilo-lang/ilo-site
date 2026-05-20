---
title: Crypto and encoding
description: Use this when hashing, signing, encoding, or verifying secrets in ilo. Covers sha256, hmac-sha256, base64, hex, and ct-eq.
---

Use this when hashing, signing, encoding, or verifying secrets. All crypto builtins are tree-bridge eligible: pure text/bytes operations with no I/O, so VM and Cranelift inherit them automatically.

## Hashing

| Function | Signature | Description |
|----------|-----------|-------------|
| `sha256` | `t > t` | SHA-256 hex digest (lowercase, 64 chars) of the UTF-8 bytes of `s` |
| `hmac-sha256` | `t t > t` | HMAC-SHA256 of `body` under `key`, returns lowercase hex |

```ilo
sha256 ""             -- e3b0c44298fc1c149afbf4c8996fb924...
sha256 "abc"          -- ba7816bf8f01cfea414140de5dae2223...
len (sha256 "x")      -- 64 (always)

hmac-sha256 "secret" "payload"   -- lowercase hex digest
```

`sha256` always returns a 64-character lowercase hex string. Input is always treated as text (UTF-8 bytes).

`hmac-sha256` is the standard choice for webhook signature verification and API request signing. Use `ct-eq` (not `==`) to compare the result against an untrusted value.

## Constant-time comparison

| Function | Signature | Description |
|----------|-----------|-------------|
| `ct-eq` | `t t > b` | Constant-time text equality - no timing side-channel |

```ilo
-- Webhook signature verification
verify sig:t body:t>b
  expected=hmac-sha256 "secret" body
  ct-eq expected sig
```

Always use `ct-eq` instead of `==` when comparing secrets (HMAC digests, tokens, API keys). `==` short-circuits on the first differing byte, which leaks timing information that an attacker can exploit. `ct-eq` always reads every byte.

## Base64 encoding

| Function | Signature | Description |
|----------|-----------|-------------|
| `base64-enc` | `t > t` | Standard base64 encode (RFC 4648 section 4, with `=` padding) |
| `base64-dec` | `t > R t t` | Standard base64 decode; Err on invalid input |
| `base64url-enc` | `t > t` | Base64url encode (RFC 4648 section 5, no padding, URL-safe alphabet) |
| `base64url-dec` | `t > R t t` | Base64url decode; Err on invalid input |

```ilo
base64-enc "hello"                     -- "aGVsbG8="
base64-dec! (base64-enc "hello")       -- "hello"

base64url-enc "hello"                  -- "aGVsbG8" (no padding)
base64url-dec! (base64url-enc "hello") -- "hello"
```

`base64-dec` and `base64url-dec` return `R t t`. Use `!` to auto-unwrap or handle the `Err` arm for invalid input. The Ok branch holds a decoded text string (valid UTF-8); non-UTF-8 decoded bytes always Err.

Use `base64-enc`/`base64-dec` for standard (padded) base64. Use `base64url-enc`/`base64url-dec` for URL-safe base64 (JWT headers, URL parameters).

## Hex encoding

| Function | Signature | Description |
|----------|-----------|-------------|
| `hex-enc` | `L n > t` | Encode list of integers 0-255 as lowercase hex string |
| `hex-dec` | `t > R (L n) t` | Decode hex string to list of byte values 0-255; Err on invalid input |

```ilo
hex-enc [104 101 108 108 111]   -- "68656c6c6f"
hex-dec! "68656c6c6f"           -- [104, 101, 108, 108, 111]
```

`hex-enc` takes a list of integers in the range 0-255. Values outside this range produce ILO-R009. `hex-dec` accepts upper- or lowercase hex; odd-length or non-hex input returns `Err`.

## Common patterns

**Webhook verification (GitHub-style):**

```ilo
verify sig:t body:t>b
  expected=hmac-sha256 "your-secret" body
  ct-eq expected sig
```

**JWT header construction:**

```ilo
header=base64url-enc (jdmp (pt alg:"HS256" typ:"JWT"))
payload=base64url-enc (jdmp data)
```

**Round-trip check:**

```ilo
s="hello world"
base64-dec! (base64-enc s)   -- "hello world"
```
