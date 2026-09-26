---
title: Impeccable CLI — /impeccable audit
oneliner: A five-dimension technical quality check (accessibility, performance, theming, responsive, anti-patterns) scored 0-4 per dimension with P0-P3 severity findings — the implementation-quality counterpart to /impeccable critique.
date: 2026-08-08
tags: [design-tooling, cli, impeccable]
compiled_from:
  - raw/impeccable-style/docs/audit.md
related:
  - "[[overview]]"
  - "[[commands-index]]"
---

# Impeccable CLI — /impeccable audit

> Five-dimension technical quality check with P0 to P3 severity.

## Key Takeaways

- Audit is "the technical counterpart to `/impeccable critique`" — critique evaluates design quality, audit assesses implementation quality.
- Scores five dimensions from 0 to 4: Accessibility, Performance, Theming, Responsive, Anti-patterns — the Anti-patterns dimension runs the same deterministic checks as the Detector CLI (see [[detector]]).
- Every finding gets a severity tag: **P0** blocks release, **P1** should fix this sprint, **P2** next cycle, **P3** polish.
- Audit documents, it does not fix — route findings to `/impeccable harden`, `/impeccable polish`, or `/impeccable optimize` depending on category.
- On native projects (`PRODUCT.md` declares `ios`, `android`, or `adaptive`), the five web dimensions are swapped for a native pass: VoiceOver/TalkBack behavior, Dynamic Type/font scaling, platform-minimum touch targets, and Apple HIG / Material 3 conformance. The deterministic detector has no native equivalent and sits out.
- Output includes an overall score plus a P0-P3 finding-count summary (e.g., `P0:2 P1:5 P2:8 P3:14`).
- Common pitfall: fixing P3s before P0s — the severity scale exists specifically to force top-down triage.

## Example

```
/impeccable audit the checkout flow

src/checkout/**

2.6 / 4

Accessibility 2 / 4
Performance 3 / 4
Theming 2.5 / 4
Responsive 3 / 4
Anti-patterns 2.8 / 4

P0:2 P1:5 P2:8 P3:14
```

Five dimensions scored 0 to 4, each finding tagged P0 (blocks release) to P3 (polish). Audit documents; it doesn't fix. Route the findings into `/impeccable harden`, `/impeccable polish`, or `/impeccable optimize`.

## When to Use It

"`/impeccable audit` is the technical counterpart to `/impeccable critique`." Where critique evaluates design quality, audit assesses implementation quality. It runs accessibility, performance, theming, responsive design, and anti-pattern checks against the implementation, scores each dimension 0 to 4, and produces a plan with P0 to P3 severity ratings.

Use it before shipping, during a quality sprint, or whenever a tech lead says "we should really look at accessibility".

## How It Works

The skill scans your code across five dimensions:

1. **Accessibility**: WCAG contrast, ARIA, keyboard nav, semantic HTML, form labels.
2. **Performance**: layout thrashing, expensive animations, missing lazy loading, bundle weight.
3. **Theming**: hard-coded colors, dark mode coverage, token consistency.
4. **Responsive**: breakpoint behavior, touch targets, mobile viewport handling.
5. **Anti-patterns**: the same deterministic checks the Detector CLI runs.

Each dimension gets a 0 to 4 score. Each finding gets a severity: P0 blocks the release, P1 should fix this sprint, P2 is next cycle, P3 is polish. You get back a single document you can paste into a ticket tracker.

Audit does not fix anything. It documents. Route the findings to `/impeccable polish`, `/impeccable harden`, or `/impeccable optimize` depending on the category.

**On a native project, audit runs a different pass.** When `PRODUCT.md` declares `ios`, `android`, or `adaptive`, the five web dimensions do not apply, so audit swaps to a native version: VoiceOver and TalkBack behavior, Dynamic Type and font scaling, touch targets at platform minimums, and conformance to the Apple HIG or Material 3 conventions your platform is held to. The deterministic detector has no native equivalent and sits out.

## Try It

```
/impeccable audit the checkout flow
```

Expected output:

```
Accessibility: 2/4 (partial)
  P0: Missing form labels on 4 inputs
  P1: Contrast 3.1:1 on disabled button state
  P2: No visible focus indicator on custom dropdown

Performance: 3/4 (good)
  P1: Hero image not lazy-loaded (340KB)
  ...
```

Hand the P0s to `/impeccable harden`, the theming and typography P1s to `/impeccable typeset` and `/impeccable polish`, the rest to `/impeccable polish`.

## Pitfalls

- **Confusing it with `/impeccable critique`.** Audit is implementation quality. Critique is design quality. Run both for a full picture.
- **Fixing P3s before P0s.** The severity scale exists for a reason. Start at the top.
- **Skipping the dimensions you think are fine.** Theming and responsive are the ones most people assume are fine until they are not.

## Related Commands

- Leads to `/impeccable harden`
- Leads to `/impeccable optimize`
- Leads to `/impeccable adapt`
- Leads to `/impeccable clarify`

## Sources

- `raw/impeccable-style/docs/audit.md` — full page content for `/impeccable audit` (example output, when to use it, five-dimension mechanism, native variant, try-it example, pitfalls, related commands)
