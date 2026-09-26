import {
	DEFAULT_GRIP,
	findGripColor,
	findOvergripColor,
	getGripHex,
	GRIP_CATALOG,
	gripFromHandlePaint,
	isDesignDocument,
	isDesignDocumentV4,
	isValidGrip,
	nearestGripColor,
	upgradeDesignDocument,
	upgradeGripV4ToV5,
	withGripMaterial,
	withOvergripMaterial,
} from '@uniq/shared';

import { createDefaultDesign } from '@builder/design/default-design';
import {
	describeGrip,
	describeOvergrip,
	GRIP_FINISH_LABELS,
	GRIP_TEXTURE_LABELS,
	OVERGRIP_TEXTURE_LABELS,
} from '@builder/grips/grip-labels';
import {
	createSeededRandom,
	getGripLook,
	getGripMaterialParams,
	GRIP_SURFACE_SIZE,
	paintGripSurface,
} from '@builder/grips/grip-surface';

import type { GripContext, GripLook } from '@builder/grips/grip-surface';
import type { GripSpec, GripSpecV4 } from '@uniq/shared';

const LEATHER: GripSpec = {
	material: 'leather',
	colorId: 'brown',
	customHex: null,
	texture: 'perforated',
	finish: 'matte',
	overgrip: null,
};

const LEGACY_DEFAULT: GripSpecV4 = {
	material: DEFAULT_GRIP.material,
	colorId: DEFAULT_GRIP.colorId,
	texture: DEFAULT_GRIP.texture,
	finish: DEFAULT_GRIP.finish,
	overgrip: null,
};

describe('grip catalog', () => {
	it('finds base and overgrip colors', () => {
		expect(findGripColor({ material: 'leather', colorId: 'natural' })?.hex).toBe(
			'#c49a6c',
		);
		expect(findGripColor({ material: 'leather', colorId: 'pink' })).toBeNull();
		expect(findOvergripColor({ colorId: 'white' })?.name).toBe('White');
		expect(findOvergripColor({ colorId: 'gold' })).toBeNull();
	});

	it('keeps leather to real options', () => {
		expect(GRIP_CATALOG.leather.finishes).toEqual(['matte']);
		expect(GRIP_CATALOG.leather.textures).not.toContain('grooved');
	});

	it.each([
		['a valid leather grip', LEATHER, true],
		[
			'a valid synthetic grip with overgrip',
			{
				...DEFAULT_GRIP,
				overgrip: { colorId: 'pink', material: 'tacky', texture: 'smooth' },
			},
			true,
		],
		['a color from the other material', { ...LEATHER, colorId: 'pink' }, false],
		['grooved leather', { ...LEATHER, texture: 'grooved' }, false],
		['gloss leather', { ...LEATHER, finish: 'gloss' }, false],
		[
			'an unknown overgrip color',
			{
				...DEFAULT_GRIP,
				overgrip: { colorId: 'gold', material: 'dry', texture: 'smooth' },
			},
			false,
		],
		[
			'an unknown overgrip material',
			{
				...DEFAULT_GRIP,
				overgrip: { colorId: 'white', material: 'silk', texture: 'smooth' },
			},
			false,
		],
		[
			'a ribbed dry overgrip',
			{
				...DEFAULT_GRIP,
				overgrip: { colorId: 'white', material: 'dry', texture: 'ribbed' },
			},
			false,
		],
		['a custom hex color', { ...LEATHER, customHex: '#12ab9f' }, true],
		['a bad custom hex color', { ...LEATHER, customHex: 'red' }, false],
	] as const)('validates %s', (_label, grip, expected) => {
		expect(isValidGrip({ grip: grip as GripSpec })).toBe(expected);
	});

	it('switches material and keeps only what the new material allows', () => {
		const toLeather = withGripMaterial({
			grip: { ...DEFAULT_GRIP, colorId: 'pink', texture: 'grooved', finish: 'gloss' },
			material: 'leather',
		});
		expect(toLeather).toEqual({
			material: 'leather',
			colorId: 'natural',
			customHex: null,
			texture: 'smooth',
			finish: 'matte',
			overgrip: null,
		});

		const keep = withGripMaterial({
			grip: {
				...LEATHER,
				colorId: 'black',
				overgrip: { colorId: 'white', material: 'tacky', texture: 'smooth' },
			},
			material: 'synthetic',
		});
		expect(keep).toEqual({
			material: 'synthetic',
			colorId: 'black',
			customHex: null,
			texture: 'perforated',
			finish: 'matte',
			overgrip: { colorId: 'white', material: 'tacky', texture: 'smooth' },
		});
	});

	it('switches overgrip material and drops textures it does not allow', () => {
		const ribbed = { colorId: 'white', material: 'tacky', texture: 'ribbed' } as const;
		expect(withOvergripMaterial({ overgrip: ribbed, material: 'dry' })).toEqual({
			...ribbed,
			material: 'dry',
			texture: 'smooth',
		});
		expect(
			withOvergripMaterial({
				overgrip: { ...ribbed, texture: 'perforated' },
				material: 'dry',
			}).texture,
		).toBe('perforated');
	});

	it('reads the grip hex from a custom color or the catalog', () => {
		expect(getGripHex({ grip: LEATHER })).toBe('#7a4a2a');
		expect(getGripHex({ grip: { ...LEATHER, customHex: '#abcdef' } })).toBe('#abcdef');
		expect(getGripHex({ grip: { ...LEATHER, colorId: 'x' } })).toBeNull();
	});

	it('upgrades a v4 grip: gloss overgrip is tacky, matte is dry', () => {
		expect(
			upgradeGripV4ToV5({
				...LEGACY_DEFAULT,
				overgrip: { colorId: 'red', finish: 'gloss' },
			}),
		).toEqual({
			...DEFAULT_GRIP,
			overgrip: { colorId: 'red', material: 'tacky', texture: 'smooth' },
		});
		expect(
			upgradeGripV4ToV5({
				...LEGACY_DEFAULT,
				overgrip: { colorId: 'red', finish: 'matte' },
			}).overgrip?.material,
		).toBe('dry');
		expect(upgradeGripV4ToV5({ ...LEGACY_DEFAULT, overgrip: null })).toEqual(
			DEFAULT_GRIP,
		);
	});

	it('upgrades a v4 document to v5 and rejects bad v4 overgrips', () => {
		const current = createDefaultDesign();
		const v4 = {
			...current,
			schemaVersion: 4,
			grip: { ...LEGACY_DEFAULT, overgrip: { colorId: 'blue', finish: 'matte' } },
		};
		expect(isDesignDocumentV4(v4)).toBe(true);
		expect(upgradeDesignDocument(v4)?.grip.overgrip).toEqual({
			colorId: 'blue',
			material: 'dry',
			texture: 'smooth',
		});
		expect(
			isDesignDocumentV4({
				...v4,
				grip: { ...v4.grip, overgrip: { colorId: 'x', finish: 'matte' } },
			}),
		).toBe(false);
		expect(
			isDesignDocumentV4({
				...v4,
				grip: { ...v4.grip, overgrip: { colorId: 'blue', finish: 'x' } },
			}),
		).toBe(false);
		expect(isDesignDocumentV4({ ...v4, grip: 3 })).toBe(false);
		expect(isDesignDocumentV4({ ...v4, schemaVersion: 5 })).toBe(false);
	});

	it('picks the nearest color and handles an empty palette', () => {
		expect(
			nearestGripColor({ colors: GRIP_CATALOG.synthetic.colors, hex: '#1d1f24' })?.id,
		).toBe('black');
		expect(
			nearestGripColor({ colors: GRIP_CATALOG.synthetic.colors, hex: '#0000ff' })?.id,
		).toBe('blue');
		expect(nearestGripColor({ colors: [], hex: '#000000' })).toBeNull();
	});

	it('maps an old handle paint to a synthetic grip', () => {
		expect(
			gripFromHandlePaint({ finish: 'pearl', fill: { kind: 'solid', color: '#f0f0f0' } }),
		).toEqual({ ...LEGACY_DEFAULT, colorId: 'white', finish: 'gloss' });
		expect(
			gripFromHandlePaint({
				finish: 'matte',
				fill: {
					kind: 'gradient',
					angle: 0,
					stops: [
						{ offset: 0, color: '#1f7a46' },
						{ offset: 1, color: '#ffffff' },
					],
				},
			}),
		).toEqual({ ...LEGACY_DEFAULT, colorId: 'green', finish: 'matte' });
		expect(
			gripFromHandlePaint({
				finish: 'matte',
				fill: { kind: 'gradient', angle: 0, stops: [] },
			}).colorId,
		).toBe('black');
	});

	it.each([
		['grip not object', 3],
		['bad material', { ...DEFAULT_GRIP, material: 'rubber' }],
		['color id not string', { ...DEFAULT_GRIP, colorId: 1 }],
		['bad texture', { ...DEFAULT_GRIP, texture: 'woven' }],
		['bad finish', { ...DEFAULT_GRIP, finish: 'pearl' }],
		['overgrip not object', { ...DEFAULT_GRIP, overgrip: 'white' }],
		[
			'overgrip color not string',
			{ ...DEFAULT_GRIP, overgrip: { colorId: 2, material: 'dry', texture: 'smooth' } },
		],
		[
			'overgrip bad material',
			{
				...DEFAULT_GRIP,
				overgrip: { colorId: 'white', material: 'pearl', texture: 'smooth' },
			},
		],
		[
			'overgrip bad texture',
			{
				...DEFAULT_GRIP,
				overgrip: { colorId: 'white', material: 'dry', texture: 'woven' },
			},
		],
		['custom hex not string', { ...DEFAULT_GRIP, customHex: 5 }],
		['custom hex missing', { ...DEFAULT_GRIP, customHex: undefined }],
		['color not in material', { ...LEATHER, colorId: 'yellow' }],
		['gloss leather', { ...LEATHER, finish: 'gloss' }],
	])('rejects a document with %s', (_label, grip) => {
		expect(isDesignDocument({ ...createDefaultDesign(), grip })).toBe(false);
	});

	it('accepts a document with leather and an overgrip', () => {
		expect(
			isDesignDocument({
				...createDefaultDesign(),
				grip: {
					...LEATHER,
					overgrip: { colorId: 'black', material: 'dry', texture: 'smooth' },
				},
			}),
		).toBe(true);
	});
});

describe('grip labels', () => {
	it('describes grips and overgrips', () => {
		expect(describeGrip({ grip: LEATHER })).toBe('Leather · Brown');
		expect(describeGrip({ grip: { ...LEATHER, colorId: 'nope' } })).toBe('Leather · ');
		expect(describeOvergrip({ grip: LEATHER })).toBe('—');
		expect(
			describeOvergrip({
				grip: {
					...LEATHER,
					overgrip: { colorId: 'blue', material: 'tacky', texture: 'smooth' },
				},
			}),
		).toBe('Blue · tacky');
		expect(
			describeOvergrip({
				grip: {
					...LEATHER,
					overgrip: { colorId: 'x', material: 'dry', texture: 'smooth' },
				},
			}),
		).toBe(' · dry');
		expect(describeGrip({ grip: { ...LEATHER, customHex: '#12ab9f' } })).toBe(
			'Leather · Custom #12ab9f',
		);
		expect(OVERGRIP_TEXTURE_LABELS.ribbed).toBe('Ribbed');
		expect(GRIP_TEXTURE_LABELS.grooved).toBe('Grooved');
		expect(GRIP_FINISH_LABELS.gloss).toBe('Gloss · tacky');
	});
});

interface Recorder {
	context: GripContext;
	fillRects: [number, number, number, number][];
	fillStyles: string[];
	arcs: number;
	strokes: number;
}

const createRecorder = (): Recorder => {
	const recorder: Recorder = {
		context: {} as GripContext,
		fillRects: [],
		fillStyles: [],
		arcs: 0,
		strokes: 0,
	};
	let fillStyle = '';
	recorder.context = {
		save: vi.fn(),
		restore: vi.fn(),
		beginPath: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		fill: vi.fn(),
		stroke: () => {
			recorder.strokes += 1;
		},
		arc: () => {
			recorder.arcs += 1;
		},
		fillRect: (x: number, y: number, w: number, h: number) => {
			recorder.fillRects.push([x, y, w, h]);
			recorder.fillStyles.push(fillStyle);
		},
		get fillStyle(): string {
			return fillStyle;
		},
		set fillStyle(value: string) {
			fillStyle = value;
		},
		strokeStyle: '',
		lineWidth: 0,
		globalAlpha: 1,
	};
	return recorder;
};

const paint = ({ look }: { look: GripLook }): Recorder => {
	const recorder = createRecorder();
	paintGripSurface({ context: recorder.context, ...GRIP_SURFACE_SIZE, look });
	return recorder;
};

describe('grip surface', () => {
	it('uses the base grip or the overgrip on top', () => {
		expect(getGripLook({ grip: LEATHER })).toEqual({
			hex: '#7a4a2a',
			material: 'leather',
			texture: 'perforated',
			finish: 'matte',
			turns: 8,
		});
		expect(
			getGripLook({
				grip: {
					...LEATHER,
					overgrip: { colorId: 'yellow', material: 'tacky', texture: 'smooth' },
				},
			}),
		).toEqual({
			hex: '#f3e24a',
			material: 'overgrip-tacky',
			texture: 'smooth',
			finish: 'gloss',
			turns: 10,
		});
		expect(
			getGripLook({
				grip: {
					...LEATHER,
					overgrip: { colorId: 'white', material: 'dry', texture: 'perforated' },
				},
			}),
		).toMatchObject({ material: 'overgrip-dry', texture: 'perforated', finish: 'matte' });
		expect(getGripLook({ grip: { ...LEATHER, customHex: '#00ff00' } }).hex).toBe(
			'#00ff00',
		);
	});

	it('falls back to black for unknown colors', () => {
		expect(getGripLook({ grip: { ...LEATHER, colorId: 'x' } }).hex).toBe('#161616');
		expect(
			getGripLook({
				grip: {
					...LEATHER,
					overgrip: { colorId: 'x', material: 'dry', texture: 'smooth' },
				},
			}).hex,
		).toBe('#161616');
	});

	it('maps material and finish to material params', () => {
		const base = getGripLook({ grip: LEATHER });
		expect(getGripMaterialParams({ look: base }).sheen).toBeGreaterThan(0.3);
		const gloss = getGripMaterialParams({
			look: { ...base, material: 'synthetic', finish: 'gloss' },
		});
		const matte = getGripMaterialParams({
			look: { ...base, material: 'synthetic', finish: 'matte' },
		});
		const dry = getGripMaterialParams({
			look: { ...base, material: 'overgrip-dry', finish: 'matte' },
		});
		expect(dry.roughness).toBeGreaterThan(matte.roughness);
		expect(dry.sheen).toBeGreaterThan(matte.sheen);
		expect(gloss.roughness).toBeLessThan(matte.roughness);
		expect(gloss.clearcoat).toBeGreaterThan(0);
		expect(matte.clearcoat).toBe(0);
	});

	it('creates a deterministic random in [0, 1)', () => {
		const a = createSeededRandom({ seed: 3 });
		const b = createSeededRandom({ seed: 3 });
		const values = Array.from({ length: 50 }, () => a());
		expect(values).toEqual(Array.from({ length: 50 }, () => b()));
		values.forEach((value) => {
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		});
	});

	const synthetic = (texture: GripLook['texture']): GripLook => ({
		hex: '#1e63c4',
		material: 'synthetic',
		texture,
		finish: 'matte',
		turns: 8,
	});

	it('paints a smooth grip: base fill and wrap seams only', () => {
		const smooth = paint({ look: synthetic('smooth') });
		expect(smooth.fillRects).toEqual([
			[0, 0, GRIP_SURFACE_SIZE.width, GRIP_SURFACE_SIZE.height],
		]);
		expect(smooth.fillStyles[0]).toBe('#1e63c4');
		expect(smooth.arcs).toBe(0);
		expect(smooth.strokes).toBeGreaterThan(0);
	});

	it('adds holes for perforated and extra lines for grooved', () => {
		const smooth = paint({ look: synthetic('smooth') });
		expect(paint({ look: synthetic('perforated') }).arcs).toBeGreaterThan(50);
		expect(paint({ look: synthetic('grooved') }).strokes).toBeGreaterThan(
			smooth.strokes * 2,
		);
	});

	it('adds grain for leather', () => {
		const leather = paint({ look: { ...synthetic('smooth'), material: 'leather' } });
		expect(leather.fillRects.length).toBeGreaterThan(1000);
	});

	it('adds felt fibers for a dry overgrip and a raised rib for ribbed', () => {
		const smooth = paint({ look: synthetic('smooth') });
		const dry = paint({ look: { ...synthetic('smooth'), material: 'overgrip-dry' } });
		expect(dry.fillRects.length).toBeGreaterThan(2000);
		expect(paint({ look: synthetic('ribbed') }).strokes).toBeGreaterThan(smooth.strokes);
	});
});
