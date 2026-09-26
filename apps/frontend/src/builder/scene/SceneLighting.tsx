import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import { applyLightingState } from '@builder/lighting/apply-lighting';
import {
	LIGHTING_PRESETS,
	LIGHTING_TRANSITION_S,
	mixLighting,
} from '@builder/lighting/lighting-presets';

import type { LightingPresetId, LightingState } from '@builder/lighting/lighting-presets';
import type { DirectionalLight, HemisphereLight } from 'three';

interface Transition {
	from: LightingState;
	to: LightingState;
	elapsed: number;
}

interface SceneLightingProps {
	presetId: LightingPresetId;
	baseBackground: string;
	isAnimated: boolean;
}

export function SceneLighting({
	presetId,
	baseBackground,
	isAnimated,
}: SceneLightingProps): React.JSX.Element {
	const gl = useThree((state) => state.gl);
	const scene = useThree((state) => state.scene);
	const invalidate = useThree((state) => state.invalidate);
	const sky = useRef<HemisphereLight>(null);
	const key = useRef<DirectionalLight>(null);
	const fill = useRef<DirectionalLight>(null);
	const rim = useRef<DirectionalLight>(null);
	const under = useRef<DirectionalLight>(null);
	const current = useRef<LightingState>(LIGHTING_PRESETS[presetId].state);
	const transition = useRef<Transition | null>(null);
	const initial = LIGHTING_PRESETS[presetId].state;

	const apply = ({ state }: { state: LightingState }): void => {
		applyLightingState({
			targets: {
				renderer: gl,
				scene,
				sky: sky.current,
				key: key.current,
				fill: fill.current,
				rim: rim.current,
				under: under.current,
			},
			state,
			baseBackground,
		});
	};

	useEffect(() => {
		const target = LIGHTING_PRESETS[presetId].state;
		transition.current = {
			from: current.current,
			to: target,
			elapsed: isAnimated ? 0 : LIGHTING_TRANSITION_S,
		};
		invalidate();
	}, [presetId, isAnimated, invalidate]);

	useEffect(() => {
		applyLightingState({
			targets: {
				renderer: gl,
				scene,
				sky: sky.current,
				key: key.current,
				fill: fill.current,
				rim: rim.current,
				under: under.current,
			},
			state: current.current,
			baseBackground,
		});
		invalidate();
	}, [baseBackground, gl, scene, invalidate]);

	useFrame((_state, delta) => {
		const active = transition.current;
		if (active === null) {
			return;
		}
		active.elapsed += delta;
		const progress = Math.min(1, active.elapsed / LIGHTING_TRANSITION_S);
		current.current = mixLighting({
			a: active.from,
			b: active.to,
			t: 1 - (1 - progress) ** 3,
		});
		apply({ state: current.current });
		if (progress >= 1) {
			current.current = active.to;
			transition.current = null;
		}
		invalidate();
	});

	return (
		<>
			<hemisphereLight
				ref={sky}
				args={[initial.skyColor, initial.groundColor, initial.skyIntensity]}
			/>
			<directionalLight
				ref={key}
				position={[...initial.key.position]}
				intensity={initial.key.intensity}
				color={initial.key.color}
				castShadow
			/>
			<directionalLight
				ref={fill}
				position={[...initial.fill.position]}
				intensity={initial.fill.intensity}
				color={initial.fill.color}
			/>
			<directionalLight
				ref={rim}
				position={[...initial.rim.position]}
				intensity={initial.rim.intensity}
				color={initial.rim.color}
			/>
			<directionalLight
				ref={under}
				position={[...initial.under.position]}
				intensity={initial.under.intensity}
				color={initial.under.color}
			/>
		</>
	);
}
