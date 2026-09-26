# Design System

Status: **v1 built**. Tokens, 10 base components and a reference page at `/design-system`. The builder UI is built from them.

## Direction

Pro studio tool: quiet, near-neutral chrome so the racket paint is the only loud thing. Grass-green accent, Barlow Condensed display with Instrument Sans body, sharp 2–4px corners, 1px hairlines, one shadow for floating layers. Full rules: root `DESIGN.md` (Google Stitch DESIGN.md format, lint with `npx @google/design.md lint DESIGN.md`). Strategy: root `PRODUCT.md`.

Process follows the impeccable workflow (copied to `docs/design/impeccable/`): `PRODUCT.md` → `DESIGN.md` → tokens → components → surfaces.

## Design Languages

Three languages share one token API: UNIQ Studio (default), HEAD (from head.com) and Velocity (from no-name-proj). Choose one in the header `LanguageSelect` dropdown. Details: `docs/design/languages/README.md`.

## Files

| Path | What |
|---|---|
| `apps/frontend/src/styles/tokens.scss` | Every token. Colors in OKLCH for `[data-theme='dark']` (also `:root`) and `[data-theme='light']`. Scene colors in hex |
| `apps/frontend/src/styles/_mixins.scss` | `visually-hidden`, `caps-label`, `control-transition`, `field-label`, `sunken-input` |
| `apps/frontend/src/styles/design-tokens.ts` | Token catalog (name + usage) used by the page and the token tests |
| `apps/frontend/src/styles/languages/_head.scss`, `_velocity.scss` | Per-language overrides (fonts, scale, radius, controls, motion, dark + light colors) |
| `apps/frontend/src/components/*` | Button, IconButton, SegmentedControl, Select, StepNav, SwatchGrid, FileDrop, Slider, ColorField, TextField, Switch, Panel (with footer), Badge, Kbd, ThemeToggle, LanguageSelect, icons |
| `apps/frontend/src/pages/design-system/` | The `/design-system` page |

## The Page

- Sticky header (logo, title, link to the builder, theme toggle) and section nav.
- Sections: Color, Typography, Spacing, Shape, Elevation, Motion, Components.
- Colors and components render twice, in forced dark and light columns (`data-theme` on the column), so both themes are reviewed at once. Values are read live with `getComputedStyle`.
- The page scrolls inside its own container (the app shell is `overflow: hidden` for the builder).

## Guards (tests)

`src/styles/design-tokens.test.ts` fails when:

- a catalogued token is missing from `tokens.scss`;
- a themed token is missing from any language's dark or light block;
- a `scene-*` token is not a 6-digit hex (three.js cannot parse `oklch()`);
- any `.scss` uses a `var(--…)` that `tokens.scss` does not define;
- any `.scss` outside `tokens.scss` and `styles/languages/` has a literal color.

## Contrast

Measured OKLCH → sRGB → WCAG, both themes: text ≥ 15:1, muted ≥ 6.2:1, on-accent ≥ 6.5:1, accent-text ≥ 6.5:1, border-strong ≥ 3:1, subtle ≥ 4.2:1. Re-measure when a color token changes.
