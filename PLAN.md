# PLAN

Roadmap for **uniq**, a platform for custom tennis racket paintjobs, stickers and themes.

## Priorities

The numbers come from the product owner. **Higher number = more important.**

| # | Feature | Priority | Doc |
|---|---|---|---|
| F1 | Builder: fancy, advanced, 3D with three.js | **10** | [builder](docs/features/builder.md), [mockup export](docs/features/mockup-export.md) |

Frontend only (React + three.js). No backend: data is mocked or kept in the browser.

## Phases

### Phase 0: Foundation
- [ ] `git init`, branch rules, Husky hooks (pre-commit: lint + type-check; pre-push: tests)
- [x] Add `packages/shared/tsconfig.json` and build it before the apps
- [x] Scaffold `apps/frontend` (Vite + React + TS strict + three.js / r3f), strict ESLint, Vitest
- [ ] `packages/shared`: first version of the design schema (`DesignDocument` v1) with runtime validation
- [ ] Playwright (frontend), CI pipeline

### Phase 0.5: Design system
- [x] `PRODUCT.md` + `DESIGN.md` (impeccable workflow, Google Stitch format)
- [x] Tokens v1: OKLCH dark/light, grass-green accent, Barlow Condensed + Instrument Sans, 4px spacing, 2–4px radius, one float shadow
- [x] Base components + `/design-system` page
- [x] Token guard tests (both themes, no unknown vars, no literal colors, hex scene colors)
- [x] Move the builder UI onto the components
- [x] Parallel design languages: HEAD (from head.com) and Velocity (from no-name-proj), header dropdown (`Select`)

### Phase 1: Builder MVP (F1, priority 10)
- [x] Single builder page at `/`, other paths redirect to it
- [x] 3D scene: placeholder procedural racket, orbit camera, studio lighting, floor grid
- [x] Full-screen builder, no page scroll
- [x] Meshy-style workspace: header bar, tools / viewport card / themes columns, foldable side panels
- [x] Dark / light mode with CSS variables
- [x] Real racket model (GLB, Meshopt, split into zones with generated UVs)
- [ ] HDR environment map
- [ ] Racket catalog: models, paintable zones (frame, throat, handle, grip, strings, bumper)
- [x] Paint per zone: color, finish (gloss/matte/metallic/pearl), gradient (2–4 stops, angle)
- [x] Undo/redo (command history, merge while scrubbing, Ctrl/⌘+Z, Ctrl/⌘+Shift+Z / Ctrl+Y), autosave to local storage
- [x] Built-in theme presets (Volt, Sunset, Chrome, Ocean)
- [ ] Screenshot export (PNG) in the browser

### Phase 2: Builder advanced (F1)
- [x] Steps panel (Frame → Handle → Butt cap) + tools panel, Proceed to checkout stub (themes removed)
- [x] Scene lighting presets: Day, Cloudy, Night, Ambient, Night city, Spotlights (dropdown, smooth blend)
- [x] Motion system: tokens, enter keyframes, press feedback, view-transition theme switch
- [x] Frame: color (links throat), line patterns, prints (presets + PNG/WebP/SVG/AVIF/GIF upload in IndexedDB), shape decals (65-shape collection incl. creatures, credited)
- [x] Design schema v2 (`overlays`, `layers`) with v1 upgrade
- [x] Butt cap: color, finish, badge icon or initials (schema v4), camera view from below
- [x] Real-world handle grips: leather / synthetic with catalog colors, textures, matte/gloss, optional overgrip (schema v3)
- [x] Custom grip color; overgrip material (tacky / dry) and texture (smooth / perforated / ribbed) (schema v5)
- [x] Grommet color and finishing tape on the grip top (schema v6)
- [x] Shaft step: own color, lines, print, shapes, or extend the head design (schema v7)
- [x] Drag shapes and prints directly on the 3D model, with X / Y sliders (schema v8)
- [ ] Stickers on throat/handle, text layers
- [ ] Text layers with fonts
- [ ] Layers panel: order, lock, hide, blend
- [ ] Textures (carbon, camo, marble...), PBR materials
- [ ] Symmetry and mirror tools, guides, snapping
- [ ] Theme builder: save a set of colors + materials + stickers as a reusable theme
- [ ] Performance budget: 60 fps on a mid-range laptop, lazy loading of models and textures

### Phase 3: Mockup export (F1)
- [ ] Screenshot / high-res PNG export in the browser

### Phase 4: Hardening
- [ ] Accessibility pass

## Open decisions

These are not chosen yet. Each one needs a decision before its phase starts.

| Topic | Options | Needed by |
|---|---|---|
| Source of 3D racket models | Made in-house / bought / from brands | Phase 1 |
| Frontend styling / UI kit | SCSS modules + tokens, no Tailwind/MUI (proposed) / other | Phase 0 |
| Hosting and deploy | not decided | Phase 4 |
