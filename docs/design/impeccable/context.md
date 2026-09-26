---
title: Design Context
oneliner: How Impeccable's PRODUCT.md, DESIGN.md, per-surface briefs, and generated design.json give it enough project memory to make specific design decisions.
date: 2026-08-08
tags: [design-tooling, cli, impeccable]
compiled_from:
  - raw/impeccable-style/docs/context.md
related:
  - "[[overview]]"
  - "[[commands-index]]"
  - "[[getting-started]]"
  - "[[config]]"
  - "[[new-work]]"
---

# Design Context

> Give Impeccable enough project memory to make specific design decisions.

## Key Takeaways

- Without context, Impeccable infers audience, tone, palette, type, and component rules from code alone — this usually produces safer, more generic answers. Generic advice is the symptom of missing/vague/stale context.
- Four context locations: **`PRODUCT.md`** (strategy), **`DESIGN.md`** (visual system), **`.impeccable/surfaces/`** (per-page briefs), **`.impeccable/design.json`** (generated, do not hand-edit).
- Four **modes** determine treatment of a surface: **Persuade** (landing/marketing/pricing), **Operate** (apps/dashboards/admin), **Read** (docs/guides/changelogs), **Experience** (portfolios/galleries). Mode comes from the page's job, not what the company sells.
- Modes replace the old v3 brand/product "register" axis: Brand → Persuade, Product → Operate; Read and Experience are new.
- Platform values: `web` (default), `ios` (Apple HIG), `android` (Material Design 3), `adaptive` (both, alpha). Native support overall is alpha — Live Mode, the detector, and the design hook all require a browser/HTML and sit out on native projects.
- Refresh triggers: `/impeccable init` for audience/positioning/platform/evidence/brand changes; `/impeccable document` for palette/type/component/radius/rule changes or when a hook flags `DESIGN.md` newer than `.impeccable/design.json`. `/impeccable doctor` reports what's stale on demand.
- Precedence when docs and code disagree: `PRODUCT.md` wins on durable product/voice decisions; `DESIGN.md` wins on visual decisions; a surface brief wins on that page's strategy; existing code still matters and stronger/newer real conventions are preserved over stale docs.
- When `DESIGN.md` exists, three additional detector rules unlock: `design-system-font`, `design-system-color`, `design-system-radius`.

## The Fast Path

Run the setup once from your project root:

```
/impeccable init
```

That creates `PRODUCT.md`, the strategy file. At the end, say yes when Impeccable offers to run:

```
/impeccable document
```

That creates `DESIGN.md`, the visual-system file, plus a generated helper at `.impeccable/design.json`. Review the two markdown files. Edit anything that does not match the real product.

| File | Role | Contents |
|---|---|---|
| **PRODUCT.md** | Strategy | Platform, users, purpose, positioning, evidence, brand commitments |
| **DESIGN.md** | Visual system | Colors, type, components, radii, design rules |
| **.impeccable/surfaces/** | Per surface | One page's mode, job, proof sequence, and chosen direction |
| **.impeccable/design.json** | Generated | Structured metadata for automation. Do not hand-edit |
| **Commands, hooks, detector, Live Mode** | Consumers | More specific edits, better audits, fewer false assumptions |

## What Goes Where

| File | What it should answer | Update it when |
|---|---|---|
| `PRODUCT.md` | What platform is this? Who is it for? What does the product do, and what claim could a neighbor not copy? What real evidence and brand commitments exist? | Platform, audience, positioning, purpose, constraints, evidence, or brand commitments change. |
| `DESIGN.md` | What colors, type stacks, component treatments, radii, elevation, and visual rules are allowed? | Palette, typography, components, tokens, spacing/radius scales, or design rules change. |
| `.impeccable/surfaces/*.md` | For one page or route: what mode is it, what job does it do, what proof does it show, and which direction was chosen? | Written by the work itself. Edit it when a page's strategy changes. |
| `.impeccable/design.json` | What structured design data should automation use? | Do not edit it directly. Refresh it by running `/impeccable document`. |

The markdown files are the files you own. The generated JSON helps the detector, hooks, and Live Mode read the design system precisely.

## Scope Your Request to One Surface

The judgment that changes Impeccable's output most is what the visitor came to the page to **do**. It reads that from the surface you named, so the useful habit is naming one:

```
/impeccable polish the marketing homepage
/impeccable audit the billing settings
```

Those get different treatment because they are different jobs, not because you configured anything. A marketing page has to earn attention; a settings screen has to disappear. One project usually holds several kinds, which is why this is decided per surface rather than set once for the whole repo.

### The Four Modes

Impeccable names four, and picks from the surface in front of it:

- **Persuade.** The visitor decides and acts: landing pages, marketing, campaigns, pricing. Design is the product, so it has to earn attention. Distinctive type, committed palette, image-led openings.
- **Operate.** The visitor completes a task: app UI, dashboards, editors, admin, tools. Density, predictable controls, readable states, stable navigation, quieter motion. Brand lives in precise details.
- **Read.** The visitor understands something: docs, guides, help, changelogs. Comprehension first, then a reading experience worth staying in.
- **Experience.** The visitor is inside the work: portfolios, galleries, showcases. The artifact leads and the interface recedes.

The mode comes from the surface, **not from what the company sells**. A developer tool's landing page is still Persuade. A fashion house's documentation is still Read. A docs index is Read, not Persuade.

Name it explicitly only when a page is genuinely ambiguous. Once resolved, it is recorded in that surface's brief under `.impeccable/surfaces/`.

**Upgrading from v3?** Modes replace the old brand/product **register**. Brand maps to Persuade, product maps to Operate, and Read and Experience are the two cases the old split had nowhere to put.

A leftover `## Register` heading in `PRODUCT.md` is no longer read, and `/impeccable doctor` will find it and offer to delete it. Worth accepting: a retired axis left in the file is the kind of thing that reads as still meaningful to the next person.

### Native Apps: iOS, Android, and Adaptive (Alpha)

If you build for the web, skip this. `PRODUCT.md` carries a `## Platform` line, and `/impeccable init` works the value out while it scans your project, asking only when the evidence is ambiguous. A missing field means `web`.

| Value | Means |
|---|---|
| `web` | A website or web app, including responsive mobile web. The default. |
| `ios` | A native iOS or iPadOS app. Loads the Apple HIG guidance. |
| `android` | A native Android app. Loads Material Design 3 guidance. |
| `adaptive` | One Flutter, React Native, or KMP codebase that genuinely adapts per OS. Loads both. |

On a native platform, `audit` and `adapt` run native passes covering VoiceOver, TalkBack, touch targets, and platform conformance instead of CSS.

**Native support is alpha.** Live Mode, the detector, and the design hook all read a browser or parse HTML, so they sit out on a native project. Mobile web stays `web`, and a native wrapper around a website does not make its design language native.

## How Context Changes the Output

With context loaded, Impeccable can:

- preserve the right identity instead of "improving" it into something generic;
- pick the right standard for the surface, whether that is a Persuade page that has to land or an Operate screen that has to disappear;
- replace hardcoded visual choices with documented tokens and components;
- flag drift, such as fonts, colors, or border radii outside `DESIGN.md`;
- keep Live Mode variants aligned with the system instead of inventing new palettes.

The context does not replace judgment. Existing code still matters, and an intentional exception can be documented with a detector ignore. See [[config]].

## Keeping Context Fresh

| Change in the project | Run |
|---|---|
| New audience, positioning, product purpose, platform, evidence, or brand commitments | `/impeccable init` |
| New palette, type stack, component primitives, radius scale, or design rules | `/impeccable document` |
| A hook says `DESIGN.md` is newer than `.impeccable/design.json` | `/impeccable document` |
| One-off intentional detector finding | Add a narrow ignore with `/impeccable hooks ignore-value` or `npx impeccable ignores`. |
| You are not sure what has fallen behind | `/impeccable doctor` |

Impeccable also checks these files at the start of a session and mentions what looks stale, at most once a week per project. `/impeccable doctor` is the same report on demand, with the expensive checks added.

Treat context files like any other design artifact: review them in code review when they change, and update them when the product changes.

## Details When the Default Path Is Not Enough

### Where Impeccable Looks for Context Files

For normal projects, put `PRODUCT.md` and `DESIGN.md` in the project root.

Skill commands look in the root first. If root context is missing, they also check `.agents/context/` and `docs/`.

In a monorepo, each workspace child resolves its own `PRODUCT.md` and `DESIGN.md` first, then falls back to the repo root per file. Project boundaries come from package-manager workspace declarations, or from `projectRoots` globs in `.impeccable/config.json` when no package manager declares them. See [[config]].

The detector's design-system rules use the same root-first behavior for `DESIGN.md`. For generated design metadata, the primary path is `.impeccable/design.json`. Legacy `DESIGN.json` files are still accepted as fallbacks, but new projects should use `.impeccable/design.json`.

### What Happens When Docs and Code Disagree

`PRODUCT.md` wins on durable product and voice decisions: platform, audience, positioning, constraints, evidence, and brand commitments.

`DESIGN.md` wins on visual decisions: color, typography, radius, elevation, component behavior, and system-specific do/don't rules.

A surface brief in `.impeccable/surfaces/` wins on that one page's strategy: its mode, its job, the proof sequence, and the direction that was chosen for it.

Existing code still matters. Commands read project files before editing and preserve real conventions when they are stronger or newer than the docs. A stale `DESIGN.md` is a signal to refresh the docs, not permission to ignore the implementation.

### Which Detector Rules Unlock When DESIGN.md Exists

When `DESIGN.md` exists, `npx impeccable detect` and the design hook unlock design-system checks:

- `design-system-font` flags primary fonts not declared in `DESIGN.md` typography.
- `design-system-color` flags literal colors outside the documented palette or sidecar ramps.
- `design-system-radius` flags border-radius values outside the documented rounded scale.

These rules do not run when `DESIGN.md` is absent, when config disables design-system checks, or when you pass `--no-design-system` to the detector. See [[config]] (Detector CLI).

## Sources

- `raw/impeccable-style/docs/context.md` — full reference text: the fast path, file table, four modes, native platform table, context-freshness rules, and lookup/precedence/detector-rule details

<!-- updated: 2026-08-08 -->
