# 3D Builder (frontend, three.js + react-three-fiber)

The builder is the top-priority feature (10). It must feel fast, smooth and premium.

## Architecture

```
DesignDocument (@uniq/shared)  ← single source of truth
        │  commands (apply/revert)
        ▼
builder store (Zustand) ── history (undo/redo stacks)
        │  selectors
        ▼
<BuilderCanvas>  r3f scene  (pure view of the document)
  ├─ <Studio>       camera, lights, HDR environment, contact shadows
  ├─ <Racket>       GLB model, one mesh per zone
  │    ├─ <ZoneMaterial>   color / gradient / pattern + finish
  │    └─ <DecalLayer>     stickers + text projected with decals
  └─ <Gizmos>       move / rotate / scale for the selected layer
<BuilderUI>  panels, layer list, color pickers, toolbar (DOM, outside the canvas)
```

## Rules

- Commands: add new edits as factories in `src/builder/design/design-commands.ts` returning `{ label, mergeKey, apply({ document }) }`. `apply` must be pure and return the **same** document object for a no-op (the store skips history for it). Use a `mergeKey` for continuous inputs (sliders, color pickers).
- **Document is truth.** Scene components read from the store and never own design state.
- **Every edit is a command.** History stores immutable document snapshots, so commands only need `apply` (no `revert`). Drags and color scrubs merge into one history entry via `mergeKey` (800 ms window).
- **No React re-render per frame.** High-frequency updates go through refs and `useFrame`. Commit to the store at the end of the gesture.
- **Scene code is headless-safe.** No DOM, no UI imports in `builder/scene`, `builder/models`, `builder/materials`, `builder/decals`.
- **Dispose** geometries, materials and textures you create. Use drei's `useGLTF` / `useTexture` caches and preload.
- **Pure math in pure functions** (UV mapping, gradient stops, layer transforms). Unit test them.

## Racket Models

- Format: GLB, Draco or Meshopt compressed, textures in KTX2.
- Every model has named meshes per zone: `zone_frame`, `zone_throat`, `zone_handle`, `zone_grip`, `zone_bumper`, `zone_strings`.
- Every paintable zone has clean UVs (no overlaps) so decals and patterns map right.
- Model metadata (zones, default camera, scale) comes from the catalog API.

## Materials

- `MeshPhysicalMaterial` for paint: finish maps to `roughness`, `metalness`, `clearcoat`, `sheen`, `iridescence`.
- Gradients and patterns are generated into a canvas texture per zone, cached by a hash of the zone paint.
- Tone mapping: ACES filmic, sRGB output. Keep one HDR environment for all racket shots so colors stay the same.

## Decals and Text

- Stickers use drei `<Decal>` or a projected texture layer on the zone UV.
- Text is rendered to a canvas texture (or SDF text) and treated like a sticker layer.
- Uploaded stickers: PNG/SVG, max size limit, uploaded straight to object storage via a signed URL.

## Performance Budget

| Metric | Target |
|---|---|
| Frame rate | 60 fps on a mid-range laptop, 30+ fps on a mid-range phone |
| Racket model | ≤ 3 MB compressed |
| First interactive builder | ≤ 3 s on fast 4G |
| Draw calls | ≤ 100 |

Use `frameloop="demand"` and invalidate on change when nothing animates. Lower `dpr` on weak devices (`<AdaptiveDpr>`, `<PerformanceMonitor>`).

## Export

- In-browser PNG: render the canvas at a higher resolution with `preserveDrawingBuffer` off, using a one-off render target.
- See `docs/features/mockup-export.md`.
