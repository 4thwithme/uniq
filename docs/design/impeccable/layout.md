---
title: layout
oneliner: The /impeccable layout command fixes spacing, visual hierarchy, grid structure, rhythm, and density problems without touching content.
date: 2026-08-08
tags: [design-tooling, cli, impeccable]
compiled_from:
  - raw/impeccable-style/docs/layout.md
related:
  - "[[overview]]"
  - "[[commands-index]]"
---

# layout

> Fix layout, spacing, and visual rhythm.

## Key Takeaways

- `/impeccable layout` targets pages that are "technically fine but not breathing" — equal padding everywhere, monotonous card grids, edge-to-edge content, hierarchy that relies on size alone rather than real structure.
- It evaluates five dimensions: spacing consistency, visual hierarchy (does the eye land on the primary action within 2 seconds), grid/structure, rhythm (alternation between tight and generous spacing), and density.
- Typical fixes: unify the spacing scale (e.g. 8/16/24/48/96px), introduce asymmetry, collapse monotonous grids into a mixed hero + supporting-elements layout, and give the primary action real space.
- If the underlying issue is "too many things" rather than arrangement, this is the wrong command — reach for `/impeccable distill` first.
- If the layout has no grid at all, expect a larger-than-usual diff since one has to be built from scratch.
- If the tool's hierarchy verdict is "nothing is primary," no amount of spacing work fixes that — it requires a content decision, not a layout tweak.
- Combines with `distill` and `adapt`.

## When to use it

`/impeccable layout` is for pages where nothing is technically wrong but nothing is breathing either. Equal padding everywhere, monotonous card grids, content that runs edge to edge, hierarchy that relies on size alone. Reach for it when a layout "feels off" and you cannot articulate why.

Good triggers: "everything feels crowded", "it reads like a wall", "I do not know where to look first".

## How it works

The skill runs through five layout dimensions:

1. **Spacing**: is the spacing scale consistent or are there random 13px gaps, are related elements grouped tightly with generous space between groups, is there any rhythm at all.
2. **Visual hierarchy**: does the eye land on the primary action within 2 seconds, is the hierarchy doing real work or is everything shouting.
3. **Grid and structure**: is there an underlying grid or is the layout random, are elements aligned to baselines.
4. **Rhythm**: does the page alternate between tight and generous spacing, or is everything uniform.
5. **Density**: is the layout cramped or is it wasteful, does density match the content type.

Fixes usually involve rebuilding the spacing scale, introducing asymmetry, collapsing monotonous grids into a mixed layout with hero and supporting elements, and giving the primary action real space.

## Try it

```
/impeccable layout the settings page
```

Typical changes:

- Spacing scale unified to 8 / 16 / 24 / 48 / 96px
- Section breaks at 48px, row gaps at 16px, form field groups at 8px
- Primary actions pulled out of the form flow with 32px buffer
- Decorative borders removed, replaced with spacing-driven grouping
- Sidebar and main column proportions rebalanced (280 / flex vs 25 / 75)

## Pitfalls

- **Confusing arrange with distill.** If the problem is too many things, run `/impeccable distill` first. Layout is for arranging what is already the right set.
- **Expecting it to rescue a broken grid.** If the page has no grid at all, arrange will build one. Just know that the diff is going to be larger than you expect.
- **Ignoring the hierarchy verdict.** If arrange says "nothing is primary", no amount of spacing work fixes that. You need a content decision, not a layout tweak.

## Related commands

- combines with `distill`
- combines with `adapt`

## Sources

- `raw/impeccable-style/docs/layout.md` — full `/impeccable layout` documentation page, re-extracted verbatim from page HTML (source: https://impeccable.style/docs/layout)

<!-- updated: 2026-08-08 -->
