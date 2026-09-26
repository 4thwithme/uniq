import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import {
	BOOST_KEYS,
	computeCameraMove,
	inputFromKeys,
	isMoving,
	isTypingTarget,
	KEY_BINDINGS,
} from '@builder/controls/camera-moves';

import type { Vec3 } from '@builder/controls/camera-moves';
import type { Vector3 } from 'three';

interface OrbitLike {
	target: Vector3;
	update: () => void;
}

// eslint-disable-next-line custom-rules/require-object-params
const isOrbitLike = (value: unknown): value is OrbitLike =>
	typeof value === 'object' && value !== null && 'target' in value && 'update' in value;

const toVec3 = ({ vector }: { vector: Vector3 }): Vec3 => [vector.x, vector.y, vector.z];

export function WasdControls({
	eventTarget = window,
}: {
	eventTarget?: Pick<Window, 'addEventListener' | 'removeEventListener'>;
}): null {
	const keys = useRef(new Set<string>());
	const camera = useThree((state) => state.camera);
	const controls = useThree((state) => state.controls);
	const invalidate = useThree((state) => state.invalidate);

	useEffect(() => {
		const pressed = keys.current;
		// eslint-disable-next-line custom-rules/require-object-params
		const onKeyDown = (event: Event): void => {
			if (
				!(event instanceof KeyboardEvent) ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey
			) {
				return;
			}
			const isBound =
				KEY_BINDINGS[event.code] !== undefined || BOOST_KEYS.has(event.code);
			if (!isBound || isTypingTarget({ target: event.target })) {
				return;
			}
			if (KEY_BINDINGS[event.code] !== undefined) {
				event.preventDefault();
			}
			pressed.add(event.code);
			invalidate();
		};
		// eslint-disable-next-line custom-rules/require-object-params
		const onKeyUp = (event: Event): void => {
			if (event instanceof KeyboardEvent) {
				pressed.delete(event.code);
			}
		};
		const onBlur = (): void => {
			pressed.clear();
		};
		eventTarget.addEventListener('keydown', onKeyDown);
		eventTarget.addEventListener('keyup', onKeyUp);
		eventTarget.addEventListener('blur', onBlur);
		return (): void => {
			eventTarget.removeEventListener('keydown', onKeyDown);
			eventTarget.removeEventListener('keyup', onKeyUp);
			eventTarget.removeEventListener('blur', onBlur);
		};
	}, [eventTarget, invalidate]);

	useFrame((_state, delta) => {
		const input = inputFromKeys({ keys: keys.current });
		if (!isMoving({ input }) || !isOrbitLike(controls)) {
			return;
		}
		const next = computeCameraMove({
			input,
			delta,
			position: toVec3({ vector: camera.position }),
			target: toVec3({ vector: controls.target }),
		});
		camera.position.set(...next.position);
		controls.target.set(...next.target);
		controls.update();
		invalidate();
	});

	return null;
}
