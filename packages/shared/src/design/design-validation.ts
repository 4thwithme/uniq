import {
	DESIGN_SCHEMA_VERSION,
	FINISHES,
	LEGACY_ZONE_IDS,
	LINE_DENSITY_RANGE,
	LINE_PATTERN_IDS,
	LINE_THICKNESS_RANGE,
	MAX_GRADIENT_STOPS,
	MAX_LAYERS,
	MIN_GRADIENT_STOPS,
	PRINT_REPEAT_RANGE,
	PRINT_SCALE_RANGE,
	SHAPE_KINDS,
	SHAPE_SCALE_RANGE,
	ZONE_IDS,
} from './design-document';
import {
	BADGE_PRESET_IDS,
	BADGE_TEXT_PATTERN,
	DEFAULT_BUTT_CAP,
	findBadgeColor,
	findButtCapColor,
} from './butt-cap';
import {
	findOvergripColor,
	GRIP_CATALOG,
	GRIP_FINISHES,
	GRIP_MATERIALS,
	GRIP_TEXTURES,
	OVERGRIP_MATERIALS,
	OVERGRIP_TEXTURES,
	isValidGrip,
	nearestGripColor,
} from './grip-catalog';
import { DEFAULT_LOGO, isLogoSpec } from './brand-logo';
import { STICKER_IDS } from './stickers';
import { DEFAULT_GROMMETS, isTrimSpec } from './trim';

import type {
	DesignDocument,
	DesignDocumentV1,
	DesignDocumentV2,
	DesignDocumentV3,
	DesignDocumentV4,
	DesignDocumentV5,
	DesignDocumentV6,
	DesignDocumentV7,
	DesignDocumentV8,
	DesignDocumentV9,
	DesignOverlaysV7,
	DesignLayer,
	DesignOverlays,
	Finish,
	GradientStop,
	LineOverlay,
	PrintOverlay,
	PrintSource,
	ZoneFill,
	ZoneOverlays,
	ZonePaint,
} from './design-document';
import type { ButtCapSpec } from './butt-cap';
import type { GripSpec, GripSpecV4 } from './grip-catalog';

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const isOneOf = <T extends string>(options: readonly T[], value: unknown): value is T =>
	typeof value === 'string' && (options as readonly string[]).includes(value);

const isInRange = (
	value: unknown,
	range: { min: number; max: number },
): value is number =>
	typeof value === 'number' &&
	Number.isFinite(value) &&
	value >= range.min &&
	value <= range.max;

const isUnit = (value: unknown): value is number => isInRange(value, { min: 0, max: 1 });

const isNonEmptyString = (value: unknown): value is string =>
	typeof value === 'string' && value !== '';

export const isHexColor = (value: unknown): value is string =>
	typeof value === 'string' && HEX_COLOR_PATTERN.test(value);

const isFinish = (value: unknown): value is Finish => isOneOf(FINISHES, value);

const isGradientStop = (value: unknown): value is GradientStop =>
	isRecord(value) && isUnit(value['offset']) && isHexColor(value['color']);

const isZoneFill = (value: unknown): value is ZoneFill => {
	if (!isRecord(value)) {
		return false;
	}

	if (value['kind'] === 'solid') {
		return isHexColor(value['color']);
	}

	if (value['kind'] === 'gradient') {
		const stops = value['stops'];
		return (
			Array.isArray(stops) &&
			stops.length >= MIN_GRADIENT_STOPS &&
			stops.length <= MAX_GRADIENT_STOPS &&
			stops.every(isGradientStop) &&
			typeof value['angle'] === 'number' &&
			Number.isFinite(value['angle'])
		);
	}

	return false;
};

const isZonePaint = (value: unknown): value is ZonePaint =>
	isRecord(value) && isFinish(value['finish']) && isZoneFill(value['fill']);

const isLineOverlay = (value: unknown): value is LineOverlay =>
	isRecord(value) &&
	isOneOf(LINE_PATTERN_IDS, value['patternId']) &&
	isHexColor(value['color']) &&
	isInRange(value['density'], LINE_DENSITY_RANGE) &&
	isInRange(value['thickness'], LINE_THICKNESS_RANGE);

const isPrintSource = (value: unknown): value is PrintSource => {
	if (!isRecord(value)) {
		return false;
	}
	if (value['kind'] === 'preset') {
		return isNonEmptyString(value['presetId']);
	}
	return (
		value['kind'] === 'upload' &&
		isNonEmptyString(value['assetId']) &&
		typeof value['name'] === 'string'
	);
};

const isPrintOverlay = (value: unknown): value is PrintOverlay =>
	isRecord(value) &&
	isPrintSource(value['source']) &&
	isInRange(value['scale'], PRINT_SCALE_RANGE) &&
	isInRange(value['repeat'], PRINT_REPEAT_RANGE) &&
	Number.isInteger(value['repeat']) &&
	isUnit(value['offset']);

const isZoneOverlays = (value: unknown): value is ZoneOverlays =>
	isRecord(value) &&
	(value['lines'] === null || isLineOverlay(value['lines'])) &&
	(value['print'] === null || isPrintOverlay(value['print']));

const isOverlaysFor = (value: unknown, zoneIds: readonly string[]): boolean =>
	isRecord(value) && zoneIds.every((zoneId) => isZoneOverlays(value[zoneId]));

const isDesignOverlays = (value: unknown): value is DesignOverlays =>
	isOverlaysFor(value, ZONE_IDS);

const isLayerFor = (value: unknown, zoneIds: readonly string[]): boolean => {
	if (!isRecord(value)) {
		return false;
	}
	const position = value['position'];
	const isKindValid =
		(value['kind'] === 'shape' &&
			isOneOf(SHAPE_KINDS, value['shape']) &&
			isHexColor(value['color'])) ||
		(value['kind'] === 'sticker' && isOneOf(STICKER_IDS, value['stickerId']));
	return (
		isKindValid &&
		isNonEmptyString(value['id']) &&
		isOneOf(zoneIds, value['zone']) &&
		isRecord(position) &&
		isUnit(position['u']) &&
		isUnit(position['v']) &&
		typeof value['rotation'] === 'number' &&
		Number.isFinite(value['rotation']) &&
		isInRange(value['scale'], SHAPE_SCALE_RANGE)
	);
};

const isLayersFor = (
	value: unknown,
	zoneIds: readonly string[],
): value is DesignLayer[] =>
	Array.isArray(value) &&
	value.length <= MAX_LAYERS &&
	value.every((layer) => isLayerFor(layer, zoneIds)) &&
	new Set(value.map((layer: DesignLayer) => layer.id)).size === value.length;

const hasGripBase = (value: Record<string, unknown>): boolean =>
	isOneOf(GRIP_MATERIALS, value['material']) &&
	typeof value['colorId'] === 'string' &&
	isOneOf(GRIP_TEXTURES, value['texture']) &&
	isOneOf(GRIP_FINISHES, value['finish']);

const isGripSpecV4 = (value: unknown): value is GripSpecV4 => {
	if (!isRecord(value) || !hasGripBase(value)) {
		return false;
	}
	const overgrip = value['overgrip'];
	const isOvergripValid =
		overgrip === null ||
		(isRecord(overgrip) &&
			typeof overgrip['colorId'] === 'string' &&
			findOvergripColor({ colorId: overgrip['colorId'] }) !== null &&
			isOneOf(GRIP_FINISHES, overgrip['finish']));
	return (
		isOvergripValid &&
		isValidGrip({
			grip: { ...(value as unknown as GripSpec), customHex: null, overgrip: null },
		})
	);
};

export const isGripSpec = (value: unknown): value is GripSpec => {
	if (!isRecord(value) || !hasGripBase(value)) {
		return false;
	}
	const overgrip = value['overgrip'];
	const customHex = value['customHex'];
	return (
		(customHex === null || typeof customHex === 'string') &&
		(overgrip === null ||
			(isRecord(overgrip) &&
				typeof overgrip['colorId'] === 'string' &&
				isOneOf(OVERGRIP_MATERIALS, overgrip['material']) &&
				isOneOf(OVERGRIP_TEXTURES, overgrip['texture']))) &&
		isValidGrip({ grip: value as unknown as GripSpec })
	);
};

const isButtCapSpec = (value: unknown): value is ButtCapSpec => {
	if (!isRecord(value)) {
		return false;
	}
	const badge = value['badge'];
	if (
		typeof value['colorId'] !== 'string' ||
		findButtCapColor({ colorId: value['colorId'] }) === null ||
		!isOneOf(GRIP_FINISHES, value['finish']) ||
		!isRecord(badge)
	) {
		return false;
	}
	if (badge['kind'] === 'none') {
		return true;
	}
	const isColorValid =
		typeof badge['colorId'] === 'string' &&
		findBadgeColor({ colorId: badge['colorId'] }) !== null;
	if (badge['kind'] === 'preset') {
		return isColorValid && isOneOf(BADGE_PRESET_IDS, badge['presetId']);
	}
	return (
		badge['kind'] === 'text' &&
		isColorValid &&
		typeof badge['text'] === 'string' &&
		BADGE_TEXT_PATTERN.test(badge['text'])
	);
};

const hasValidCore = (
	value: Record<string, unknown>,
	zoneIds: readonly string[],
): boolean => {
	const zones = value['zones'];
	const meta = value['meta'];

	return (
		typeof value['racketModelId'] === 'string' &&
		value['racketModelId'] !== '' &&
		isRecord(zones) &&
		zoneIds.every((zoneId) => isZonePaint(zones[zoneId])) &&
		isRecord(meta) &&
		typeof meta['name'] === 'string' &&
		(meta['themeId'] === null || typeof meta['themeId'] === 'string')
	);
};

export const isDesignDocumentV1 = (value: unknown): value is DesignDocumentV1 =>
	isRecord(value) && value['schemaVersion'] === 1 && hasValidCore(value, LEGACY_ZONE_IDS);

export const isDesignDocumentV2 = (value: unknown): value is DesignDocumentV2 =>
	isRecord(value) &&
	value['schemaVersion'] === 2 &&
	hasValidCore(value, LEGACY_ZONE_IDS) &&
	isOverlaysFor(value['overlays'], LEGACY_ZONE_IDS) &&
	isLayersFor(value['layers'], LEGACY_ZONE_IDS);

const isV3Body = (value: Record<string, unknown>): boolean =>
	hasValidCore(value, ZONE_IDS) &&
	isDesignOverlays(value['overlays']) &&
	isLayersFor(value['layers'], ZONE_IDS);

export const isDesignDocumentV3 = (value: unknown): value is DesignDocumentV3 =>
	isRecord(value) &&
	value['schemaVersion'] === 3 &&
	isV3Body(value) &&
	isGripSpecV4(value['grip']);

export const isDesignDocumentV4 = (value: unknown): value is DesignDocumentV4 =>
	isRecord(value) &&
	value['schemaVersion'] === 4 &&
	isV3Body(value) &&
	isGripSpecV4(value['grip']) &&
	isButtCapSpec(value['buttCap']);

const isV5Body = (value: Record<string, unknown>): boolean =>
	isV3Body(value) && isGripSpec(value['grip']) && isButtCapSpec(value['buttCap']);

export const isDesignDocumentV5 = (value: unknown): value is DesignDocumentV5 =>
	isRecord(value) && value['schemaVersion'] === 5 && isV5Body(value);

const isV6Body = (value: Record<string, unknown>): boolean =>
	isV5Body(value) &&
	isTrimSpec(value['grommets']) &&
	(value['finishingTape'] === null || isTrimSpec(value['finishingTape']));

export const isDesignDocumentV6 = (value: unknown): value is DesignDocumentV6 =>
	isRecord(value) && value['schemaVersion'] === 6 && isV6Body(value);

const isV7Body = (value: Record<string, unknown>): boolean =>
	isV6Body(value) && typeof value['shaftExtendsHead'] === 'boolean';

const hasPrintOffsetY = (value: unknown): boolean =>
	isRecord(value) &&
	ZONE_IDS.every((zoneId) => {
		const overlays = value[zoneId];
		const print = isRecord(overlays) ? overlays['print'] : null;
		return print === null || (isRecord(print) && isUnit(print['offsetY']));
	});

export const isDesignDocumentV7 = (value: unknown): value is DesignDocumentV7 =>
	isRecord(value) && value['schemaVersion'] === 7 && isV7Body(value);

const hasOnlyShapes = (value: unknown): boolean =>
	Array.isArray(value) &&
	value.every((layer) => isRecord(layer) && layer['kind'] === 'shape');

export const isDesignDocumentV8 = (value: unknown): value is DesignDocumentV8 =>
	isRecord(value) &&
	value['schemaVersion'] === 8 &&
	isV7Body(value) &&
	hasPrintOffsetY(value['overlays']) &&
	hasOnlyShapes(value['layers']);

export const isDesignDocumentV9 = (value: unknown): value is DesignDocumentV9 =>
	isRecord(value) &&
	value['schemaVersion'] === 9 &&
	isV6Body(value) &&
	hasPrintOffsetY(value['overlays']);

export const isDesignDocument = (value: unknown): value is DesignDocument =>
	isRecord(value) &&
	value['schemaVersion'] === DESIGN_SCHEMA_VERSION &&
	isV6Body(value) &&
	hasPrintOffsetY(value['overlays']) &&
	isLogoSpec(value['logo']);

const emptyZoneOverlays = (): ZoneOverlays => ({ lines: null, print: null });

export const createEmptyOverlays = (): DesignOverlays => ({
	frame: emptyZoneOverlays(),
	throat: emptyZoneOverlays(),
});

export const DEFAULT_GRIP: GripSpec = {
	material: 'synthetic',
	colorId: 'black',
	customHex: null,
	texture: 'perforated',
	finish: 'matte',
	overgrip: { material: 'dry', texture: 'perforated', colorId: 'white' },
};

export const upgradeV1ToV2 = (document: DesignDocumentV1): DesignDocumentV2 => ({
	schemaVersion: 2,
	racketModelId: document.racketModelId,
	zones: document.zones,
	overlays: {
		frame: emptyZoneOverlays(),
		throat: emptyZoneOverlays(),
		handle: emptyZoneOverlays(),
	},
	layers: [],
	meta: document.meta,
});

export const gripFromHandlePaint = (paint: ZonePaint): GripSpecV4 => {
	const hex =
		paint.fill.kind === 'solid'
			? paint.fill.color
			: (paint.fill.stops[0]?.color ?? '#161616');
	const color = nearestGripColor({ colors: GRIP_CATALOG.synthetic.colors, hex });
	return {
		material: DEFAULT_GRIP.material,
		texture: DEFAULT_GRIP.texture,
		overgrip: null,
		colorId: color?.id ?? DEFAULT_GRIP.colorId,
		finish: paint.finish === 'matte' ? 'matte' : 'gloss',
	};
};

export const upgradeV2ToV3 = (document: DesignDocumentV2): DesignDocumentV3 => ({
	schemaVersion: 3,
	racketModelId: document.racketModelId,
	zones: { frame: document.zones.frame, throat: document.zones.throat },
	grip: gripFromHandlePaint(document.zones.handle),
	overlays: { frame: document.overlays.frame, throat: document.overlays.throat },
	layers: document.layers.flatMap((layer) =>
		layer.zone === 'handle' ? [] : [{ ...layer, zone: layer.zone }],
	),
	meta: document.meta,
});

export const upgradeV3ToV4 = (document: DesignDocumentV3): DesignDocumentV4 => ({
	...document,
	schemaVersion: 4,
	buttCap: structuredClone(DEFAULT_BUTT_CAP),
});

export const upgradeGripV4ToV5 = (grip: GripSpecV4): GripSpec => ({
	...grip,
	customHex: null,
	overgrip:
		grip.overgrip === null
			? null
			: {
					colorId: grip.overgrip.colorId,
					material: grip.overgrip.finish === 'gloss' ? 'tacky' : 'dry',
					texture: 'smooth',
				},
});

export const upgradeV4ToV5 = (document: DesignDocumentV4): DesignDocumentV5 => ({
	...document,
	schemaVersion: 5,
	grip: upgradeGripV4ToV5(document.grip),
});

export const upgradeV6ToV7 = (document: DesignDocumentV6): DesignDocumentV7 => ({
	...document,
	schemaVersion: 7,
	shaftExtendsHead: true,
});

const withPrintOffsetY = (overlays: DesignOverlaysV7['frame']): ZoneOverlays => ({
	lines: overlays.lines,
	print: overlays.print === null ? null : { ...overlays.print, offsetY: 0.5 },
});

export const upgradeV8ToV9 = ({
	shaftExtendsHead: _shaftExtendsHead,
	...document
}: DesignDocumentV8): DesignDocumentV9 => ({
	...document,
	schemaVersion: 9,
});

export const upgradeV9ToV10 = (document: DesignDocumentV9): DesignDocument => ({
	...document,
	schemaVersion: DESIGN_SCHEMA_VERSION,
	logo: { ...DEFAULT_LOGO },
});

export const upgradeV7ToV8 = (document: DesignDocumentV7): DesignDocumentV8 => ({
	...document,
	schemaVersion: 8,
	overlays: {
		frame: withPrintOffsetY(document.overlays.frame),
		throat: withPrintOffsetY(document.overlays.throat),
	},
});

export const upgradeV5ToV6 = (document: DesignDocumentV5): DesignDocumentV6 => ({
	...document,
	schemaVersion: 6,
	grommets: { ...DEFAULT_GROMMETS },
	finishingTape: null,
});

export const upgradeDesignDocument = (value: unknown): DesignDocument | null => {
	if (isDesignDocument(value)) {
		return value;
	}
	if (isDesignDocumentV9(value)) {
		return upgradeV9ToV10(value);
	}
	if (isDesignDocumentV8(value)) {
		return upgradeV9ToV10(upgradeV8ToV9(value));
	}
	if (isDesignDocumentV7(value)) {
		return upgradeV9ToV10(upgradeV8ToV9(upgradeV7ToV8(value)));
	}
	if (isDesignDocumentV6(value)) {
		return upgradeV9ToV10(upgradeV8ToV9(upgradeV7ToV8(upgradeV6ToV7(value))));
	}
	if (isDesignDocumentV5(value)) {
		return upgradeV9ToV10(
			upgradeV8ToV9(upgradeV7ToV8(upgradeV6ToV7(upgradeV5ToV6(value)))),
		);
	}
	if (isDesignDocumentV4(value)) {
		return upgradeV9ToV10(
			upgradeV8ToV9(upgradeV7ToV8(upgradeV6ToV7(upgradeV5ToV6(upgradeV4ToV5(value))))),
		);
	}
	if (isDesignDocumentV3(value)) {
		return upgradeV9ToV10(
			upgradeV8ToV9(
				upgradeV7ToV8(upgradeV6ToV7(upgradeV5ToV6(upgradeV4ToV5(upgradeV3ToV4(value))))),
			),
		);
	}
	if (isDesignDocumentV2(value)) {
		return upgradeV9ToV10(
			upgradeV8ToV9(
				upgradeV7ToV8(
					upgradeV6ToV7(
						upgradeV5ToV6(upgradeV4ToV5(upgradeV3ToV4(upgradeV2ToV3(value)))),
					),
				),
			),
		);
	}
	if (isDesignDocumentV1(value)) {
		return upgradeV9ToV10(
			upgradeV8ToV9(
				upgradeV7ToV8(
					upgradeV6ToV7(
						upgradeV5ToV6(
							upgradeV4ToV5(upgradeV3ToV4(upgradeV2ToV3(upgradeV1ToV2(value)))),
						),
					),
				),
			),
		);
	}
	return null;
};
