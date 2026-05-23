---
title: Tools
description: Use this when integrating ilo with MCP servers, Agent Skills, or JSON-mode for agent-driven sessions.
---

Use this when integrating ilo with MCP servers, Agent Skills, or JSON-mode for agent-driven sessions.

## Agent Skills

ilo can be installed as a skill in **Claude Code** and **Claude Co-work**, giving any conversation the ability to write, run, and debug ilo programs on demand.

### Claude Code

```bash
ilo skill install
```

This creates a skill at `~/.claude/skills/ilo/SKILL.md` that Claude Code picks up automatically. Once installed, invoke it with `/ilo` or just mention ilo code in conversation.

The skill provides:

- Write ilo programs from natural-language descriptions
- Run inline expressions and `.ilo` files
- Debug errors using `ilo --explain`
- Convert code from other languages into ilo
- Load the full spec with `ilo help ai`

### Example

```
> /ilo fibonacci function that returns the nth number

ilo 'fib n:n>n;<=n 1 n;a=fib -n 1;b=fib -n 2;+a b' 10
# 55
```

### Manual installation

If you prefer to install the skill by hand, create `~/.claude/skills/ilo/SKILL.md`:

```yaml
---
name: ilo
description: "Write, run, debug, and explain programs in the ilo programming language."
argument-hint: "[task or code description]"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---
```

Then add the ilo quick reference below the frontmatter. Run `ilo help ai` to get the compact spec to paste in.

### Claude Co-work

Claude Co-work (multi-agent coding sessions) works the same way. Once the skill is installed, any agent in the session can use ilo.

### Other agents

Any agent that can run shell commands can use ilo. The key ingredients:

1. **Install ilo**, `curl -fsSL https://raw.githubusercontent.com/ilo-lang/ilo/main/install.sh | sh`
2. **Load the spec**, `ilo help ai` returns a compact reference the agent can use as context
3. **Use JSON mode**, pass `-j` for structured output the agent can parse

## MCP servers

ilo can connect to any [MCP server](https://modelcontextprotocol.io), with tools type-checked end-to-end before execution.

### Configuration

Create an `mcp.json` file:

```json
{
  "mcpServers": {
    "myserver": {
      "command": "node",
      "args": ["server.js"],
      "env": {}
    }
  }
}
```

### Usage

```bash
ilo --mcp mcp.json program.ilo funcname args
```

MCP tools become callable functions in your ilo program, with types verified at load time.

See `examples/mcp.json` in the [ilo repo](https://github.com/ilo-lang/ilo/tree/main/examples) for a working example.

## REPL JSON mode

The `-j` flag switches ilo output to structured JSON, ideal for agents that need to parse results programmatically.

### Interactive REPL

```bash
ilo repl -j
```

Every response is a single JSON object on one line:

**Success:**
```json
{"ok": 10}
```

**Error:**
```json
{"code": "ILO-T004", "message": "undefined variable 'y'", "severity": "error", "suggestion": "did you mean 'x'?"}
```

### Inline expressions

The `-j` flag also works outside the REPL:

```bash
ilo 'dbl x:n>n;*x 2' -j 5
```

```json
{"ok": 10}
```

### Why this matters for agents

Agents cannot reliably parse human-formatted output. With `-j`:

- **No ambiguity**, success is `{"ok": value}`, errors have structured `code`/`message`/`suggestion` fields
- **Error recovery**, the agent reads the `suggestion` field and retries automatically
- **Stateful sessions**, the REPL keeps function definitions across lines, so the agent can build up a program incrementally and test each step

### Agent workflow example

A typical agent loop using `repl -j`:

```
1. Agent sends:  dbl x:n>n;*x 2
   ilo returns:  {"ok": "defined dbl"}

2. Agent sends:  dbl 5
   ilo returns:  {"ok": 10}

3. Agent sends:  dbl "hello"
   ilo returns:  {"code": "ILO-T003", "message": "expected n, got t", ...}

4. Agent reads error, adjusts, retries
```

## Combining

Skills, MCP servers, and HTTP tools compose. An agent can write ilo programs that call external services, all within a single conversation. See [HTTP](/docs/builtins/http/) for the HTTP-specific tool config.
