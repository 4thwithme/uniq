---
title: typeset
oneliner: The /impeccable typeset command rebuilds typography — font choice, hierarchy, scale, and readability — when text reads as default rather than designed.
date: 2026-08-08
tags: [design-tooling, cli, impeccable]
compiled_from:
  - raw/impeccable-style/docs/typeset.md
related:
  - "[[overview]]"
  - "[[commands-index]]"
---

# typeset

> Fix typography that feels generic, inconsistent, or accidental.

## Key Takeaways

- `/impeccable typeset` targets "default typography" symptoms: muddy hierarchy, sizes that look the same, 14px body copy, a "display font" that is just Inter bold, no kerning attention. Common trigger phrases: "hierarchy feels flat", "readability is off", "fonts look generic".
- Assesses five dimensions: font choices (invisible defaults like Inter/Roboto/Arial/Open Sans, brand match, family count), hierarchy (size contrast ≥1.25x between steps, legible weight contrast), sizing/scale (coherent scale, 16px body minimum, fixed-rem for apps vs. fluid-clamp for marketing), readability (45–75 character line length, tuned line-height, contrast), and consistency (no one-off `font-size` overrides).
- Fix pattern: pick distinctive typefaces, build a modular scale, widen hierarchy contrast, set proper line length and leading.
- Font selection is context-dependent: typeset reads brand voice from `PRODUCT.md`; without having run `/impeccable init` first, suggestions default to generic.
- Fixed-rem scales are used for app UIs; fluid-clamp scales are reserved for marketing/content pages where line length varies dramatically — do not expect fluid clamp on app interfaces.
- If the real issue is spacing/density rather than the type itself, use `/impeccable layout` instead.
- Combines with `bolder` and `polish`.

## When to use it

Reach for `/impeccable typeset` when the text on a page looks like default typography instead of designed typography. Muddy hierarchy, three sizes that look the same, body copy at 14px, a display font that is actually just Inter bold, headlines with no kerning attention.

Common triggers: "hierarchy feels flat", "readability is off", "fonts look generic".

## How it works

The skill assesses typography across five dimensions:

1. **Font choices**: are you using invisible defaults (Inter, Roboto, Arial, Open Sans), does the typeface match the brand, are there more than 2 to 3 families.
2. **Hierarchy**: are heading, body, and caption clearly different at a glance, is the size contrast at least 1.25x between steps, are weight contrasts legible.
3. **Sizing and scale**: is there a coherent type scale, does body text meet 16px minimum, is the scale fixed-rem for app UIs or fluid-clamp for marketing pages.
4. **Readability**: line length 45 to 75 characters, line-height tuned for font and context, contrast.
5. **Consistency**: same element uses same treatment everywhere, no one-off font-size overrides.

It then fixes what it finds: picks distinctive typefaces, builds a modular scale, widens hierarchy contrast, sets proper line length and leading.

## Try it

```
/impeccable typeset the article layout
```

Expected diff:

- Display font swapped from Inter 700 to a real display face
- Type scale rebuilt: 3rem / 2rem / 1.25rem / 1rem / 0.875rem, ratio 1.333
- Body text bumped from 14px to 16px
- Line length clamped to 68ch on the article column
- Line-height 1.6 for body, 1.1 for display
- Removed four one-off `font-size` values scattered in component styles

## Pitfalls

- **Asking for a new font without context.** Typeset will pick based on the `PRODUCT.md` brand voice. If you have not run `/impeccable init`, the suggestion will be generic.
- **Reaching for typeset when the issue is layout.** If paragraphs are fine but the page feels cramped, you want `/impeccable layout`.
- **Expecting fluid clamp scales on app UIs.** Typeset uses fixed rem scales for app interfaces. Fluid typography is for marketing and content pages where line length varies dramatically.

## Related commands

- combines with `bolder`
- combines with `polish`

## Sources

- `raw/impeccable-style/docs/typeset.md` — full `/impeccable typeset` documentation page, re-extracted verbatim from page HTML (source: https://impeccable.style/docs/typeset)

<!-- updated: 2026-08-08 -->
