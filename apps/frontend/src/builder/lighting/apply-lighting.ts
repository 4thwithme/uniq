/* eslint-disable no-param-reassign */
import { Color } from 'three';

import { getSceneBackground } from '@builder/lighting/lighting-presets';

import type { LightingState, LightSpec } from '@builder/lighting/lighting-presets';
import type { DirectionalLight, HemisphereLight, Scene } from 'three';

export interface LightingTargets {
	renderer: { toneMappingExposure: number };
	scene: Pick<Scene, 'background'>;
	sky: HemisphereLight | null;
	key: DirectionalLight | null;
	fill: DirectionalLight | null;
	rim: DirectionalLight | null;
	under: DirectionalLight | null;
}

const applyLight = ({
	light,
	spec,
}: {
	light: DirectionalLight | null;
	spec: LightSpec;
}): void => {
	if (light === null) {
		return;
	}
	light.color.set(spec.color);
	light.intensity = spec.intensity;
	light.position.set(...spec.position);
};

export const applyLightingState = ({
	targets,
	state,
	baseBackground,
}: {
	targets: LightingTargets;
	state: LightingState;
	baseBackground: string;
}): void => {
	targets.renderer.toneMappingExposure = state.exposure;
	if (targets.sky !== null) {
		targets.sky.color.set(state.skyColor);
		targets.sky.groundColor.set(state.groundColor);
		targets.sky.intensity = state.skyIntensity;
	}
	applyLight({ light: targets.key, spec: state.key });
	applyLight({ light: targets.fill, spec: state.fill });
	applyLight({ light: targets.rim, spec: state.rim });
	applyLight({ light: targets.under, spec: state.under });
	targets.scene.background = new Color(
		getSceneBackground({ base: baseBackground, lighting: state }),
	);
};
