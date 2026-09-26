---
version: alpha
name: uniq studio
description: Quiet pro-tool chrome around a loud 3D racket. Grass green for the one primary action, sharp corners, 1px hairlines.
colors:
  bg: "oklch(16% 0.006 150)"
  surface: "oklch(20% 0.006 150)"
  surface-raised: "oklch(24% 0.007 150)"
  surface-sunken: "oklch(14% 0.005 150)"
  border: "oklch(30% 0.007 150)"
  border-strong: "oklch(50% 0.009 150)"
  text: "oklch(95% 0.004 150)"
  text-muted: "oklch(73% 0.008 150)"
  text-subtle: "oklch(60% 0.008 150)"
  primary: "oklch(72% 0.15 150)"
  accent-hover: "oklch(78% 0.15 150)"
  accent-subtle: "oklch(29% 0.05 150)"
  accent-text: "oklch(80% 0.14 150)"
  on-accent: "oklch(18% 0.03 150)"
  danger: "oklch(70% 0.17 25)"
  warning: "oklch(82% 0.14 80)"
  success: "oklch(78% 0.11 195)"
  scene-bg: "#0e100e"
  scene-grid-cell: "#1d201d"
  scene-grid-section: "#2f3430"
  light-bg: "oklch(97.5% 0.004 150)"
  light-surface: "oklch(99.5% 0.002 150)"
  light-surface-raised: "oklch(95.5% 0.005 150)"
  light-surface-sunken: "oklch(96.5% 0.004 150)"
  light-border: "oklch(89% 0.006 150)"
  light-border-strong: "oklch(62% 0.01 150)"
  light-text: "oklch(22% 0.01 150)"
  light-text-muted: "oklch(46% 0.01 150)"
  light-text-subtle: "oklch(58% 0.01 150)"
  light-primary: "oklch(46% 0.12 152)"
  light-accent-hover: "oklch(40% 0.11 152)"
  light-accent-subtle: "oklch(93% 0.04 150)"
  light-accent-text: "oklch(42% 0.12 152)"
  light-on-accent: "oklch(99% 0 0)"
  light-danger: "oklch(52% 0.19 25)"
  light-warning: "oklch(58% 0.13 65)"
  light-success: "oklch(50% 0.09 200)"
  light-scene-bg: "#edefed"
  light-scene-grid-cell: "#d6dad7"
  light-scene-grid-section: "#bdc3bd"
typography:
  display-lg:
    fontFamily: Barlow Condensed
    fontSize: 2.441rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0.01em
  display-md:
    fontFamily: Barlow Condensed
    fontSize: 1.953rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0.01em
  display-sm:
    fontFamily: Barlow Condensed
    fontSize: 1.5625rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Barlow Condensed
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 0.08em
  body-lg:
    fontFamily: Instrument Sans
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.3
  body-md:
    fontFamily: Instrument Sans
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: Instrument Sans
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.3
  caption:
    fontFamily: Instrument Sans
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.3
rounded:
  none: 0px
  sm: 2px
  md: 4px
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 24px
  "6": 32px
  "7": 48px
  "8": 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-accent}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  button-secondary-hover:
    backgroundColor: "{colors.surface-raised}"
  button-ghost:
    textColor: "{colors.text-muted}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: 32px
  button-pressed:
    backgroundColor: "{colors.accent-subtle}"
    textColor: "{colors.accent-text}"
  button-danger:
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
  input:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text}"
    typography: "{typography.control}"
    rounded: "{rounded.sm}"
    height: 32px
    padding: 0 12px
  segmented-track:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.md}"
  segmented-option-selected:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: 16px
  panel-title:
    textColor: "{colors.text-muted}"
    typography: "{typography.label-caps}"
  badge-accent:
    backgroundColor: "{colors.accent-subtle}"
    textColor: "{colors.accent-text}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    height: 20px
---

## Overview

A pro studio tool, like Figma or Blender, wrapped around a 3D racket. The chrome is quiet, precise and near-neutral so the racket paint is the only loud thing on screen. Neutrals carry a very faint green tint (OKLCH chroma 0.004–0.01 at hue 150) so the whole UI feels of one piece with the brand green without looking green.

Two themes, dark and light, with the same token names. Dark is the default. The theme is set by `data-theme` on `<html>` and can be forced on any element (the design system page renders both side by side). Source of truth: `apps/frontend/src/styles/tokens.scss`. Front-matter color tokens without a prefix are dark, `light-*` are the light values of the same token.

Surfaces are Operate (builder) and Read (design system). No marketing surfaces exist yet.

This file describes the default language, **UNIQ Studio**. Two parallel languages, **HEAD** and **Velocity**, reuse the same token names and components with different values. Users switch between them in the header dropdown. See `docs/design/languages/README.md`.

## Colors

- **Neutrals (bg, surface, raised, sunken, border):** tinted ink and paper. Surface steps are about 4% lightness apart. Borders are hairlines; `border-strong` is the edge of any control and hits 3:1 on surface.
- **Text:** `text` for values and primary copy, `text-muted` for labels (≥ 4.5:1 on every surface), `text-subtle` for placeholders only.
- **Accent, grass green (`primary` in the front matter, `--color-accent` in code):** the court color. Bright green on dark (`72% 0.15 150`), deep Wimbledon green on light (`46% 0.12 152`). It marks the one primary action per view, the focus ring, the active slider thumb and pressed states (`accent-subtle` fill + `accent-text`). Never decoration, never large fills.
- **Status:** danger red, warning amber, success teal. Success is deliberately not brand green, and status is always paired with a word or icon.
- **Scene tokens are hex** (`scene-*`) because three.js cannot parse `oklch()`. They are the only hex colors in the system.
- All pairs were measured (OKLCH → sRGB → WCAG): text ≥ 15:1, muted ≥ 6.2:1, on-accent ≥ 6.5:1, accent-text ≥ 6.5:1, border-strong ≥ 3:1, in both themes.

## Typography

- **Barlow Condensed 500/600** is the display face: page and section titles and uppercase caps labels (panel headers, group titles). Condensed like a scoreboard, used small and sparingly.
- **Instrument Sans (variable 400–700)** is everything else: body, controls, values, inputs. Numbers use `font-variant-numeric: tabular-nums` so hex codes, angles and percentages do not jitter.
- Fixed rem scale, ratio 1.25: 0.75 / 0.875 / 1 / 1.25 / 1.5625 / 1.953 / 2.441 rem. Body is 16px. Dense controls are 14px. Captions and small buttons are 12px.
- Line height 1.1 for display, 1.3 for controls, 1.5 for body. Reading text stays under 68ch.

## Layout

- 4px base spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px (`--space-1` to `--space-8`). Tight inside groups, generous between groups.
- The builder is a full-screen workspace (`100vw × 100dvh`, no page scroll): a header bar, then tools panel, viewport card and themes panel side by side with 12px gaps and a 12px outer margin. Only panel bodies scroll.
- Controls are 28px (sm) or 32px (md) tall. 40px only for touch-first actions.
- The tools panel is 320px and the themes panel 260px. Themes hide under 1100px; under 900px the tools panel moves below the viewport.

## Elevation & Depth

Three levels only:

1. **Sunken:** inputs, tracks and wells. `surface-sunken` + `border-strong`.
2. **Flat:** panels and cards. `surface` + 1px `border` hairline. No shadow.
3. **Float:** layers that pop over other content (dropdown lists, menus). Flat plus `--shadow-float`, the only shadow in the system. Workspace panels and the viewport card are flat.

No blur, no glass, no glow.

## Shapes

- Corners: 0 for scene-edge surfaces, 2px for controls, swatches and badges, 4px for panels, cards and tracks. Nothing rounder, no pills.
- Every border is 1px (`--border-width`).
- Icons: 16px, 1.5px stroke, square caps, `currentColor`.

## Components

Built in `apps/frontend/src/components/`, shown live at `/design-system`.

- **Button:** `primary` (accent fill, one per view), `secondary` (surface + hairline), `ghost` (text only, for toolbars), `danger` (red text, red border on hover). Sizes `sm` 28px and `md` 32px. `aria-pressed` gives the pressed state for toggles.
- **IconButton:** a square Button with a required `label` used as its accessible name and tooltip.
- **SegmentedControl:** a radio group in a sunken track. The selected segment is raised with a strong hairline. Use it for 2–4 exclusive options (finish, fill type, zone).
- **Slider:** label and tabular value on one line, a 2px track and a square accent thumb below.
- **ColorField:** a swatch picker plus a hex input. The hex commits on Enter or blur, Escape reverts, and a bad hex shows an inline error.
- **TextField:** a sunken input with an optional hint. An error replaces the hint and sets `aria-invalid`.
- **Switch:** a square track that fills with accent when on. `role="switch"`.
- **Panel:** a titled region with a caps-label header, optional actions and a scrolling body. `elevation="float"` when it sits over the scene.
- **Badge:** caption-size status with a square dot for non-neutral tones. **Kbd:** keyboard key.
- **Select:** a combobox trigger with a floating listbox (the only floating layer, so it uses `--shadow-float`).
- **StepNav:** numbered steps with `aria-current="step"`. The active step expands its options, and each option shows its current value.
- **SwatchGrid:** a radio group of preview tiles (patterns, prints). The checked tile gets the accent border and `accent-subtle` fill.
- **FileDrop:** a dashed sunken drop zone wrapping a file input, with an inline error.
- **Motion:** small and fast. 80ms press-down, 120ms hover and content swaps, 200ms menus and the theme crossfade, 280ms panels. Ease-out quart (`cubic-bezier(0.25, 1, 0.5, 1)`); `--ease-spring` gives a small overshoot on the switch and slider thumbs only.
  - Press: buttons, segments, swatches and theme cards scale to `--motion-scale-press` (0.97).
  - Enter keyframes (`_mixins.scss`: `keyframes-rise`, `-pop`, `-slide`, `-fade` plus `enter()`): rise for tool content, list items and messages; pop for dropdown lists; slide for side panels; fade for changing values. Travel is `--motion-distance` (4px), and lists stagger by `--motion-stagger` (30ms).
  - Theme and design-language switches crossfade with the View Transition API (`withViewTransition`) where the browser supports it.
  - Everything drops to instant with `prefers-reduced-motion` (a global guard in `global.scss`).

## Do's and Don'ts

- Do use tokens for every color, space, radius, size and duration. A test fails on any literal color outside `tokens.scss` and on any unknown `var(--…)`.
- Do add every new color token to both theme blocks.
- Do keep one primary (accent) action per view.
- Do pair status colors with a word or icon.
- Don't use Barlow Condensed for values, inputs or body text.
- Don't add shadows other than `--shadow-float`, or blur, glass, glow or gradients in the UI chrome. Gradients belong to the racket paint only.
- Don't round corners past 4px, and don't use pills.
- Don't use brand green for success or for large surfaces.
- Don't put `oklch()` in `scene-*` tokens.
