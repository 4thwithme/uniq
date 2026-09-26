---
title: Impeccable CLI — /impeccable document
oneliner: Generates a spec-compliant DESIGN.md (Google Stitch format, six fixed sections) plus a machine-readable design.json sidecar so every AI agent stays on-brand.
date: 2026-08-08
tags: [design-tooling, cli, impeccable]
compiled_from:
  - raw/impeccable-style/docs/document.md
related:
  - "[[overview]]"
  - "[[commands-index]]"
  - "[[extract]]"
  - "[[init]]"
---

# Impeccable CLI — /impeccable document

> Generate a spec-compliant DESIGN.md that captures your visual system so every AI agent stays on-brand.

## Key Takeaways

- `DESIGN.md` follows the **Google Stitch format** with six fixed sections: Overview, Colors, Typography, Elevation, Components, and Do's and Don'ts.
- A machine-readable `.impeccable/design.json` sidecar is generated alongside the human-readable `DESIGN.md`.
- Run it once your visual system has colors, typography, at least a button and a card — after `/impeccable init`, when other commands (Live, polish, new-work) reference DESIGN.md, when design has drifted from an outdated DESIGN.md, or to snapshot state before a major redesign.
- Scan priority order for finding existing tokens: CSS custom properties → Tailwind config → CSS-in-JS themes → design token files → component source → global stylesheet → computed styles.
- For fresh projects with nothing implemented yet, `/impeccable document --seed` asks five strategic questions (color strategy, type direction, motion style, references, anti-references) and writes a scaffold marked with `<!-- SEED -->` comments instead of extracting from code.
- Pitfall: DESIGN.md is primarily for AI agents, not human-only documentation — don't add non-standard sections (Layout, Motion, Responsive) or silently overwrite an existing DESIGN.md.

## When to Use It

Run `/impeccable document` once your visual system includes colors, typography, at least a button and a card. The command extracts tokens and component patterns, writing a spec-compliant file at project root.

Use it when:

- After running `/impeccable init`
- Commands suggest it (Live, polish, new-work workflows reference DESIGN.md)
- Design drifts from an outdated DESIGN.md
- Capturing current state before major redesign

## How It Works

The tool reads code and extracts design elements automatically, then asks grouped questions about system purpose, including metaphors and component character. Output includes both a human-readable `DESIGN.md` and a machine-readable `.impeccable/design.json`.

**Scan priority:** CSS custom properties → Tailwind config → CSS-in-JS themes → design token files → component source → global stylesheet → computed styles.

## Seed Mode

For fresh projects: `/impeccable document --seed` asks five strategic questions (color strategy, type direction, motion style, references, anti-references) and generates a scaffold marked with `<!-- SEED -->` comments.

## Try It

```
/impeccable document
```

```
/impeccable document --seed
```

## Pitfalls

- Running too early without implemented tokens
- Treating DESIGN.md as human-only documentation (it's primarily for AI agents)
- Adding non-standard sections (Layout, Motion, Responsive)
- Silently overwriting existing DESIGN.md

## Sources

- `raw/impeccable-style/docs/document.md` — full page content for `/impeccable document` (DESIGN.md spec, when to use it, scan priority, seed mode, pitfalls)
