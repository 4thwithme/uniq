import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import {
	CAMERA_VIEWS,
	FOCUS_DURATION_S,
	interpolateView,
} from '@builder/controls/camera-views';

import type { CameraFocus, CameraView } from '@builder/controls/camera-views';
import type { Vector3 } from 'three';

interface OrbitLike {
	target: Vector3;
	update: () => void;
}

// eslint-disable-next-line custom-rules/require-object-params
const isOrbitLike = (value: unknown): value is OrbitLike =>
	typeof value === 'object' && value !== null && 'target' in value && 'update' in value;

const prefersReducedMotion = (): boolean =>
	typeof window.matchMedia === 'function' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Transition {
	from: CameraView;
	to: CameraView;
	elapsed: number;
}

export function CameraFocusControls({ focus }: { focus: CameraFocus }): null {
	const camera = useThree((state) => state.camera);
	const controls = useThree((state) => state.controls);
	const invalidate = useThree((state) => state.invalidate);
	const transition = useRef<Transition | null>(null);
	const lastFocus = useRef<CameraFocus>('overview');

	useEffect(() => {
		if (focus === lastFocus.current || !isOrbitLike(controls)) {
			return;
		}
		lastFocus.current = focus;
		const from: CameraView = {
			position: [camera.position.x, camera.position.y, camera.position.z],
			target: [controls.target.x, controls.target.y, controls.target.z],
		};
		transition.current = {
			from,
			to: CAMERA_VIEWS[focus],
			elapsed: prefersReducedMotion() ? FOCUS_DURATION_S : 0,
		};
		invalidate();
	}, [focus, camera, controls, invalidate]);

	useFrame((_state, delta) => {
		const current = transition.current;
		if (current === null || !isOrbitLike(controls)) {
			return;
		}
		current.elapsed += delta;
		const view = interpolateView({
			from: current.from,
			to: current.to,
			progress: current.elapsed / FOCUS_DURATION_S,
		});
		camera.position.set(...view.position);
		controls.target.set(...view.target);
		controls.update();
		if (current.elapsed >= FOCUS_DURATION_S) {
			transition.current = null;
		}
		invalidate();
	});

	return null;
}
