import { DEFAULT_RACKET_DIMENSIONS } from '@builder/models/racket-geometry';

import type { RacketDimensions } from '@builder/models/racket-geometry';

export interface SurfaceBand {
	centerV: number;
	flipX: boolean;
	flipY: boolean;
}

export const FRAME_FRONT_V = 0;
export const FRAME_BACK_V = 0.5;

export const FRAME_BANDS: readonly SurfaceBand[] = [
	{ centerV: FRAME_FRONT_V, flipX: false, flipY: false },
	{ centerV: FRAME_BACK_V, flipX: true, flipY: false },
];

export const FRAME_SURFACE_WIDTH = 2048;

export const getEllipsePerimeter = ({ a, b }: { a: number; b: number }): number =>
	Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));

export const getPixelsPerMeter = ({
	dimensions = DEFAULT_RACKET_DIMENSIONS,
	width = FRAME_SURFACE_WIDTH,
}: {
	dimensions?: RacketDimensions;
	width?: number;
}): number =>
	width /
	getEllipsePerimeter({ a: dimensions.headWidth / 2, b: dimensions.headHeight / 2 });

export const TUBE_SURFACE_WIDTH = 4096;

export interface TubeMetrics {
	loopLength: number;
	perimeter: number;
}

export const getTubeSurfaceSize = ({
	metrics,
	width = TUBE_SURFACE_WIDTH,
}: {
	metrics: TubeMetrics;
	width?: number;
}): { width: number; height: number } => ({
	width,
	height: Math.max(16, Math.round((width * metrics.perimeter) / metrics.loopLength)),
});

export const getShaftSurfaceSize = ({
	length,
	width,
	pixels = getPixelsPerMeter({}),
}: {
	length: number;
	width: number;
	pixels?: number;
}): { width: number; height: number } => {
	return {
		width: Math.max(16, Math.round(length * pixels)),
		height: Math.max(16, Math.round(2 * width * pixels)),
	};
};

export const getFrameSurfaceSize = ({
	dimensions = DEFAULT_RACKET_DIMENSIONS,
	width = FRAME_SURFACE_WIDTH,
}: {
	dimensions?: RacketDimensions;
	width?: number;
}): { width: number; height: number } => {
	const perimeter = getEllipsePerimeter({
		a: dimensions.headWidth / 2,
		b: dimensions.headHeight / 2,
	});
	const circumference = 2 * Math.PI * dimensions.frameThickness;
	return { width, height: Math.max(16, Math.round((width * circumference) / perimeter)) };
};
