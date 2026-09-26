import { create } from '@react-three/test-renderer';

import { LIGHTING_PRESETS } from '@builder/lighting/lighting-presets';
import { SceneLighting } from '@builder/scene/SceneLighting';

import type { DirectionalLight, HemisphereLight } from 'three';

const lights = ({
	renderer,
}: {
	renderer: Awaited<ReturnType<typeof create>>;
}): { sky: HemisphereLight; key: DirectionalLight } => {
	const sky = renderer.scene.find((node) => node.type === 'HemisphereLight')
		.instance as HemisphereLight;
	const [key] = renderer.scene
		.findAll((node) => node.type === 'DirectionalLight')
		.map((node) => node.instance as DirectionalLight);
	if (key === undefined) {
		throw new Error('expected lights');
	}
	return { sky, key };
};

describe('SceneLighting', () => {
	it('renders the preset lights', async () => {
		const renderer = await create(
			<SceneLighting presetId="daylight" baseBackground="#121212" isAnimated={false} />,
		);
		await renderer.advanceFrames(1, 0.016);

		const { sky, key } = lights({ renderer });
		expect(
			renderer.scene.findAll((node) => node.type === 'DirectionalLight'),
		).toHaveLength(4);
		expect(sky.intensity).toBeCloseTo(LIGHTING_PRESETS.daylight.state.skyIntensity);
		expect(key.castShadow).toBe(true);
		await renderer.unmount();
	});

	it('animates toward a new preset', async () => {
		const renderer = await create(
			<SceneLighting presetId="daylight" baseBackground="#121212" isAnimated />,
		);
		await renderer.advanceFrames(1, 0.016);

		await renderer.update(
			<SceneLighting presetId="night" baseBackground="#121212" isAnimated />,
		);
		await renderer.advanceFrames(2, 0.05);
		const { sky } = lights({ renderer });
		const partial = sky.intensity;
		expect(partial).toBeLessThan(LIGHTING_PRESETS.daylight.state.skyIntensity);
		expect(partial).toBeGreaterThan(LIGHTING_PRESETS.night.state.skyIntensity);

		await renderer.advanceFrames(20, 0.05);
		expect(sky.intensity).toBeCloseTo(LIGHTING_PRESETS.night.state.skyIntensity);
		await renderer.unmount();
	});

	it('jumps without animation and re-applies on background change', async () => {
		const renderer = await create(
			<SceneLighting presetId="cloudy" baseBackground="#121212" isAnimated={false} />,
		);
		await renderer.update(
			<SceneLighting presetId="night" baseBackground="#121212" isAnimated={false} />,
		);
		await renderer.advanceFrames(1, 0.016);
		expect(lights({ renderer }).sky.intensity).toBeCloseTo(
			LIGHTING_PRESETS.night.state.skyIntensity,
		);

		await renderer.update(
			<SceneLighting presetId="night" baseBackground="#ffffff" isAnimated={false} />,
		);
		await renderer.advanceFrames(1, 0.016);
		expect(lights({ renderer }).key.intensity).toBeCloseTo(
			LIGHTING_PRESETS.night.state.key.intensity,
		);
		await renderer.unmount();
	});
});
