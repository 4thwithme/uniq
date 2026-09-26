import { CanvasTexture, SRGBColorSpace } from 'three';

import type { GradientFill } from '@uniq/shared';

export const GRADIENT_TEXTURE_SIZE = 256;

export const getGradientEndpoints = ({
	angle,
	size,
}: {
	angle: number;
	size: number;
}): [number, number, number, number] => {
	const radians = (angle * Math.PI) / 180;
	const half = size / 2;
	const dx = Math.cos(radians) * half;
	const dy = Math.sin(radians) * half;

	return [half - dx, half - dy, half + dx, half + dy];
};

export const createGradientTexture = ({
	fill,
	createCanvas = (): HTMLCanvasElement => document.createElement('canvas'),
}: {
	fill: GradientFill;
	createCanvas?: () => HTMLCanvasElement;
}): CanvasTexture | null => {
	const canvas = createCanvas();
	canvas.width = GRADIENT_TEXTURE_SIZE;
	canvas.height = GRADIENT_TEXTURE_SIZE;

	const context = canvas.getContext('2d');

	if (!context) {
		return null;
	}

	const gradient = context.createLinearGradient(
		...getGradientEndpoints({ angle: fill.angle, size: GRADIENT_TEXTURE_SIZE }),
	);

	for (const stop of fill.stops) {
		gradient.addColorStop(stop.offset, stop.color);
	}

	context.fillStyle = gradient;
	context.fillRect(0, 0, GRADIENT_TEXTURE_SIZE, GRADIENT_TEXTURE_SIZE);

	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;

	return texture;
};
