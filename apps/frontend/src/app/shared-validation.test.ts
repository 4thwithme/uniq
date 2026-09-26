import {
	DESIGN_SCHEMA_VERSION,
	isDesignDocument,
	isDesignDocumentV1,
	isDesignDocumentV2,
	isHexColor,
	upgradeDesignDocument,
} from '@uniq/shared';

import { createDefaultDesign } from '@builder/design/default-design';

describe('@uniq/shared validation', () => {
	const valid = createDefaultDesign();

	it('accepts the default design and a gradient design', () => {
		expect(isDesignDocument(valid)).toBe(true);
		expect(
			isDesignDocument({
				...valid,
				zones: {
					...valid.zones,
					frame: {
						finish: 'pearl',
						fill: {
							kind: 'gradient',
							angle: 10,
							stops: [
								{ offset: 0, color: '#000000' },
								{ offset: 1, color: '#FFFFFF' },
							],
						},
					},
				},
				meta: { name: 'x', themeId: 'volt' },
			}),
		).toBe(true);
	});

	it.each([
		['not an object', null],
		['array', []],
		['wrong schema version', { ...valid, schemaVersion: DESIGN_SCHEMA_VERSION + 1 }],
		['empty racket model', { ...valid, racketModelId: '' }],
		['missing zone', { ...valid, zones: { frame: valid.zones.frame } }],
		[
			'bad finish',
			{
				...valid,
				zones: { ...valid.zones, frame: { ...valid.zones.frame, finish: 'shiny' } },
			},
		],
		[
			'bad color',
			{
				...valid,
				zones: {
					...valid.zones,
					frame: { finish: 'gloss', fill: { kind: 'solid', color: 'red' } },
				},
			},
		],
		[
			'bad fill kind',
			{
				...valid,
				zones: { ...valid.zones, frame: { finish: 'gloss', fill: { kind: 'pattern' } } },
			},
		],
		[
			'fill not object',
			{ ...valid, zones: { ...valid.zones, frame: { finish: 'gloss', fill: 'x' } } },
		],
		[
			'too few stops',
			{
				...valid,
				zones: {
					...valid.zones,
					frame: {
						finish: 'gloss',
						fill: {
							kind: 'gradient',
							angle: 0,
							stops: [{ offset: 0, color: '#000000' }],
						},
					},
				},
			},
		],
		[
			'stop out of range',
			{
				...valid,
				zones: {
					...valid.zones,
					frame: {
						finish: 'gloss',
						fill: {
							kind: 'gradient',
							angle: 0,
							stops: [
								{ offset: 0, color: '#000000' },
								{ offset: 2, color: '#000000' },
							],
						},
					},
				},
			},
		],
		[
			'stop not object',
			{
				...valid,
				zones: {
					...valid.zones,
					frame: { finish: 'gloss', fill: { kind: 'gradient', angle: 0, stops: [1, 2] } },
				},
			},
		],
		[
			'bad angle',
			{
				...valid,
				zones: {
					...valid.zones,
					frame: {
						finish: 'gloss',
						fill: {
							kind: 'gradient',
							angle: Number.NaN,
							stops: [
								{ offset: 0, color: '#000000' },
								{ offset: 1, color: '#000000' },
							],
						},
					},
				},
			},
		],
		['bad meta', { ...valid, meta: null }],
		['bad theme id', { ...valid, meta: { name: 'x', themeId: 3 } }],
		['bad name', { ...valid, meta: { name: 3, themeId: null } }],
	])('rejects %s', (_label, value) => {
		expect(isDesignDocument(value)).toBe(false);
	});

	it('checks hex colors', () => {
		expect(isHexColor('#a1B2c3')).toBe(true);
		expect(isHexColor('#abc')).toBe(false);
		expect(isHexColor(123)).toBe(false);
	});
});

describe('@uniq/shared v3 overlays, layers and grip', () => {
	const base = createDefaultDesign();
	const shape = {
		id: 'shape-1',
		kind: 'shape',
		zone: 'frame',
		shape: 'star',
		color: '#ffffff',
		position: { u: 0.5, v: 0.5 },
		rotation: 15,
		scale: 0.6,
	};
	const lines = { patternId: 'chevron', color: '#000000', density: 12, thickness: 0.2 };
	const print = {
		source: { kind: 'preset', presetId: 'flames' },
		scale: 0.8,
		repeat: 3,
		offset: 0.25,
		offsetY: 0.5,
	};
	const withFrame = (frame: unknown): unknown => ({
		...base,
		overlays: { ...base.overlays, frame },
	});

	it('accepts lines, a preset or uploaded print and shape layers', () => {
		expect(isDesignDocument(withFrame({ lines, print }))).toBe(true);
		expect(
			isDesignDocument(
				withFrame({
					lines: null,
					print: {
						...print,
						source: { kind: 'upload', assetId: 'a1', name: 'logo.png' },
					},
				}),
			),
		).toBe(true);
		expect(isDesignDocument({ ...base, layers: [shape] })).toBe(true);
	});

	it.each([
		['bad pattern', withFrame({ lines: { ...lines, patternId: 'dots' }, print: null })],
		[
			'density out of range',
			withFrame({ lines: { ...lines, density: 99 }, print: null }),
		],
		[
			'bad print source',
			withFrame({ lines: null, print: { ...print, source: { kind: 'url' } } }),
		],
		['source not object', withFrame({ lines: null, print: { ...print, source: 'x' } })],
		[
			'empty preset',
			withFrame({
				lines: null,
				print: { ...print, source: { kind: 'preset', presetId: '' } },
			}),
		],
		['fractional repeat', withFrame({ lines: null, print: { ...print, repeat: 1.5 } })],
		['overlays missing zone', { ...base, overlays: { frame: base.overlays.frame } }],
		['overlays not object', { ...base, overlays: null }],
		['zone overlay not object', withFrame(3)],
		['layers not array', { ...base, layers: {} }],
		['layer not object', { ...base, layers: [1] }],
		['bad shape', { ...base, layers: [{ ...shape, shape: 'unicorn' }] }],
		['bad layer kind', { ...base, layers: [{ ...shape, kind: 'text' }] }],
		[
			'position out of range',
			{ ...base, layers: [{ ...shape, position: { u: 2, v: 0 } }] },
		],
		['position not object', { ...base, layers: [{ ...shape, position: null }] }],
		['bad rotation', { ...base, layers: [{ ...shape, rotation: Number.NaN }] }],
		['duplicate ids', { ...base, layers: [shape, shape] }],
		[
			'too many layers',
			{
				...base,
				layers: Array.from({ length: 25 }, (_, i) => ({ ...shape, id: `s${String(i)}` })),
			},
		],
	])('rejects %s', (_label, value) => {
		expect(isDesignDocument(value)).toBe(false);
	});

	const legacyZones = {
		...base.zones,
		handle: { finish: 'matte', fill: { kind: 'solid', color: '#1d1f24' } },
	};

	it('upgrades v1 through v2 to v3, keeps v3 and rejects garbage', () => {
		const v1 = {
			schemaVersion: 1,
			racketModelId: 'm',
			zones: legacyZones,
			meta: base.meta,
		};

		expect(isDesignDocumentV1(v1)).toBe(true);
		expect(isDesignDocumentV1({ ...v1, zones: base.zones })).toBe(false);
		expect(upgradeDesignDocument(v1)).toEqual({
			...base,
			racketModelId: 'm',
			finishingTape: null,
		});
		expect(upgradeDesignDocument(base)).toBe(base);
		expect(upgradeDesignDocument({ schemaVersion: 1 })).toBeNull();
		expect(upgradeDesignDocument('nope')).toBeNull();
	});

	it('upgrades a v2 document: drops handle overlays and layers, maps the handle paint', () => {
		const overlays = { ...base.overlays, handle: { lines: null, print: null } };
		const frameShape = { ...shape, id: 'keep' };
		const v2 = {
			schemaVersion: 2,
			racketModelId: 'm',
			zones: {
				...legacyZones,
				handle: {
					finish: 'gloss',
					fill: {
						kind: 'gradient',
						angle: 0,
						stops: [
							{ offset: 0, color: '#c02030' },
							{ offset: 1, color: '#ffffff' },
						],
					},
				},
			},
			overlays,
			layers: [frameShape, { ...shape, id: 'drop', zone: 'handle' }],
			meta: base.meta,
		};

		expect(isDesignDocumentV2(v2)).toBe(true);
		expect(isDesignDocumentV2({ ...v2, overlays: base.overlays })).toBe(false);
		expect(isDesignDocumentV2({ ...v2, layers: [{ ...shape, zone: 'grip' }] })).toBe(
			false,
		);
		expect(isDesignDocumentV2({ ...v2, schemaVersion: 3 })).toBe(false);

		const upgraded = upgradeDesignDocument(v2);
		expect(upgraded).toEqual({
			...base,
			racketModelId: 'm',
			grip: { ...base.grip, colorId: 'red', finish: 'gloss' },
			finishingTape: null,
			layers: [frameShape],
		});
		expect(Object.keys(upgraded?.overlays ?? {})).toEqual(['frame', 'throat']);
	});
});
