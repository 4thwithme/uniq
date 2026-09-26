import {
	BADGE_TEXT_PATTERN,
	DEFAULT_BUTT_CAP,
	findBadgeColor,
	findButtCapColor,
	isDesignDocument,
	isDesignDocumentV3,
	normalizeBadgeText,
	upgradeDesignDocument,
	upgradeV3ToV4,
} from '@uniq/shared';

import { getBadgeText, paintButtCapFace } from '@builder/buttcap/badge-painter';
import { BADGE_PRESET_LABELS, describeButtCap } from '@builder/buttcap/butt-cap-labels';
import { createDefaultDesign } from '@builder/design/default-design';
import { setButtCapCommand } from '@builder/design/design-commands';

import type { BadgeContext } from '@builder/buttcap/badge-painter';
import type { ButtCapSpec, DesignDocument, DesignDocumentV3 } from '@uniq/shared';

const withoutButtCap = ({
	document,
}: {
	document: DesignDocument;
}): Omit<DesignDocument, 'buttCap'> => {
	const copy: Partial<DesignDocument> = { ...document };
	delete copy.buttCap;
	return copy as Omit<DesignDocument, 'buttCap'>;
};

interface Call {
	name: string;
	args: unknown[];
}

const createRecorder = (): { context: BadgeContext; calls: Call[]; fills: unknown[] } => {
	const calls: Call[] = [];
	const fills: unknown[] = [];
	const record =
		({ name }: { name: string }) =>
		(...args: unknown[]): void => {
			calls.push({ name, args });
		};
	const gradient = { addColorStop: vi.fn() };
	const context = {
		save: record({ name: 'save' }),
		restore: record({ name: 'restore' }),
		fillRect: (...args: unknown[]): void => {
			fills.push(context.fillStyle);
			calls.push({ name: 'fillRect', args });
		},
		beginPath: record({ name: 'beginPath' }),
		arc: record({ name: 'arc' }),
		fill: record({ name: 'fill' }),
		stroke: record({ name: 'stroke' }),
		translate: record({ name: 'translate' }),
		scale: record({ name: 'scale' }),
		fillText: record({ name: 'fillText' }),
		moveTo: record({ name: 'moveTo' }),
		bezierCurveTo: record({ name: 'bezierCurveTo' }),
		createRadialGradient: (...args: unknown[]) => {
			calls.push({ name: 'createRadialGradient', args });
			return gradient;
		},
		fillStyle: '' as unknown,
		strokeStyle: '' as unknown,
		lineWidth: 0,
		font: '',
		textAlign: 'start',
		textBaseline: 'alphabetic',
		globalAlpha: 1,
	};
	return { context: context as unknown as BadgeContext, calls, fills };
};

const names = ({ calls, name }: { calls: Call[]; name: string }): Call[] =>
	calls.filter((call) => call.name === name);

const createPath = vi.fn(({ d }: { d: string }) => ({ d }) as unknown as Path2D);

const withBadge = ({ badge }: { badge: ButtCapSpec['badge'] }): ButtCapSpec => ({
	...DEFAULT_BUTT_CAP,
	badge,
});

describe('butt cap catalog helpers', () => {
	it('finds colors and normalizes badge text', () => {
		expect(findButtCapColor({ colorId: 'red' })?.name).toBe('Red');
		expect(findButtCapColor({ colorId: 'nope' })).toBeNull();
		expect(findBadgeColor({ colorId: 'gold' })?.name).toBe('Gold');
		expect(findBadgeColor({ colorId: 'nope' })).toBeNull();
		expect(normalizeBadgeText({ text: 'ab!c9' })).toBe('ABC');
		expect(normalizeBadgeText({ text: '!!' })).toBe('');
		expect(BADGE_TEXT_PATTERN.test('AB')).toBe(true);
		expect(BADGE_TEXT_PATTERN.test('ab')).toBe(false);
	});
});

describe('butt cap validation', () => {
	const base = createDefaultDesign();
	const withCap = (buttCap: unknown): unknown => ({ ...base, buttCap });

	it('accepts none, preset and text badges', () => {
		expect(isDesignDocument(base)).toBe(true);
		expect(
			isDesignDocument(withCap({ ...DEFAULT_BUTT_CAP, badge: { kind: 'none' } })),
		).toBe(true);
		expect(
			isDesignDocument(
				withCap({
					...DEFAULT_BUTT_CAP,
					badge: { kind: 'text', text: 'AB1', colorId: 'gold' },
				}),
			),
		).toBe(true);
		expect(
			isDesignDocument(
				withCap({
					...DEFAULT_BUTT_CAP,
					finish: 'matte',
					badge: { kind: 'preset', presetId: 'bolt', colorId: 'red' },
				}),
			),
		).toBe(true);
	});

	it.each([
		['not an object', null],
		['bad cap color', { ...DEFAULT_BUTT_CAP, colorId: 'purple' }],
		['cap color not string', { ...DEFAULT_BUTT_CAP, colorId: 3 }],
		['bad finish', { ...DEFAULT_BUTT_CAP, finish: 'satin' }],
		['badge not object', { ...DEFAULT_BUTT_CAP, badge: 'none' }],
		[
			'preset bad id',
			{
				...DEFAULT_BUTT_CAP,
				badge: { kind: 'preset', presetId: 'heart', colorId: 'white' },
			},
		],
		[
			'preset bad color',
			{
				...DEFAULT_BUTT_CAP,
				badge: { kind: 'preset', presetId: 'star', colorId: 'pink' },
			},
		],
		[
			'preset color not string',
			{ ...DEFAULT_BUTT_CAP, badge: { kind: 'preset', presetId: 'star', colorId: 1 } },
		],
		[
			'text bad pattern',
			{ ...DEFAULT_BUTT_CAP, badge: { kind: 'text', text: 'A!', colorId: 'white' } },
		],
		[
			'text lowercase',
			{ ...DEFAULT_BUTT_CAP, badge: { kind: 'text', text: 'ab', colorId: 'white' } },
		],
		[
			'text four chars',
			{ ...DEFAULT_BUTT_CAP, badge: { kind: 'text', text: 'ABCD', colorId: 'white' } },
		],
		[
			'text not string',
			{ ...DEFAULT_BUTT_CAP, badge: { kind: 'text', text: 12, colorId: 'white' } },
		],
		[
			'text bad color',
			{ ...DEFAULT_BUTT_CAP, badge: { kind: 'text', text: 'AB', colorId: 'pink' } },
		],
		[
			'unknown kind',
			{ ...DEFAULT_BUTT_CAP, badge: { kind: 'sticker', colorId: 'white' } },
		],
	])('rejects %s', (_label, buttCap) => {
		expect(isDesignDocument(withCap(buttCap))).toBe(false);
	});

	it('rejects a document without a butt cap', () => {
		expect(isDesignDocument(withoutButtCap({ document: base }))).toBe(false);
	});
});

describe('v3 to v4 upgrade', () => {
	const base = createDefaultDesign();
	const v3: DesignDocumentV3 = {
		...withoutButtCap({ document: base }),
		layers: [],
		grip: {
			material: base.grip.material,
			colorId: base.grip.colorId,
			texture: base.grip.texture,
			finish: base.grip.finish,
			overgrip: null,
		},
		schemaVersion: 3,
	};

	it('adds the default butt cap', () => {
		expect(isDesignDocumentV3(v3)).toBe(true);
		expect(isDesignDocumentV3({ ...v3, schemaVersion: 4 })).toBe(false);
		expect(isDesignDocumentV3('x')).toBe(false);

		const upgraded = upgradeV3ToV4(v3);
		expect(upgraded.schemaVersion).toBe(4);
		expect(upgraded.buttCap).toEqual(DEFAULT_BUTT_CAP);
		expect(upgraded.buttCap).not.toBe(DEFAULT_BUTT_CAP);
		expect(upgradeDesignDocument(v3)).toEqual({ ...base, finishingTape: null });
	});
});

describe('butt cap labels and command', () => {
	it('describes none, preset and text badges', () => {
		expect(describeButtCap({ buttCap: withBadge({ badge: { kind: 'none' } }) })).toBe(
			'Black · no badge',
		);
		expect(describeButtCap({ buttCap: DEFAULT_BUTT_CAP })).toBe(
			`Black · ${BADGE_PRESET_LABELS.monogram} in white`,
		);
		expect(
			describeButtCap({
				buttCap: {
					colorId: 'nope',
					finish: 'matte',
					badge: { kind: 'text', text: 'AB', colorId: 'nope' },
				},
			}),
		).toBe(' · AB in ');
	});

	it('sets the butt cap and ignores an identical one', () => {
		const document = createDefaultDesign();
		const same = setButtCapCommand({ buttCap: structuredClone(document.buttCap) });

		expect(same.apply({ document })).toBe(document);
		expect(same.label).toBe('Grip Cap');
		expect(same.mergeKey).toBeNull();

		const changed = setButtCapCommand({
			buttCap: { ...document.buttCap, colorId: 'red' },
			mergeKey: 'cap',
		});
		expect(changed.mergeKey).toBe('cap');
		expect(changed.apply({ document }).buttCap.colorId).toBe('red');
	});
});

describe('badge painter', () => {
	afterEach(() => {
		createPath.mockClear();
	});

	it('returns badge text for letters and the monogram only', () => {
		expect(getBadgeText({ badge: { kind: 'text', text: 'AB', colorId: 'white' } })).toBe(
			'AB',
		);
		expect(
			getBadgeText({ badge: { kind: 'preset', presetId: 'monogram', colorId: 'white' } }),
		).toBe('U');
		expect(
			getBadgeText({ badge: { kind: 'preset', presetId: 'star', colorId: 'white' } }),
		).toBeNull();
		expect(getBadgeText({ badge: { kind: 'none' } })).toBeNull();
	});

	it('draws letters with a larger font for short text and a gloss highlight', () => {
		const short = createRecorder();
		paintButtCapFace({
			context: short.context,
			buttCap: withBadge({ badge: { kind: 'text', text: 'AB', colorId: 'gold' } }),
			createPath,
		});
		expect(names({ calls: short.calls, name: 'fillText' })[0]?.args[0]).toBe('AB');
		expect(short.context.font).toContain('92px');
		expect(names({ calls: short.calls, name: 'createRadialGradient' })).toHaveLength(1);
		expect(short.fills[0]).toBe('#151515');

		const long = createRecorder();
		paintButtCapFace({
			context: long.context,
			size: 100,
			buttCap: withBadge({ badge: { kind: 'text', text: 'ABC', colorId: 'gold' } }),
			createPath,
		});
		expect(long.context.font).toContain('26px');
	});

	it('draws the monogram as a U', () => {
		const { context, calls } = createRecorder();
		paintButtCapFace({ context, buttCap: DEFAULT_BUTT_CAP, createPath });
		expect(names({ calls, name: 'fillText' })[0]?.args[0]).toBe('U');
	});

	it('draws a ball with an arc and two seam curves', () => {
		const { context, calls } = createRecorder();
		paintButtCapFace({
			context,
			buttCap: withBadge({
				badge: { kind: 'preset', presetId: 'ball', colorId: 'volt' },
			}),
			createPath,
		});
		expect(names({ calls, name: 'bezierCurveTo' })).toHaveLength(2);
		expect(names({ calls, name: 'fillText' })).toHaveLength(0);
		expect(createPath).not.toHaveBeenCalled();
	});

	it.each(['star', 'bolt'] as const)('fills the %s shape path', (presetId) => {
		const { context, calls } = createRecorder();
		paintButtCapFace({
			context,
			buttCap: withBadge({ badge: { kind: 'preset', presetId, colorId: 'white' } }),
			createPath,
		});
		expect(createPath).toHaveBeenCalledTimes(1);
		expect(names({ calls, name: 'fill' }).length).toBeGreaterThan(0);
		expect(names({ calls, name: 'scale' })).toHaveLength(1);
	});

	it('draws no badge for none, no highlight when matte, and falls back on unknown colors', () => {
		const { context, calls, fills } = createRecorder();
		paintButtCapFace({
			context,
			buttCap: {
				colorId: 'nope',
				finish: 'matte',
				badge: { kind: 'none' },
			},
			createPath,
		});
		expect(names({ calls, name: 'fillText' })).toHaveLength(0);
		expect(names({ calls, name: 'createRadialGradient' })).toHaveLength(0);
		expect(fills[0]).toBe('#151515');

		const fallback = createRecorder();
		paintButtCapFace({
			context: fallback.context,
			buttCap: {
				colorId: 'red',
				finish: 'matte',
				badge: { kind: 'text', text: 'A', colorId: 'nope' },
			},
			createPath,
		});
		expect(fallback.context.fillStyle).toBe('#ffffff');
	});
});
