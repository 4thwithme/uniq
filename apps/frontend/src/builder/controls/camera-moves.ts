export type Vec3 = readonly [number, number, number];

export interface MoveInput {
	forward: number;
	right: number;
	up: number;
	boost: boolean;
}

export interface MoveBounds {
	min: Vec3;
	max: Vec3;
}

export const CAMERA_LIMITS = {
	minDistance: 0.08,
	maxDistance: 2.5,
	speed: 0.35,
	boost: 3,
	maxPolarAngle: Math.PI * 0.85,
	bounds: { min: [-0.5, -0.75, -0.5], max: [0.5, 0.35, 0.5] } satisfies MoveBounds,
} as const;

type Axis = 'forward' | 'right' | 'up';

export const KEY_BINDINGS: Readonly<Record<string, { axis: Axis; sign: 1 | -1 }>> = {
	KeyW: { axis: 'forward', sign: 1 },
	ArrowUp: { axis: 'forward', sign: 1 },
	KeyS: { axis: 'forward', sign: -1 },
	ArrowDown: { axis: 'forward', sign: -1 },
	KeyD: { axis: 'right', sign: 1 },
	ArrowRight: { axis: 'right', sign: 1 },
	KeyA: { axis: 'right', sign: -1 },
	ArrowLeft: { axis: 'right', sign: -1 },
	KeyE: { axis: 'up', sign: 1 },
	KeyQ: { axis: 'up', sign: -1 },
};

export const BOOST_KEYS: ReadonlySet<string> = new Set(['ShiftLeft', 'ShiftRight']);

export const inputFromKeys = ({ keys }: { keys: ReadonlySet<string> }): MoveInput => {
	const input = { forward: 0, right: 0, up: 0 };
	for (const key of keys) {
		const binding = KEY_BINDINGS[key];
		if (binding !== undefined) {
			input[binding.axis] = Math.max(-1, Math.min(1, input[binding.axis] + binding.sign));
		}
	}
	return { ...input, boost: [...keys].some((key) => BOOST_KEYS.has(key)) };
};

export const isMoving = ({ input }: { input: MoveInput }): boolean =>
	input.forward !== 0 || input.right !== 0 || input.up !== 0;

const sub = ({ a, b }: { a: Vec3; b: Vec3 }): Vec3 => [
	a[0] - b[0],
	a[1] - b[1],
	a[2] - b[2],
];
const add = ({ a, b }: { a: Vec3; b: Vec3 }): Vec3 => [
	a[0] + b[0],
	a[1] + b[1],
	a[2] + b[2],
];
const scale = ({ v, s }: { v: Vec3; s: number }): Vec3 => [v[0] * s, v[1] * s, v[2] * s];
const length = ({ v }: { v: Vec3 }): number => Math.hypot(v[0], v[1], v[2]);
const normalize = ({ v }: { v: Vec3 }): Vec3 => {
	const size = length({ v });
	return size === 0 ? [0, 0, 0] : scale({ v, s: 1 / size });
};
const cross = ({ a, b }: { a: Vec3; b: Vec3 }): Vec3 => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0],
];
const clamp = ({
	value,
	min,
	max,
}: {
	value: number;
	min: number;
	max: number;
}): number => Math.min(max, Math.max(min, value));
const clampVec = ({ v, bounds }: { v: Vec3; bounds: MoveBounds }): Vec3 => [
	clamp({ value: v[0], min: bounds.min[0], max: bounds.max[0] }),
	clamp({ value: v[1], min: bounds.min[1], max: bounds.max[1] }),
	clamp({ value: v[2], min: bounds.min[2], max: bounds.max[2] }),
];

const WORLD_UP: Vec3 = [0, 1, 0];

export const computeCameraMove = ({
	input,
	delta,
	position,
	target,
	limits = CAMERA_LIMITS,
}: {
	input: MoveInput;
	delta: number;
	position: Vec3;
	target: Vec3;
	limits?: {
		minDistance: number;
		maxDistance: number;
		speed: number;
		boost: number;
		bounds: MoveBounds;
	};
}): { position: Vec3; target: Vec3 } => {
	const step = limits.speed * (input.boost ? limits.boost : 1) * Math.min(delta, 0.1);
	const toTarget = sub({ a: target, b: position });
	const direction = normalize({ v: toTarget });
	const distance = length({ v: toTarget });
	const right = normalize({ v: cross({ a: direction, b: WORLD_UP }) });

	const pan = add({
		a: scale({ v: right, s: input.right * step }),
		b: scale({ v: WORLD_UP, s: input.up * step }),
	});
	const nextTarget = clampVec({ v: add({ a: target, b: pan }), bounds: limits.bounds });
	const nextDistance = clamp({
		value: distance - input.forward * step * Math.max(distance, 0.3),
		min: limits.minDistance,
		max: limits.maxDistance,
	});

	return {
		target: nextTarget,
		position: sub({ a: nextTarget, b: scale({ v: direction, s: nextDistance }) }),
	};
};

export const isTypingTarget = ({ target }: { target: EventTarget | null }): boolean => {
	if (!(target instanceof HTMLElement)) {
		return false;
	}
	if (target.isContentEditable) {
		return true;
	}
	if (target instanceof HTMLInputElement) {
		return !['range', 'radio', 'checkbox', 'button', 'color', 'file'].includes(
			target.type,
		);
	}
	return target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
};
