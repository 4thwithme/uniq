import { CanvasTexture } from 'three';

import {
	createGradientTexture,
	getGradientEndpoints,
	GRADIENT_TEXTURE_SIZE,
} from '@builder/materials/gradient-texture';

import type { GradientFill } from '@uniq/shared';

const GRADIENT: GradientFill = {
	kind: 'gradient',
	angle: 0,
	stops: [
		{ offset: 0, color: '#000000' },
		{ offset: 1, color: '#ffffff' },
	],
};

const createFakeCanvas = (): {
	canvas: HTMLCanvasElement;
	addColorStop: ReturnType<typeof vi.fn>;
} => {
	const addColorStop = vi.fn();
	const context = {
		createLinearGradient: vi.fn(() => ({ addColorStop })),
		fillRect: vi.fn(),
		fillStyle: '',
	};
	const canvas = {
		width: 0,
		height: 0,
		getContext: vi.fn(() => context),
	} as unknown as HTMLCanvasElement;

	return { canvas, addColorStop };
};

describe('getGradientEndpoints', () => {
	it('maps angles to start/end points across the texture', () => {
		expect(getGradientEndpoints({ angle: 0, size: 100 })).toEqual([0, 50, 100, 50]);
		getGradientEndpoints({ angle: 90, size: 100 }).forEach((value, index) => {
			expect(value).toBeCloseTo([50, 0, 50, 100][index] ?? Number.NaN);
		});
	});
});

describe('createGradientTexture', () => {
	it('paints every stop into a canvas texture', () => {
		const { canvas, addColorStop } = createFakeCanvas();

		const texture = createGradientTexture({ fill: GRADIENT, createCanvas: () => canvas });

		expect(texture).toBeInstanceOf(CanvasTexture);
		expect(canvas.width).toBe(GRADIENT_TEXTURE_SIZE);
		expect(addColorStop).toHaveBeenCalledWith(0, '#000000');
		expect(addColorStop).toHaveBeenCalledWith(1, '#ffffff');
	});

	it('returns null when 2D canvas is not available', () => {
		const canvas = { getContext: (): null => null } as unknown as HTMLCanvasElement;

		expect(
			createGradientTexture({ fill: GRADIENT, createCanvas: () => canvas }),
		).toBeNull();
	});

	it('uses a DOM canvas by default', () => {
		const { canvas } = createFakeCanvas();
		const createElement = vi.spyOn(document, 'createElement').mockReturnValue(canvas);

		createGradientTexture({ fill: GRADIENT });

		expect(createElement).toHaveBeenCalledWith('canvas');
	});
});
