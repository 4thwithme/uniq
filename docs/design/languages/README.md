# Design Languages

The app ships three parallel design languages with the **same token names**. Pick one in the header dropdown (builder top bar and `/design-system`). Each has dark and light.

| Language | `data-language` | Source | Character |
|---|---|---|---|
| UNIQ Studio (default) | `uniq` | `DESIGN.md` | Quiet pro tool. Barlow Condensed + Instrument Sans, grass green, 2/4px corners, hairlines |
| HEAD | `head` | head.com, measured 2026-09 ([research](head-research.md)) | Inter everywhere, sentence case, warm white `#fdf9f8`, HEAD orange `#d5400a`, 4px controls, square cards, soft layered shadow, 40px controls, Bold buttons |
| Velocity | `velocity` | `no-name-proj` design system (Velocity dashboard) | Fraunces display, Inter body, Geist Mono values, warm cream, soft indigo `#4e6be0` / `#6b8aff`, 6/12px corners, soft shadows, 14px base size |

## How it works

- Attributes on `<html>`: `data-theme` (`dark` / `light`) and `data-language`. Both persist in `localStorage` (`uniq:theme:v1`, `uniq:design-language:v1`).
- UNIQ values: `src/styles/tokens.scss`. Other languages: `src/styles/languages/_<language>.scss`, loaded after it in `global.scss`.
- Each language file has three blocks:
  1. `[data-language='x']` for fonts, type scale, label style, radius, control heights and motion;
  2. `[data-language='x'], [data-language='x'] [data-theme='dark']` for dark colors;
  3. `[data-language='x'][data-theme='light'], [data-language='x'] [data-theme='light']` for light colors (the higher specificity wins over UNIQ).
- Role tokens let a language change style without touching components: `--font-family-label`, `--font-family-numeric`, `--font-weight-label`, `--font-weight-control`, `--tracking-label`, `--text-transform-label`.
- Scene colors stay hex in every language (three.js). `readSceneColors({ theme, language })` re-reads them on change.

## Adding a language

1. Add it to `DESIGN_LANGUAGES` in `src/store/language-store.ts`.
2. Create `src/styles/languages/_<id>.scss` with the three blocks and every themed token (the test lists missing ones).
3. `@use` it in `src/styles/global.scss`, add scene fallbacks in `scene-colors.ts`, add `<id>` to `LANGUAGES` in `design-tokens.test.ts`.
4. Measure contrast (text ≥ 4.5, muted ≥ 4.5, on-accent ≥ 4.5, border-strong ≥ 3) in both themes.
5. Self-host fonts with `@fontsource` and import them in `main.tsx`.

## Notes

- HEAD's commercial `interstate-condensed` (used on their dark pages) is not used. Inter (OFL) is their real main face.
- HEAD dark on-accent is `#121212`: white on `#ed5109` is only 3.6:1.
- Velocity light uses the deeper `#4e6be0` for filled buttons: white on `#6b8aff` fails AA. Borders were made solid (the original used alpha) so contrast is predictable.
- Velocity's glass blur and decorative gradients were not carried over. Components stay the same across languages; only tokens change.
