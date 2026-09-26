import { EllipseCurve } from 'three';

import type { Vector2 } from 'three';

export interface RacketDimensions {
	headWidth: number;
	headHeight: number;
	frameThickness: number;
	throatLength: number;
	handleLength: number;
	handleRadius: number;
}

export const DEFAULT_RACKET_DIMENSIONS: RacketDimensions = {
	headWidth: 0.26,
	headHeight: 0.34,
	frameThickness: 0.012,
	throatLength: 0.12,
	handleLength: 0.19,
	handleRadius: 0.014,
};

export const createHeadOutline = ({
	dimensions,
	segments,
}: {
	dimensions: RacketDimensions;
	segments: number;
}): Vector2[] => {
	if (!Number.isInteger(segments) || segments < 8) {
		throw new RangeError('segments must be an integer >= 8');
	}

	const curve = new EllipseCurve(
		0,
		0,
		dimensions.headWidth / 2,
		dimensions.headHeight / 2,
	);

	return curve.getPoints(segments);
};

export const getHandleOffsetY = ({
	dimensions,
}: {
	dimensions: RacketDimensions;
}): number =>
	-(dimensions.headHeight / 2 + dimensions.throatLength + dimensions.handleLength / 2);
