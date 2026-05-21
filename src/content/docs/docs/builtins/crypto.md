---
title: Crypto and encoding
description: Use this when hashing, signing, encoding, or verifying secrets in ilo. Covers sha256, hmac-sha256, b64, b64u, urlenc, hex, and ct-eq.
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

## Base64url encoding

| Function | Signature | Description |
|----------|-----------|-------------|
| `b64u` | `t > t` | Base64url encode (RFC 4648 section 5, no padding, URL-safe `-`/`_` alphabet). Total. |
| `b64u-dec` | `t > R t t` | Base64url decode; Err on input outside the alphabet, on `=` padding (strict no-pad round-trip), or on non-UTF-8 decoded bytes |

```ilo
b64u "hello"                     -- "aGVsbG8" (no padding)
b64u-dec! (b64u "hello")         -- "hello"
b64u "??>"                       -- "Pz8-" (URL-safe; standard b64 would emit "Pz8+")
```

`b64u-dec` returns `R t t`. Use `!` to auto-unwrap or handle the `Err` arm for invalid input. The Ok branch holds a decoded text string (valid UTF-8); non-UTF-8 decoded bytes always Err.

Use `b64u`/`b64u-dec` for URL-safe base64 (JWT headers, URL parameters, webhook payloads).

## Cryptographic random

| Function | Signature | Description |
|----------|-----------|-------------|
| `rand-bytes` | `n > t` | `n` cryptographically random bytes from the platform CSPRNG (via `getrandom`), encoded as base64url-no-pad. Distinct from `rnd` / `rndn` (seedable, for simulations). Capped at 1 MiB; non-negative `n` only |

```ilo
rand-bytes 16        -- 22-char b64url, 128 bits of entropy (jti / CSRF token)
rand-bytes 32        -- 43-char b64url, 256 bits of entropy (session id)
len (rand-bytes 16)  -- always 22 (output length is deterministic)
```

Use `rand-bytes` for JWT `jti` claims, CSRF tokens, session IDs, and nonces. Output is base64url-no-pad so the result drops into HTTP headers, cookies, and query strings without further encoding. Encoded length is deterministic: `ceil(n * 4 / 3)` characters with the trailing `=` chars stripped. The bytes themselves are unpredictable.

`rand-bytes` is NOT the same as `rnd`. `rnd` is a seedable PRNG suitable for simulations and Monte Carlo work, NOT for tokens or keys. If a value will be checked against an attacker-controlled comparison, reach for `rand-bytes`, never `rnd`.

## URL percent-encoding

| Function | Signature | Description |
|----------|-----------|-------------|
| `urlenc` | `t > t` | RFC 3986 percent-encode; unreserved chars (`ALPHA`/`DIGIT`/`-._~`) pass through, everything else becomes `%HH`. Total. |
| `urldec` | `t > R t t` | Inverse of `urlenc`; Err on invalid percent escape or non-UTF-8 decoded bytes |

```ilo
urlenc "a b&c=d"                 -- "a%20b%26c%3Dd"
urldec! "a%20b%26c%3Dd"          -- "a b&c=d"
urlenc "café"                    -- "caf%C3%A9" (UTF-8 byte-by-byte)
```

Both are tree-bridge eligible (no I/O, no FnRef). The encoder is total; the decoder returns `Result` so malformed input (`"abc%"`, `"abc%2"`, or escapes that decode to invalid UTF-8) surfaces typed at the boundary.

## Standard base64

| Function | Signature | Description |
|----------|-----------|-------------|
| `b64` | `t > t` | Standard base64 encode (RFC 4648 section 4, with `=` padding). Total. |
| `b64-dec` | `t > R t t` | Standard base64 decode; Err on input outside the standard alphabet or on non-UTF-8 decoded bytes |

```ilo
b64 "foobar"            -- "Zm9vYmFy"
b64 "Ma"                -- "TWE=" (one padding char)
b64 "M"                 -- "TQ==" (two padding chars)
b64-dec! "Zm9vYmFy"     -- "foobar"
```

`b64`/`b64-dec` use the standard alphabet (`+`/`/`) with `=` padding. Use these when interoperating with anything that expects RFC 4648 standard base64 (most non-URL contexts). For URL-safe contexts (JWT headers, query strings) use `b64u`/`b64u-dec` instead.

## Hex encoding

| Function | Signature | Description |
|----------|-----------|-------------|
| `hex` | `t > t` | Lowercase hex encode of the UTF-8 bytes of `s`. Every byte produces exactly 2 hex chars. Total. |

```ilo
hex "abc"               -- "616263"
hex ""                  -- ""
len (hex "hello")       -- 10 (every byte → 2 chars)
hex "ñ"                 -- "c3b1" (UTF-8 byte representation)
```

`hex` encodes the raw UTF-8 bytes of the input, not Unicode codepoints. A multi-byte character like `"ñ"` (UTF-8: `0xc3 0xb1`) becomes `"c3b1"`, not its codepoint hex.

## Common patterns

**Webhook verification (GitHub-style):**

```ilo
verify sig:t body:t>b
  expected=hmac-sha256 "your-secret" body
  ct-eq expected sig
```

**JWT header construction:**

```ilo
header=b64u (jdmp (pt alg:"HS256" typ:"JWT"))
payload=b64u (jdmp data)
```

**OAuth query string:**

```ilo
q=cat [(urlenc "client_id") "=" (urlenc cid) "&" (urlenc "redirect_uri") "=" (urlenc ru)] ""
```

**Round-trip check:**

```ilo
s="hello world & friends=42"
urldec! (urlenc s)   -- "hello world & friends=42"
b64u-dec! (b64u s)   -- "hello world & friends=42"
```
