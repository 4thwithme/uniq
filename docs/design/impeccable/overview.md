---
title: Impeccable CLI — Overview
oneliner: A CLI design tool for AI coding agents that structures design work into four phases — establish context, iterate, pre-ship harden, and prevent drift — across four distinct design "modes."
date: 2026-08-08
tags: [design-tooling, cli, impeccable, ai-agents]
compiled_from:
  - raw/impeccable-style/designing.md
related:
  - "[[impeccable-cli/commands-index]]"
---

# Impeccable CLI — Overview

> A command-line design tool, built for AI coding environments, that turns "make it look good" into a repeatable four-phase workflow instead of one-off prompting.

## Key Takeaways

- Impeccable's core loop has 4 phases: **establish context → iterate/refine → pre-ship harden → prevent drift**. Each phase maps to its own command group (see [[impeccable-cli/commands-index]]).
- Context comes from `/impeccable init`, which scans the codebase and generates **visual references** (not a long written brief) plus a `PRODUCT.md` file capturing platform, audience, and positioning.
- Iteration splits into two styles: **named-discipline commands** (typography, layout, color, motion — one lever at a time) vs. **Live Mode**, a point-and-click visual editor with three production variants.
- Pre-ship is a 3-command "gauntlet": accessibility/performance scoring, audience-fit copy rewriting, and stress-testing with realistic data.
- Design-debt prevention is split across `/extract` (find repeated patterns → consolidate into tokens) and `/document` (scan components/routes → keep design docs current) — the tool treats design-system drift as an ongoing maintenance problem, not a one-time setup step.
- The tool recognizes 4 distinct **design modes** and adjusts its own vocabulary/recommendations per mode: persuasive landing pages, operational/task-focused UIs, readable documentation, and immersive experiences — implying the same command (e.g., `/colorize`) behaves differently depending on which mode the surface is in.

## The Four-Phase Core Loop

1. **Establish context** — `/impeccable init` → `PRODUCT.md` + visual references
2. **Iterate** — discipline-specific commands or Live Mode
3. **Pre-ship harden** — accessibility/performance audit, copy rewrite, stress test
4. **Prevent drift** — `/extract` (tokens) and `/document` (docs)

## Four Design Modes

| Mode | Focus |
|---|---|
| Persuasive | Landing pages — conversion-oriented |
| Operational | Task-focused interfaces — efficiency-oriented |
| Documentation | Readable, scannable technical content |
| Immersive | Experience-first, less conventional UI |

## Sources

- `raw/impeccable-style/designing.md` — full overview page content
- See [[impeccable-cli/commands-index]] for the full command reference (init, shape, audit, critique, animate, bolder, colorize, delight, layout, overdrive, quieter, typeset, adapt, clarify, distill, harden, onboard, optimize, polish, document, extract, live, plus tutorials and core-concept docs)

<!-- updated: 2026-08-08 -->
