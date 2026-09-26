# Shared — CLAUDE.md

`@uniq/shared` holds the **design document schema** and types used by the frontend builder.

## Design Document (v4)

Source of truth: `src/design/design-document.ts` (types, `ZONE_IDS`, `FINISHES`, `LINE_PATTERN_IDS`, `SHAPE_KINDS`, ranges, `MAX_LAYERS`) and `src/design/design-validation.ts` (`isDesignDocument`, `isDesignDocumentV1`, `upgradeV1ToV2`, `upgradeDesignDocument`, `createEmptyOverlays`, `isHexColor`).

v8 (current) = v7 with `PrintOverlay.offsetY` (0–1, vertical position; `upgradeV7ToV8` sets 0.5). v7 = v6 + `shaftExtendsHead: boolean` (the shaft shows the frame's paint, lines and print); `upgradeV6ToV7` sets it to `true`. v6 = v5 + `grommets: TrimSpec` and `finishingTape: TrimSpec | null` (`{ colorId, finish }`, colors from `TRIM_COLORS` in `src/design/trim.ts`); `upgradeV5ToV6` adds `DEFAULT_GROMMETS` and no tape. v5 = v4 with `grip.customHex: string | null` (overrides `colorId`) and `grip.overgrip` as `{ colorId, material: 'tacky' | 'dry', texture: 'smooth' | 'perforated' | 'ribbed' }` (`OVERGRIP_CATALOG`); `upgradeV4ToV5` maps old overgrip `finish` gloss → tacky, matte → dry, texture smooth. v4 = v3 + `buttCap: ButtCapSpec` (`colorId`, `finish`, `badge`: none | preset icon | 1–3 letters, limited by `src/design/butt-cap.ts`); `upgradeV3ToV4` adds `DEFAULT_BUTT_CAP`. v3: paintable `ZONE_IDS` are `frame | throat`. The handle is a real-world `grip: GripSpec` (`material`, `colorId`, `texture`, `finish`, `overgrip | null`) limited by `GRIP_CATALOG` / `OVERGRIP_COLORS` in `src/design/grip-catalog.ts`. v2→v3 (`upgradeV2ToV3`) maps the old handle paint to the nearest synthetic grip color and drops handle overlays/layers. v2 = v1 + `overlays: Record<ZoneId, { lines: LineOverlay | null; print: PrintOverlay | null }>` + `layers: ShapeLayer[]` (`kind: 'shape'`, `zone`, `shape`, `color`, `position {u, v}`, `rotation`, `scale`). Prints reference `{ kind: 'preset', presetId }` or `{ kind: 'upload', assetId, name }`; binaries never go in the document. v1 and v2 documents are upgraded on read (`loadDraft` → `upgradeDesignDocument`: v1 → v2 → v3 → v4 → v5 → v6 → v7 → v8). The block below is the long-term target.

The frontend imports the **source** through a path alias (`@uniq/shared` → `packages/shared/src/index.ts`, in `tsconfig.app.json` + `vite.config.ts`).

### Target shape

```typescript
interface DesignDocument {
	schemaVersion: 1;
	racketModelId: string;
	zones: Record<ZoneId, ZonePaint>;
	layers: Layer[];
	meta: { name: string; themeId: string | null };
}

type ZoneId = 'frame' | 'throat' | 'handle' | 'grip' | 'bumper' | 'strings';

interface ZonePaint {
	finish: 'gloss' | 'matte' | 'metallic' | 'pearl' | 'carbon';
	fill:
		| { kind: 'solid'; color: string }
		| { kind: 'gradient'; stops: { offset: number; color: string }[]; angle: number }
		| { kind: 'pattern'; patternId: string; scale: number; rotation: number; tint: string | null };
}

type Layer = StickerLayer | TextLayer;

interface LayerBase {
	id: string;
	zone: ZoneId;
	position: { u: number; v: number };
	rotation: number;
	scale: number;
	mirror: boolean;
	opacity: number;
	blend: 'normal' | 'multiply' | 'screen' | 'overlay';
	locked: boolean;
	hidden: boolean;
}

interface StickerLayer extends LayerBase { kind: 'sticker'; stickerId: string }
interface TextLayer extends LayerBase { kind: 'text'; text: string; fontId: string; color: string }
```

## Rules

- The schema is validated at runtime (Zod or similar) on the frontend before save.
- Any breaking change bumps `schemaVersion` and adds an upgrade function `upgradeV<n>ToV<n+1>`. Stored documents are upgraded on read.
- No runtime dependencies on React, three.js or NestJS here. Pure TypeScript only.
- A schema version bump is a **High** risk change (see root `CLAUDE.md`).
