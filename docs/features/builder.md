# 3D Design Builder

**Priority: 10** (the most important feature). Status: **MVP slice built** — zone painting (solid, gradient, finish), undo/redo, autosave, theme presets on a real GLB racket model. Next: more racket models, stickers/text layers.

## Goal

A fancy, advanced 3D editor in the browser. A customer picks a racket, sees it live in 3D and makes a unique paintjob with stickers and themes.

## User Flow

1. Open the builder at `/`.
2. Start from a ready theme or design, or from a blank racket.
3. Paint zones (frame, throat, handle, grip, bumper, strings).
4. Add stickers and text, arrange layers.
5. Preview under studio lights, spin, zoom, switch backgrounds.
6. Autosave in the browser, or save as a theme.
7. Export mockups.

## Features

| Group | Features |
|---|---|
| Scene | Orbit camera, preset camera angles, studio lighting, HDR environment, background options, turntable |
| Paint | Solid color, gradient (multi-stop, angle), patterns (carbon, camo, marble...), finishes (gloss, matte, metallic, pearl, carbon) |
| Layers | Stickers, text, order, lock, hide, opacity, blend mode, mirror |
| Tools | Move / rotate / scale gizmo, snapping, guides, symmetry, color picker with hex + eyedropper, recent colors |
| History | Undo / redo, autosave, versions |
| Themes | Removed from the builder for now (see PLAN) |
| Output | In-browser PNG (see [mockup-export](mockup-export.md)) |

## Layout

Meshy-style workspace, full screen (`100vw × 100dvh`, no page scroll), on `--color-bg`:

- **Header bar**: logo and title; undo/redo, design-language dropdown, dark/light toggle.
- **Tools panel** (left, `--panel-width`): every control for the active step or option. The title follows the selection (`Frame · Color`, `Frame · Print`, `Frame · Objects`, `Frame · Grommets`, `Handle · Grip`, `Handle · Overgrip`, `Handle · Finishing tape`, `Grip Cap`).
- **Viewport card** (center): the 3D scene on `--scene-bg` with a floor grid, fold buttons for both side panels, hints and the Light switch. No info overlay on the scene.
- **Steps panel** (right, 280px): `StepNav` with 01 Frame (options Color, Print, Objects, HEAD logo, Grommets), 02 Handle (options Grip, Overgrip, Finishing tape) and 03 Grip Cap. The Objects option groups Lines, Shapes and Stickers behind an in-panel segmented control (`ObjectsEditor`) instead of three separate steps-panel rows. Themes were removed. Each option shows its current value. The footer has one **Proceed to checkout** button (a stub: it shows a "checkout isn't available yet" status). No price is shown.
- Motion: side panels slide in when opened, tool content rises in on every step/option switch, and shape rows and gradient stops rise in when added.
- **Light** dropdown in the viewport bar (Day / Cloudy / Night / Ambient / Night city / Spotlights, each with a one-line description; saved as `uniq:scene-lighting:v1`). Presets live in `lighting/lighting-presets.ts`:

  | Preset | Mood | Key light | Background tint |
  |---|---|---|---|
  | Day | Warm sun, blue sky fill, crisp shadows | `#fff1d6` × 2.8 | 32% sky blue |
  | Cloudy | Soft, even grey-blue light, faint shadows | `#e7edf4` × 0.9 | 30% grey |
  | Night | Two cool floodlights from above, blue rim, dark ambience | `#f4f8ff` × 3.2 | 72% navy |
  | Ambient | Soft studio wrap light from every side, almost no shadow | `#fffaf2` × 0.7 (sky × 1.8) | 20% warm grey |
  | Night city | Neon magenta key, cyan fill, violet rim, warm street bounce | `#ff3fa4` × 2.4 | 78% deep violet |
  | Spotlights | Stage projectors from straight above, strong back light, dark hall | `#fff6e0` × 4.2 | 88% near-black |

  `SceneLighting` blends every value (colors, intensities, positions, exposure, background) over 600 ms, or instantly with `prefers-reduced-motion`. The background is the theme's `--scene-bg` mixed with the preset tint, so it works in dark and light UI.
- Camera focus follows the step (`CameraFocusControls`, `controls/camera-views.ts`): 02 Handle glides the orbit target to the center of the grip and brings the camera close; 03 Grip Cap looks up at the end of the handle; 01 Frame glides back to the full racket. 450 ms ease-out, instant with `prefers-reduced-motion`. You can orbit, zoom and fly freely afterwards.
- Camera: drag to orbit, right-drag to pan, scroll to zoom (down to 8 cm from the target, so the grip texture is readable). Keyboard fly controls (`builder/controls`):
  - W / S (or ↑ / ↓): move in and out;
  - A / D (or ← / →): move left and right;
  - Q / E: move down and up;
  - Shift: 3× faster.
  Movement pans the orbit target and camera together, clamped to a box around the racket. Keys are ignored while typing in a field and when ⌘ / Ctrl / Alt is held (so ⌘Z undo still works). The camera near plane is 5 mm so close-ups don't clip.
- Under 1100px the steps panel hides. Under 900px the tools panel moves below the viewport.

## Customization

| Step / option | Controls | Stored in |
|---|---|---|
| Frame · Color | Solid/gradient, color or stops + angle, finish | `zones.frame` |
| Shaft · Color / Lines / Print / Shapes | **Extend head design** switch (on by default): the shaft shows the head's color, lines and print. Turn it off to design the shaft on its own with the same editors as the frame; turning it off copies the head's paint, lines and print into the shaft first, so nothing jumps. Shaft shapes are always the shaft's own; they start on the solid neck and have an extra **Position across shaft** slider (the centre line above the neck is the gap between the arms) | `shaftExtendsHead`, `zones.throat`, `overlays.throat`, `layers[]` with `zone: 'throat'` |
| Frame · Print | Preset stock-image prints (`builder/prints/print-presets.ts`, 19 designs) or an upload; size, repeat, position, listed as a single column of same-height, cover-cropped thumbnails so every design reads at a glance. The image tiles edge-to-edge across the full loop and stacks enough rows to cover the whole band height, never stretched, so it covers head and shaft completely | `overlays.frame.print` |
| Frame · Objects · Lines | Pattern (diagonal, chevron, grid, pinstripe, zigzag), color, density, thickness | `overlays.frame.lines` |
| Frame · Objects · Shapes | A collection of 65 shapes in 4 groups: Shapes (16 geometric), Lines & curves (waves, swirls, vines, splash…), Symbols (skull, flame, lightning, rose, crown, claws…), Creatures (tiger, dragon, wolf, eagle, lion, cobra, shark…). Max 24 per design; per shape: color, position along the frame, size, rotation. Icons from game-icons.net (CC BY 3.0, credited in the panel and `docs/credits.md`) | `layers[]` |
| Frame · Objects · Stickers | Sticker collections (fruits, animals, legends, cities…) placed on the frame; position, size, rotation, mirror | `layers[]` |
| Handle · Grip | Material (leather / synthetic), a color from that material's real range or a custom color (picker + hex), texture, finish | `grip` (`customHex` overrides `colorId`) |
| Handle · Overgrip | None, or one of 8 overgrip colors; material tacky or dry; texture smooth, perforated or ribbed (ribbed is tacky only) | `grip.overgrip` |
| Frame · Grommets | Color of the eyelets in the string holes (12 trim colors incl. volt, gold, silver), matte or gloss | `grommets` |
| Handle · Finishing tape | None, or a tape band around the top of the grip that holds its end; color (12), matte or gloss | `finishingTape` |
| Grip Cap | Plastic cap color (8), matte or gloss, end badge: none, icon (UNIQ monogram, ball, star, bolt) or 1–3 letters/numbers, badge color (6, incl. gold and silver) | `buttCap` |

### Placing objects (drag and X / Y)

- Every placed object (shapes on frame or shaft, and the print) can be dragged directly on the 3D racket. Press on it, drag, release. Orbiting pauses while dragging, and one drag is one undo step (`mergeKey` per object). Pressing a shape also selects it.
- `controls/useSurfaceDrag.ts` reads the hit point's texture UV from the frame or shaft mesh. `decor/surface-coords.ts` turns it back into a position with the same maths the painter uses: `u` along the surface, and `v` from the nearest front/back band (`v = 0.5 − 2·(uv.y − band.centerV)`). It then finds the shape or print copy under the pointer and keeps the grab offset so the object does not jump.
- Every object also has **Position X** and **Position Y** sliders (0–100 %). Shapes store them in `position.u` / `position.v`, the print in `offset` / `offsetY` (schema v8; older prints get `offsetY = 0.5`, the old centred look).

### Grips

Handles are modelled on real tennis grips, not on 3D material settings:

| | Leather | Synthetic (PU) | Overgrip |
|---|---|---|---|
| Colors | Natural tan, brown, dark brown, black, or custom | Black, white, grey, navy, blue, green, red, orange, yellow, pink, or custom | White, black, grey, blue, green, red, yellow, pink |
| Material | — | — | Tacky (thin PU, sticky, for dry hands) or dry (felt-like, anti-sweat, gets grippier with sweat) |
| Texture | Smooth, perforated | Smooth, perforated, grooved | Tacky: smooth, perforated, ribbed. Dry: smooth, perforated |
| Finish | Matte only (natural dry leather) | Matte (dry) or gloss (tacky) | Follows the material (tacky = gloss, dry = matte) |

- No gradients on the handle. The base grip can take any custom hex color; overgrips keep catalog colors. The catalog lives in `packages/shared/src/design/grip-catalog.ts` and validation enforces it. Overgrip types follow real products: tacky (e.g. Wilson Pro Overgrip), dry (e.g. Tourna Grip), perforated for airflow, ribbed with a raised spiral ridge.
- An overgrip covers the base grip, so it sets the visible color. It is wrapped narrower, with more turns.
- Finishing tape (`createFinishingTapeGeometry`) cuts the top 18 mm of the handle and wraps it 0.5 mm above the grip, with its own step rings. New designs get black matte tape; upgraded v5 drafts get none so they look the same.
- The grip is wrapped on the shaft, so it is thicker: `grips/grip-wrap.ts` grows the model's handle outward by 1.5 mm (plus 0.6 mm with an overgrip) and closes the open top and bottom with a flat ring. That ring is the visible step where the grip meets the shaft.
- Rendering (`GripMaterial`, `grips/grip-surface.ts`): one canvas used as both color and bump map. It draws the spiral wrap seam (8 turns for the base grip, 10 for an overgrip), leather grain, felt fibers for dry overgrips, perforation holes, grooves or a raised rib. Roughness, clearcoat and sheen follow the material and finish (dry overgrip: roughest, most sheen).

### Grip Cap

The Grip Cap (internally the "butt cap") is the plastic cap at the bottom of the handle, under the grip. Real ones are often personalized with a logo, initials or a picture under a domed epoxy finish. In 3D it is a thin (3 mm) octagonal plate, flush with the handle and slightly chamfered, that forms the handle's bottom surface. The badge is painted on a separate octagon face so it reads the right way round from below (`models/ButtCap.tsx`, `buttcap/badge-painter.ts`). The editor shows a flat preview of the end face. Selecting 03 Grip Cap moves the camera under the handle to look up at the badge. The floor sits lower (y = −0.8) and the camera may orbit below the racket (max polar angle 0.85π) so that view fits.

### Uploads

- Accepted: PNG, WebP, SVG, AVIF, GIF (formats with transparency that the browser and three.js can draw), max 10 MB.
- `.ai`, `.eps` and `.pdf` are refused with "Export as SVG or PNG and upload that". JPG is refused because it has no transparency.
- The file is stored in IndexedDB (`uniq-assets` → `prints`). The design stores only `{ kind: 'upload', assetId, name }`, so autosave stays small. Blobs are never deleted, so undo can't point at a removed file.
- If the asset is gone (another device, cleared site data), the print is skipped and the Print editor shows "upload it again".
- SVGs without `width`/`height` get their size from `viewBox` before drawing.

### Rendering

- The frame is painted into one canvas texture (`FrameSurfaceMaterial`, redrawn in place): base fill → lines → print → shapes (`decor/surface-painter.ts`).
- Canvas size follows the loop length ÷ tube circumference (about 2048 × 163).
- The tube's front face is at UV v = 0 (on the texture's wrap edge) and the back at v = 0.5 (a test measures this on the real `TubeGeometry`). Prints and shapes are drawn on both faces, and wrapped across the u and v seams.
- Placement is by sliders only. Dragging shapes on the model is not built yet.
- The shaft (throat mesh) uses `FrameSurfaceMaterial` like the frame, with its own canvas sized at the frame's pixel density (`getShaftSurfaceSize`), so the same line density and print size look the same on head and shaft. Its UV `u` runs up the shaft; front and back faces get separate halves of `v`, like the frame's front/back bands. The handle uses `GripMaterial`, the butt cap `ButtCap`.

## Dark and light mode

- Dark and light mode via `data-theme` (on `<html>`, or any element to force a theme) and OKLCH CSS variables in `src/styles/tokens.scss`.
- First visit follows `prefers-color-scheme`; the choice is saved in `localStorage` (`uniq:theme:v1`).
- Scene colors (`--scene-bg`, `--scene-grid-cell`, `--scene-grid-section`) are read from CSS by `readSceneColors` and passed to `BuilderCanvas` as props, so scene code stays DOM-free.

## Technical Design

- The design is a `DesignDocument` JSON (see `packages/shared/CLAUDE.md`).
- The scene is a pure view of the document. Edits are commands with undo/redo.
- Rules: `.claude/rules/frontend/three-builder.md`.
- Documents autosave to local storage with `schemaVersion`. Catalog and themes come from mocks.

### Racket model

- Source: `data/Racket1.glb` (one joined mesh, no zone names, atlas UVs). Built into `apps/frontend/public/models/racket.glb` by `npm run build:model -w apps/frontend` (`apps/frontend/scripts/build-racket-model.ts`, pure math in `src/builder/models/racket-model-prep.ts`).
- The build splits the mesh into nodes `zone_frame`, `zone_throat`, `zone_handle`, `zone_butt_cap`, `zone_strings`, `grommets`. Loose pieces are strings (long or flat) or grommets (small). The main body is cut by height per triangle: cap < 2 cm, handle < 24.5 cm, throat < 44 cm, frame above (source units).
- It turns Z-up into Y-up, scales by 0.72 so the head is 26 cm wide, and puts the head center at the origin, so camera views and the floor still fit.
- New UVs per zone so painting keeps working: frame `u` is arc length along the loop from +X counter-clockwise, `v` goes around the beam (front 0, inside 0.25, back 0.5, outside 0.75), same as the old tube. Handle: `u` around, `v` up. Throat: planar. Frame textures use repeat wrapping for seams.
- Output uses `EXT_meshopt_compression` without quantization (about 1.2 MB). `Racket.tsx` loads it with drei `useGLTF` inside `<Suspense>` and preloads it.
- Strings and grommets use fixed materials for now (no `strings` zone in the schema). The model's butt cap mesh gets the butt cap color; the badge sits on a disc just below it.

## Open Questions

- Source of racket 3D models (see `PLAN.md`).
- Do we allow full custom UV painting (brush tool) later?
