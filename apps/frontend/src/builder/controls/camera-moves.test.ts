import {
	CAMERA_LIMITS,
	computeCameraMove,
	inputFromKeys,
	isMoving,
	isTypingTarget,
} from '@builder/controls/camera-moves';

import type { Vec3 } from '@builder/controls/camera-moves';

const distance = ({ a, b }: { a: Vec3; b: Vec3 }): number =>
	Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const idle = { forward: 0, right: 0, up: 0, boost: false };

describe('inputFromKeys', () => {
	it('maps WASD, arrows, Q/E and shift', () => {
		expect(
			inputFromKeys({ keys: new Set(['KeyW', 'KeyD', 'KeyE', 'ShiftLeft']) }),
		).toEqual({
			forward: 1,
			right: 1,
			up: 1,
			boost: true,
		});
		expect(inputFromKeys({ keys: new Set(['ArrowDown', 'ArrowLeft', 'KeyQ']) })).toEqual({
			forward: -1,
			right: -1,
			up: -1,
			boost: false,
		});
	});

	it('cancels opposite keys, clamps doubles and ignores others', () => {
		expect(inputFromKeys({ keys: new Set(['KeyW', 'KeyS', 'KeyX']) })).toEqual(idle);
		expect(inputFromKeys({ keys: new Set(['KeyW', 'ArrowUp']) }).forward).toBe(1);
		expect(isMoving({ input: idle })).toBe(false);
		expect(isMoving({ input: { ...idle, up: 1 } })).toBe(true);
	});
});

describe('computeCameraMove', () => {
	const position: Vec3 = [0, 0, 1];
	const target: Vec3 = [0, 0, 0];

	it('moves closer with W but not past the minimum distance', () => {
		const step = computeCameraMove({
			input: { ...idle, forward: 1 },
			delta: 0.1,
			position,
			target,
		});
		expect(distance({ a: step.position, b: step.target })).toBeLessThan(1);

		const close = computeCameraMove({
			input: { ...idle, forward: 1, boost: true },
			delta: 5,
			position: [0, 0, 0.09],
			target,
		});
		expect(distance({ a: close.position, b: close.target })).toBeCloseTo(
			CAMERA_LIMITS.minDistance,
		);
	});

	it('moves away with S up to the maximum distance', () => {
		const far = computeCameraMove({
			input: { ...idle, forward: -1, boost: true },
			delta: 0.1,
			position: [0, 0, 2.49],
			target,
		});
		expect(distance({ a: far.position, b: far.target })).toBeCloseTo(
			CAMERA_LIMITS.maxDistance,
		);
	});

	it('pans target and camera together with A/D and Q/E, inside the bounds', () => {
		const moved = computeCameraMove({
			input: { ...idle, right: 1, up: 1 },
			delta: 0.1,
			position,
			target,
		});
		expect(moved.target[0]).toBeGreaterThan(0);
		expect(moved.target[1]).toBeGreaterThan(0);
		expect(distance({ a: moved.position, b: moved.target })).toBeCloseTo(1);

		const clamped = computeCameraMove({
			input: { ...idle, right: -1, up: -1, boost: true },
			delta: 0.1,
			position: [-0.5, -0.75, 1],
			target: [-0.5, -0.75, 0],
		});
		expect(clamped.target).toEqual([-0.5, -0.75, 0]);
	});

	it('handles a camera sitting on its target', () => {
		const same = computeCameraMove({
			input: { ...idle, right: 1 },
			delta: 0.1,
			position: target,
			target,
		});
		expect(same.target).toEqual(target);
	});
});

describe('isTypingTarget', () => {
	it('detects text inputs, textareas, selects and editable content', () => {
		const text = document.createElement('input');
		const range = document.createElement('input');
		range.type = 'range';
		const editable = document.createElement('div');
		Object.defineProperty(editable, 'isContentEditable', { value: true });

		expect(isTypingTarget({ target: text })).toBe(true);
		expect(isTypingTarget({ target: range })).toBe(false);
		expect(isTypingTarget({ target: document.createElement('textarea') })).toBe(true);
		expect(isTypingTarget({ target: document.createElement('select') })).toBe(true);
		expect(isTypingTarget({ target: editable })).toBe(true);
		expect(isTypingTarget({ target: document.createElement('button') })).toBe(false);
		expect(isTypingTarget({ target: null })).toBe(false);
	});
});
