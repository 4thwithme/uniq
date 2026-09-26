---
title: Impeccable CLI — /impeccable polish
oneliner: The final pre-ship command that fixes small visual, typographic, interaction, motion, and copy details and pulls a feature back in line with the design system.
date: 2026-08-08
tags: [design-tooling, cli, impeccable]
compiled_from:
  - raw/impeccable-style/docs/polish.md
related:
  - "[[overview]]"
  - "[[commands-index]]"
---

# Impeccable CLI — /impeccable polish

> The meticulous final pass between good and great.

## Key Takeaways

- Run it last, after a feature is functionally complete and nothing is broken but "something still feels off," or when a feature has drifted from the design system.
- It first discovers the design system (tokens, spacing scale, shared components), then replaces hard-coded values with tokens and swaps custom components for shared ones.
- Works across six dimensions: visual alignment/spacing, typography, color/contrast, interaction states, transitions/motion, and copy.
- Explicit rule from the tool itself: "polish is the last step, not the first. If the feature is not functionally complete, polishing it is wasted work."
- A healthy polish run looks like ~5 small fixes, not rewrites — if you're rearchitecting a layout, you wanted `/impeccable critique` or `/impeccable layout` instead.
- Best practice is to run `/impeccable audit` (measurable issues) before `/impeccable polish` (feel-based issues) — use both, not one instead of the other.

## When to Use It

`/impeccable polish` is the last thing you run before shipping. It hunts down the small details that separate a shipped feature from a polished one: half-pixel misalignments, inconsistent spacing, forgotten focus states, loading transitions that flash, copy that drifts in tone. It also aligns the feature with your design system, replacing hard-coded values with tokens, swapping custom components for shared ones, and fixing any drift from established patterns.

Reach for it when the feature is functionally complete, nothing is broken, and something still feels off. Also reach for it when a feature has drifted from the design system and needs to be pulled back in line.

## How It Works

Polish starts by discovering the design system (tokens, spacing scale, shared components), then works methodically across six dimensions:

1. **Visual alignment and spacing**: pixel-perfect grid adherence, consistent spacing scale, optical alignment on icons.
2. **Typography**: hierarchy consistency, line length, widows and orphans, kerning on headlines.
3. **Color and contrast**: token usage, theme parity, WCAG ratios, focus indicators.
4. **Interaction states**: hover, focus, active, disabled, loading, error, success. Every state accounted for.
5. **Transitions and motion**: smooth easing, no layout jank, respect for `prefers-reduced-motion`.
6. **Copy**: consistent voice, correct tense, no placeholder strings, no stray TODOs.

The skill is explicit about one thing: "polish is the last step, not the first. If the feature is not functionally complete, polishing it is wasted work."

## Try It

Command:

```
/impeccable polish the pricing page
```

A healthy run looks like:

```
Visual alignment: fixed 3 off-grid elements (8px baseline)
Typography: tightened h1 kerning, fixed widow on testimonial
Interaction: added hover state on FAQ items, focus ring on email input
Motion: softened modal entrance, added reduced-motion fallback
Copy: removed one "Lorem ipsum" stray, aligned button voice
```

Five small fixes, no rewrites. That is the shape of a good polish pass.

## Pitfalls

- **Polishing work that is not done.** If there are TODOs in the code, you are not ready. Run `/impeccable polish` on finished features only.
- **Treating polish as redesign.** Polish refines what exists. If you find yourself rearchitecting a layout, you needed `/impeccable critique` or `/impeccable layout` instead.
- **Running `/impeccable polish` without `/impeccable audit` first.** Polish catches feel-based issues. Audit catches measurable ones. Use both.

## Sources

- `raw/impeccable-style/docs/polish.md` — full page content for `/impeccable polish` (when to use it, six-dimension mechanism, try-it example, pitfalls)
