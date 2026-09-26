import type { ButtCapSpec } from './butt-cap';
import type { GripSpec, GripSpecV4 } from './grip-catalog';
import type { LogoSpec } from './brand-logo';
import type { StickerId } from './stickers';
import type { TrimSpec } from './trim';

export const DESIGN_SCHEMA_VERSION = 10;

export const ZONE_IDS = ['frame', 'throat'] as const;

export const LEGACY_ZONE_IDS = ['frame', 'throat', 'handle'] as const;
export type LegacyZoneId = (typeof LEGACY_ZONE_IDS)[number];
export type ZoneId = (typeof ZONE_IDS)[number];

export const FINISHES = ['gloss', 'matte', 'metallic', 'pearl'] as const;
export type Finish = (typeof FINISHES)[number];

export const MIN_GRADIENT_STOPS = 2;
export const MAX_GRADIENT_STOPS = 4;

export interface GradientStop {
	offset: number;
	color: string;
}

export interface SolidFill {
	kind: 'solid';
	color: string;
}

export interface GradientFill {
	kind: 'gradient';
	stops: GradientStop[];
	angle: number;
}

export type ZoneFill = SolidFill | GradientFill;

export interface ZonePaint {
	finish: Finish;
	fill: ZoneFill;
}

export type DesignZones = Record<ZoneId, ZonePaint>;

export interface DesignMeta {
	name: string;
	themeId: string | null;
}

export const LINE_PATTERN_IDS = [
	'diagonal',
	'chevron',
	'grid',
	'pinstripe',
	'zigzag',
] as const;
export type LinePatternId = (typeof LINE_PATTERN_IDS)[number];

export const LINE_DENSITY_RANGE = { min: 2, max: 40 } as const;
export const LINE_THICKNESS_RANGE = { min: 0.05, max: 0.6 } as const;

export interface LineOverlay {
	patternId: LinePatternId;
	color: string;
	density: number;
	thickness: number;
}

export type PrintSource =
	| { kind: 'preset'; presetId: string }
	| { kind: 'upload'; assetId: string; name: string };

export const PRINT_SCALE_RANGE = { min: 0.2, max: 1 } as const;
export const PRINT_REPEAT_RANGE = { min: 1, max: 12 } as const;

export interface PrintOverlay {
	source: PrintSource;
	scale: number;
	repeat: number;
	offset: number;
	offsetY: number;
}

export type PrintOverlayV7 = Omit<PrintOverlay, 'offsetY'>;

export interface ZoneOverlays {
	lines: LineOverlay | null;
	print: PrintOverlay | null;
}

export type DesignOverlays = Record<ZoneId, ZoneOverlays>;

export const SHAPE_KINDS = [
	'circle',
	'square',
	'triangle',
	'diamond',
	'hexagon',
	'star',
	'bolt',
	'heart',
	'crescent',
	'ring',
	'cross',
	'arrow',
	'chevron',
	'shield',
	'teardrop',
	'spark',
	'wave-line',
	'zigzag-line',
	'swoosh',
	'tiger-head',
	'tiger',
	'dragon-head',
	'spiked-dragon-head',
	'double-dragon',
	'dragon-spiral',
	'wolf-head',
	'wolf-howl',
	'eagle-head',
	'eagle-emblem',
	'lion',
	'cobra',
	'rattlesnake',
	'shark-jaws',
	'shark-fin',
	'scorpion',
	'charging-bull',
	'raven',
	'horse-head',
	'bat',
	'kraken-tentacle',
	'crowned-skull',
	'flame',
	'heavy-lightning',
	'lightning-branches',
	'rose',
	'crown',
	'feather',
	'feathered-wing',
	'barbed-sun',
	'moon',
	'claw-slashes',
	'triple-scratches',
	'waves',
	'big-wave',
	'wave-crest',
	'static-waves',
	'ink-swirl',
	'magic-swirl',
	'fluffy-swirl',
	'swirl-string',
	'coiling-curl',
	'curly-wing',
	'curling-vines',
	'thorny-vine',
	'splash',
] as const;
export type ShapeKind = (typeof SHAPE_KINDS)[number];

export const SHAPE_SCALE_RANGE = { min: 0.2, max: 1 } as const;
export const MAX_LAYERS = 24;

export interface LayerPosition {
	u: number;
	v: number;
}

export interface ShapeLayer {
	id: string;
	kind: 'shape';
	zone: ZoneId;
	shape: ShapeKind;
	color: string;
	position: LayerPosition;
	rotation: number;
	scale: number;
}

export interface StickerLayer {
	id: string;
	kind: 'sticker';
	zone: ZoneId;
	stickerId: StickerId;
	position: LayerPosition;
	rotation: number;
	scale: number;
}

export type DesignLayer = ShapeLayer | StickerLayer;

export interface DesignDocument {
	schemaVersion: typeof DESIGN_SCHEMA_VERSION;
	racketModelId: string;
	zones: DesignZones;
	grip: GripSpec;
	buttCap: ButtCapSpec;
	grommets: TrimSpec;
	finishingTape: TrimSpec | null;
	logo: LogoSpec;
	overlays: DesignOverlays;
	layers: DesignLayer[];
	meta: DesignMeta;
}

export type DesignOverlaysV7 = Record<
	ZoneId,
	{ lines: LineOverlay | null; print: PrintOverlayV7 | null }
>;

export type DesignDocumentV9 = Omit<DesignDocument, 'schemaVersion' | 'logo'> & {
	schemaVersion: 9;
};

export type DesignDocumentV8 = Omit<DesignDocumentV9, 'schemaVersion' | 'layers'> & {
	schemaVersion: 8;
	shaftExtendsHead: boolean;
	layers: ShapeLayer[];
};

export type DesignDocumentV7 = Omit<DesignDocumentV8, 'schemaVersion' | 'overlays'> & {
	schemaVersion: 7;
	overlays: DesignOverlaysV7;
};

export type DesignDocumentV6 = Omit<
	DesignDocumentV7,
	'schemaVersion' | 'shaftExtendsHead'
> & {
	schemaVersion: 6;
};

export type DesignDocumentV5 = Omit<
	DesignDocumentV6,
	'schemaVersion' | 'grommets' | 'finishingTape'
> & {
	schemaVersion: 5;
};

export type DesignDocumentV4 = Omit<DesignDocumentV5, 'schemaVersion' | 'grip'> & {
	schemaVersion: 4;
	grip: GripSpecV4;
};

export type DesignDocumentV3 = Omit<DesignDocumentV4, 'schemaVersion' | 'buttCap'> & {
	schemaVersion: 3;
};

export type LegacyDesignZones = Record<LegacyZoneId, ZonePaint>;

export interface DesignDocumentV1 {
	schemaVersion: 1;
	racketModelId: string;
	zones: LegacyDesignZones;
	meta: DesignMeta;
}

export interface DesignDocumentV2 {
	schemaVersion: 2;
	racketModelId: string;
	zones: LegacyDesignZones;
	overlays: Record<LegacyZoneId, ZoneOverlays>;
	layers: (Omit<ShapeLayer, 'zone'> & { zone: LegacyZoneId })[];
	meta: DesignMeta;
}
