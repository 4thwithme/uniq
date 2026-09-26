import { FRAME_BANDS } from '@builder/decor/frame-faces';
import { markTextureDirty, paintSurface } from '@builder/decor/surface-painter';
import { createDefaultDesign } from '@builder/design/default-design';

import type { PrintImage, SurfaceContext } from '@builder/decor/surface-painter';
import type { DesignLayer, ZoneOverlays, ZonePaint } from '@uniq/shared';

interface RecordingContext {
	context: SurfaceContext;
	calls: { name: string; args: unknown[] }[];
	fills: unknown[];
	gradient: { addColorStop: ReturnType<typeof vi.fn> };
}

const createRecordingContext = (): RecordingContext => {
	const calls: { name: string; args: unknown[] }[] = [];
	const fills: unknown[] = [];
	const gradient = { addColorStop: vi.fn() };
	const record =
		({ name }: { name: string }) =>
		(...args: unknown[]): void => {
			calls.push({ name, args });
		};
	const context = {
		save: record({ name: 'save' }),
		restore: record({ name: 'restore' }),
		fillRect: record({ name: 'fillRect' }),
		beginPath: record({ name: 'beginPath' }),
		moveTo: record({ name: 'moveTo' }),
		lineTo: record({ name: 'lineTo' }),
		stroke: record({ name: 'stroke' }),
		translate: record({ name: 'translate' }),
		rotate: record({ name: 'rotate' }),
		scale: record({ name: 'scale' }),
		fill: (...args: unknown[]): void => {
			calls.push({ name: 'fill', args });
			fills.push(context.fillStyle);
		},
		drawImage: record({ name: 'drawImage' }),
		rect: record({ name: 'rect' }),
		clip: record({ name: 'clip' }),
		createLinearGradient: (...args: unknown[]): unknown => {
			calls.push({ name: 'createLinearGradient', args });
			return gradient;
		},
		fillStyle: '' as unknown,
		strokeStyle: '' as unknown,
		lineWidth: 0,
		lineJoin: 'round',
		lineCap: 'round',
	};
	return { context: context as unknown as SurfaceContext, calls, fills, gradient };
};

const count = ({
	calls,
	name,
}: {
	calls: RecordingContext['calls'];
	name: string;
}): number => calls.filter((call) => call.name === name).length;

const SOLID: ZonePaint = { finish: 'gloss', fill: { kind: 'solid', color: '#123456' } };
const EMPTY: ZoneOverlays = { lines: null, print: null };
const IMAGE: PrintImage = { image: {} as CanvasImageSource, width: 200, height: 100 };
const createPath = vi.fn(({ d }: { d: string }) => ({ d }) as unknown as Path2D);

const paint = ({
	recording,
	zonePaint = SOLID,
	overlays = EMPTY,
	layers = [],
	printImage = null,
}: {
	recording: RecordingContext;
	zonePaint?: ZonePaint;
	overlays?: ZoneOverlays;
	layers?: DesignLayer[];
	printImage?: PrintImage | null;
}): void => {
	paintSurface({
		context: recording.context,
		width: 400,
		height: 40,
		paint: zonePaint,
		overlays,
		layers,
		printImage,
		bands: FRAME_BANDS,
		createPath,
	});
};

describe('paintSurface', () => {
	it('paints a solid base only', () => {
		const recording = createRecordingContext();
		paint({ recording });

		expect(recording.context.fillStyle).toBe('#123456');
		expect(count({ calls: recording.calls, name: 'fillRect' })).toBe(1);
		expect(count({ calls: recording.calls, name: 'stroke' })).toBe(0);
		expect(count({ calls: recording.calls, name: 'drawImage' })).toBe(0);
	});

	it('paints a gradient base with every stop', () => {
		const recording = createRecordingContext();
		const { zones } = createDefaultDesign();
		paint({
			recording,
			zonePaint: {
				...zones.frame,
				fill: {
					kind: 'gradient',
					angle: 0,
					stops: [
						{ offset: 0, color: '#000000' },
						{ offset: 1, color: '#ffffff' },
					],
				},
			},
		});

		expect(count({ calls: recording.calls, name: 'createLinearGradient' })).toBe(1);
		expect(recording.gradient.addColorStop).toHaveBeenCalledTimes(2);
		expect(recording.context.fillStyle).toBe(recording.gradient);
	});

	it('strokes line patterns with the line color', () => {
		const recording = createRecordingContext();
		paint({
			recording,
			overlays: {
				lines: { patternId: 'chevron', color: '#ff0000', density: 10, thickness: 0.5 },
				print: null,
			},
		});

		expect(recording.context.strokeStyle).toBe('#ff0000');
		expect(recording.context.lineWidth).toBe(8);
		expect(count({ calls: recording.calls, name: 'stroke' })).toBeGreaterThan(0);
		expect(count({ calls: recording.calls, name: 'moveTo' })).toBe(
			count({ calls: recording.calls, name: 'stroke' }),
		);
		expect(count({ calls: recording.calls, name: 'lineTo' })).toBeGreaterThan(0);
	});

	it('draws 9 wrapped copies per repeat and band, flipping the back band', () => {
		const recording = createRecordingContext();
		paint({
			recording,
			overlays: {
				lines: null,
				print: {
					source: { kind: 'preset', presetId: 'flames' },
					scale: 1,
					repeat: 2,
					offset: 0.9,
					offsetY: 0.5,
				},
			},
			printImage: IMAGE,
		});

		expect(count({ calls: recording.calls, name: 'drawImage' })).toBe(
			9 * 2 * FRAME_BANDS.length,
		);
		const [firstDraw] = recording.calls.filter((call) => call.name === 'drawImage');
		expect(firstDraw?.args.slice(1)).toEqual([-100, -50, 200, 100]);
		const scales = recording.calls
			.filter((call) => call.name === 'scale')
			.map((call) => call.args);
		expect(scales).toContainEqual([1, 1]);
		expect(scales).toContainEqual([-1, 1]);
	});

	it('tiles multiple rows to cover the full band height, not just a strip', () => {
		const recording = createRecordingContext();
		const short: PrintImage = { image: {} as CanvasImageSource, width: 200, height: 30 };
		paint({
			recording,
			overlays: {
				lines: null,
				print: {
					source: { kind: 'preset', presetId: 'flames' },
					scale: 1,
					repeat: 4,
					offset: 0,
					offsetY: 0.5,
				},
			},
			printImage: short,
		});

		const rows = 2;
		expect(count({ calls: recording.calls, name: 'drawImage' })).toBe(
			9 * 4 * FRAME_BANDS.length * rows,
		);
	});

	it('skips the print without an image or with a zero-height image', () => {
		const overlays: ZoneOverlays = {
			lines: null,
			print: {
				source: { kind: 'preset', presetId: 'flames' },
				scale: 1,
				repeat: 1,
				offset: 0,
				offsetY: 0.5,
			},
		};
		const noImage = createRecordingContext();
		paint({ recording: noImage, overlays });
		const flat = createRecordingContext();
		paint({ recording: flat, overlays, printImage: { ...IMAGE, height: 0 } });

		expect(count({ calls: noImage.calls, name: 'drawImage' })).toBe(0);
		expect(count({ calls: flat.calls, name: 'drawImage' })).toBe(0);
	});

	it('fills shapes with their color and path', () => {
		const recording = createRecordingContext();
		createPath.mockClear();
		paint({
			recording,
			layers: [
				{
					id: 's1',
					kind: 'shape',
					zone: 'frame',
					shape: 'star',
					color: '#00ff00',
					position: { u: 0.5, v: 0.5 },
					rotation: 90,
					scale: 0.5,
				},
			],
		});

		expect(createPath).toHaveBeenCalledTimes(1);
		expect(count({ calls: recording.calls, name: 'fill' })).toBe(9 * FRAME_BANDS.length);
		expect(new Set(recording.fills)).toEqual(new Set(['#00ff00']));
		expect(recording.calls.find((call) => call.name === 'rotate')?.args[0]).toBeCloseTo(
			Math.PI / 2,
		);
	});
});

describe('markTextureDirty', () => {
	it('flags the texture for upload', () => {
		const texture = { needsUpdate: false };
		markTextureDirty({ texture });
		expect(texture.needsUpdate).toBe(true);
	});
});

describe('stickers and the HEAD logo', () => {
	const paint: ZonePaint = { finish: 'gloss', fill: { kind: 'solid', color: '#f5f5f5' } };
	const emptyOverlays: ZoneOverlays = { lines: null, print: null };
	const sticker: DesignLayer = {
		id: 'st',
		kind: 'sticker',
		zone: 'frame',
		stickerId: 'tiger',
		position: { u: 0.25, v: 0.5 },
		rotation: 0,
		scale: 0.5,
	};
	const createPath = ({ d }: { d: string }): Path2D => ({ d }) as unknown as Path2D;
	const image: PrintImage = { image: {} as CanvasImageSource, width: 200, height: 100 };

	it('draws loaded stickers and skips ones still loading', () => {
		const loaded = createRecordingContext();
		paintSurface({
			context: loaded.context,
			width: 400,
			height: 100,
			paint,
			overlays: emptyOverlays,
			layers: [sticker],
			printImage: null,
			bands: FRAME_BANDS,
			createPath,
			stickerImages: new Map([['tiger', image]]),
		});
		const draws = loaded.calls.filter((call) => call.name === 'drawImage');
		expect(draws.length).toBeGreaterThanOrEqual(2);
		expect(draws[0]?.args.slice(1)).toEqual([-25, -12.5, 50, 25]);

		const waiting = createRecordingContext();
		paintSurface({
			context: waiting.context,
			width: 400,
			height: 100,
			paint,
			overlays: emptyOverlays,
			layers: [sticker, { ...sticker, id: 'flat', stickerId: 'rose' }],
			printImage: null,
			bands: FRAME_BANDS,
			createPath,
			stickerImages: new Map([['rose', { ...image, height: 0 }]]),
		});
		expect(count({ calls: waiting.calls, name: 'drawImage' })).toBe(0);
	});

	it('paints the logo last on a clean patch, dark on light frames and light on dark', () => {
		const light = createRecordingContext();
		paintSurface({
			context: light.context,
			width: 400,
			height: 100,
			paint,
			overlays: emptyOverlays,
			layers: [sticker],
			printImage: null,
			bands: FRAME_BANDS,
			createPath,
			stickerImages: new Map([['tiger', image]]),
			logo: { color: 'auto', size: 1 },
		});
		const lastDraw = light.calls.map((call) => call.name).lastIndexOf('drawImage');
		const firstClip = light.calls.findIndex((call) => call.name === 'clip');
		expect(firstClip).toBeGreaterThan(lastDraw);
		expect(count({ calls: light.calls, name: 'clip' })).toBeGreaterThanOrEqual(4);
		expect(light.fills.at(-1)).toBe('#111111');

		const dark = createRecordingContext();
		paintSurface({
			context: dark.context,
			width: 400,
			height: 100,
			paint: {
				finish: 'matte',
				fill: {
					kind: 'gradient',
					angle: 0,
					stops: [
						{ offset: 0, color: '#101010' },
						{ offset: 1, color: '#303030' },
					],
				},
			},
			overlays: emptyOverlays,
			layers: [],
			printImage: null,
			bands: FRAME_BANDS,
			createPath,
			logo: { color: 'auto', size: 1 },
		});
		expect(dark.fills.at(-1)).toBe('#ffffff');

		const bare = createRecordingContext();
		paintSurface({
			context: bare.context,
			width: 400,
			height: 100,
			paint,
			overlays: emptyOverlays,
			layers: [],
			printImage: null,
			bands: FRAME_BANDS,
			createPath,
		});
		expect(count({ calls: bare.calls, name: 'clip' })).toBe(0);
	});
});
