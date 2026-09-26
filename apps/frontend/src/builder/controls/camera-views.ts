import {
	DEFAULT_RACKET_DIMENSIONS,
	getHandleOffsetY,
} from '@builder/models/racket-geometry';

import type { Vec3 } from '@builder/controls/camera-moves';

export type CameraFocus = 'overview' | 'grip' | 'buttCap';

export interface CameraView {
	position: Vec3;
	target: Vec3;
}

const HANDLE_Y = getHandleOffsetY({ dimensions: DEFAULT_RACKET_DIMENSIONS });
const HANDLE_BOTTOM_Y = HANDLE_Y - DEFAULT_RACKET_DIMENSIONS.handleLength / 2;

export const CAMERA_VIEWS: Readonly<Record<CameraFocus, CameraView>> = {
	overview: { position: [0.25, 0.2, 1.1], target: [0, -0.15, 0] },
	grip: { position: [0.1, HANDLE_Y + 0.06, 0.3], target: [0, HANDLE_Y, 0] },
	buttCap: {
		position: [0.04, HANDLE_BOTTOM_Y - 0.1, 0.08],
		target: [0, HANDLE_BOTTOM_Y, 0],
	},
};

export const FOCUS_DURATION_S = 0.45;

export const easeOutCubic = ({ t }: { t: number }): number => 1 - (1 - t) ** 3;

const lerp = ({ a, b, t }: { a: Vec3; b: Vec3; t: number }): Vec3 => [
	a[0] + (b[0] - a[0]) * t,
	a[1] + (b[1] - a[1]) * t,
	a[2] + (b[2] - a[2]) * t,
];

export const interpolateView = ({
	from,
	to,
	progress,
}: {
	from: CameraView;
	to: CameraView;
	progress: number;
}): CameraView => {
	const t = easeOutCubic({ t: Math.min(1, Math.max(0, progress)) });
	return {
		position: lerp({ a: from.position, b: to.position, t }),
		target: lerp({ a: from.target, b: to.target, t }),
	};
};
