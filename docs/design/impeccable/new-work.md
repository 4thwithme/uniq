---
title: New work
oneliner: How Impeccable classifies a natural-language request as new page/redesign/addition, resolves a visual direction with the user, and evaluates candidate directions before building.
date: 2026-08-08
tags: [design-tooling, cli, impeccable]
compiled_from:
  - raw/impeccable-style/docs/new-work.md
related:
  - "[[overview]]"
  - "[[commands-index]]"
  - "[[context]]"
  - "[[getting-started]]"
---

# New work

> Ask for a new page, a redesign, or an addition. Here is what happens and how you steer it.

## Key Takeaways

- There is no dedicated command — describe the work in natural language and Impeccable infers whether it's a new page, a redesign, or an addition: `/impeccable a pricing page for enterprise customers`, `/impeccable redesign the marketing site`, `/impeccable add a comparison table to the pricing page`.
- This flow is what `/impeccable craft` used to be in v3; the alias still works.
- Impeccable pauses partway through and shows a **direction**: a visual world plus a concrete plan for the first screen, rendered in-browser alongside alternates. Controls: **Deal again** (re-roll, rejected directions never resurface reworded) and **Steer** (one line of feedback, e.g. "too corporate"). Rejecting everything is valid — nothing builds until you pick.
- An explicit brief (named era, material, typeface, palette) always overrides what Impeccable would have chosen on its own.
- Direction is rendered as a system board (palette, type, components) plus a mock of the first screen before code is written — the mock is a reference, not a spec (real copy/responsiveness/accessibility remain implementation decisions, no image is left in the repo).
- Image rendering works out of the box on harnesses with a built-in image tool (Codex, Gemini CLI); otherwise set `OPENAI_API_KEY` and it renders through gpt-image-2, ~5–25 cents per image, and tells you before spending.
- Outputs: `DESIGN.md` (visual system, only when a new one was established) and `.impeccable/surfaces/<page>.md` (that page's strategy: audience, proof, chosen direction). An addition to an existing page changes neither without asking.
- Six job classifications determine how much freedom the work has: Greenfield, Local extension, New surface, Expression expansion, Redesign/rebrand, Refinement.
- Every candidate direction must pass five tests — Truth, Translation, Consequence, Survival, Fit — failing any one is fatal regardless of how well it scores on the others.
- The direction is stated as a ≤150-word comment block at the top of the artifact before code is written: `THESIS`, `OWN-WORLD`, `STORY`, `FIRST VIEWPORT`, `FORM` — this makes intent inspectable for a later audit and lets a roll be reproduced via its seed key.

## Usage Pattern

There is no command for building something new. Describe it and Impeccable takes it from there:

```
/impeccable a pricing page for enterprise customers
/impeccable redesign the marketing site
/impeccable add a comparison table to the pricing page
```

It works out which of those you meant, and how much is allowed to change. A redesign replaces the look. An addition inherits the page it joins. You do not have to say which.

Coming from v3? This is what `/impeccable craft` used to be. The alias still works and adds nothing.

## The One Decision That Is Yours

Partway in, Impeccable stops and asks you to pick a **direction**: a visual world plus a concrete plan for the first screen. In an attended session it opens a page in your browser with the direction it landed on, alternates beside it, and two controls.

- **Deal again.** Not right? Re-roll, as often as you like. Every direction already shown is off the table, so nothing comes back reworded.
- **Steer.** One line about what is missing ("too corporate", "needs to feel like print") and the next round honors it.

Rejecting everything is a valid answer. Nothing gets built until you pick.

If your harness cannot open a browser, the same choice arrives as a normal question prompt.

### Your Brief Always Wins

If you name an era, a material, a typeface, or a palette, that beats whatever Impeccable would have chosen:

```
/impeccable a landing page for our vinyl shop, 1970s hi-fi catalog look, Futura
```

It will not talk you out of that. The direction machinery exists for when you have not said, not to override you when you have.

## It Shows You the Design Before It Builds It

Once you pick, Impeccable renders the direction as a system board (palette, type, components) and a mock of the first screen, then builds toward that image instead of a paragraph of adjectives. Seeing it first measurably improves the result.

This works out of the box on harnesses with a built-in image tool, like Codex or Gemini CLI. Without one, set an OpenAI key and you get the same thing:

```
export OPENAI_API_KEY=sk-...
```

It renders through gpt-image-2 and tells you it is spending your credit before the first image, roughly 5 to 25 cents each. The mock is a reference, not a spec: real copy, responsiveness, and accessibility stay implementation decisions, and no image is left behind in your repo.

## What It Writes Down

- **`DESIGN.md`** gets the visual system when the work established a new one, refreshed after the build so it holds the values the code actually uses.
- **`.impeccable/surfaces/<page>.md`** gets that page's strategy: who it is for, what it must prove, and the direction that won. A later session picks up the argument instead of inventing a new one.

An addition to an existing page changes neither without asking.

## Why Any of This Exists

Ask a coding model for something creative and it builds its favorite idea, every run. Sixteen different "be creative" framings returned the identical concept in thirty of thirty-five runs. It is not a shortage of creativity, it is a shortage of variance: one model has one taste function, so its top-ranked idea always wins.

So the ranking gets broken from outside. A roll decides which of the model's own ideas has to be taken seriously, and deals challengers from a reviewed catalog of 188 visual worlds to compete against them. (See the site's Research page for the full account.)

Challengers are not templates and never get applied as one. Each has to survive translation into your product first, and most lose to a strong idea derived from the product itself. That is the intended outcome.

## Deeper

### How It Decides What Kind of Job This Is

The classification comes first, because it sets how much freedom the work has:

- **Greenfield.** No coherent visual implementation exists. A world gets established.
- **Local extension.** A section or component inside a page that already works. Only the new part gets decided; the page's world is inherited.
- **New surface.** A whole page or flow inside an established world. Composition is open, the world is not.
- **Expression expansion.** An established brand entering a surface family it never resolved. You approve a range, which is merged into `DESIGN.md`.
- **Redesign or rebrand.** The look is replaced. Product facts, content, function, and constraints are not.
- **Refinement.** Better, not different. Leaves this flow for a scoped command like `/impeccable polish`.

Two of these get confused constantly. "Redesign this page" authorizes replacement: the old look becomes evidence and anti-reference. "Redesign this within our current system" is an extension. Impeccable asks once when the wording is genuinely ambiguous, and never splits the difference into polishing a look you asked to be rid of.

### What Counts as Your Existing Design System

Before proposing anything, Impeccable reads `DESIGN.md`, your tokens, your components, and real assets.

**A missing `DESIGN.md` does not make a project greenfield.** Coherent code, type choices, and component behavior are authority whether or not anyone wrote them down. Scaffolds, framework defaults, and stray utility classes are not.

If your implementation is coherent but undocumented, Impeccable extracts the invariants, confirms them with you, and writes `DESIGN.md` before going further. It will not offer you replacement worlds unless you asked for a redesign.

### How a Direction Has to Earn Its Place

Every candidate, whether the model derived it or the roll dealt it, faces five tests. Failing one is fatal no matter how well it does on the others.

- **Truth.** Every relationship it visualizes exists in your product. Resemblance is not evidence.
- **Translation.** Strip the source's names and materials and a product-native relationship remains. Otherwise it is a costume.
- **Consequence.** Removing its best move materially weakens the page. Otherwise it is ordinary craft with a story attached.
- **Survival.** The signature still works on the primary device, within a real asset and time budget.
- **Fit.** Its risk is an honest tradeoff, not a probable violation of your brief.

A candidate still explained by its source object has not been translated, and it loses.

### The Direction Contract, and Reproducing a Roll

Before writing code, the agent states the direction as a comment at the top of the artifact: at most 150 words across five blocks.

- `THESIS`: the one idea this page owns, and the category default it refuses.
- `OWN-WORLD`: the palette and component language, specific enough to recognize with all content removed.
- `STORY`: what the visitor understands, believes, and does.
- `FIRST VIEWPORT`: the exact composition and where the primary action sits.
- `FORM`: the chosen form and the seed key.

It is there so intent is inspectable and so the finishing review can audit the built page against it promise by promise, in a separate agent where your harness allows one. A page that promised a radical composition and shipped the usual template does not pass quietly.

Keep the seed key if you want to reproduce a roll later. It replays the whole thing, including every re-roll round.

### Who May Re-Roll, and on What Grounds

You re-roll freely and for any reason, including taste. After two in a row, Impeccable asks what quality is missing rather than guessing at a third.

The agent may only re-roll on named factual grounds: the assigned direction cannot carry the product's truth or the task. Its own taste is never grounds, which is the whole point of rolling from outside its ranking.

In an unattended run there is nobody to ask, so the assigned direction proceeds and the assumptions get stated explicitly.

## Related

- [[context]] for the files this reads and writes.
- `/impeccable shape` to stop at the brief, with no code.
- The site's Research page for the measurements behind the roll.

## Sources

- `raw/impeccable-style/docs/new-work.md` — full reference text: usage pattern, direction-selection UX, brief-override rule, image-mock generation, output files, rationale (variance/roll mechanism), job classification taxonomy, five-test evaluation criteria, direction-contract comment format, and re-roll rules

<!-- updated: 2026-08-08 -->
