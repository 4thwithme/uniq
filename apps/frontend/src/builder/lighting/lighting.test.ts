import { DirectionalLight, HemisphereLight } from 'three';

import { applyLightingState } from '@builder/lighting/apply-lighting';
import {
	getSceneBackground,
	LIGHTING_PRESET_IDS,
	LIGHTING_PRESETS,
	mixHex,
	mixLighting,
} from '@builder/lighting/lighting-presets';
import {
	LIGHTING_STORAGE_KEY,
	readInitialLighting,
	useLightingStore,
} from '@builder/lighting/lighting-store';

import type { Color } from 'three';

describe('lighting presets', () => {
	it('defines day, cloudy and night with distinct moods', () => {
		expect(LIGHTING_PRESET_IDS).toEqual([
			'daylight',
			'cloudy',
			'night',
			'ambient',
			'nightCity',
			'spotlights',
		]);
		const { daylight, cloudy, night } = LIGHTING_PRESETS;

		expect(daylight.state.key.intensity).toBeGreaterThan(cloudy.state.key.intensity);
		expect(cloudy.state.shadowOpacity).toBeLessThan(daylight.state.shadowOpacity);
		expect(night.state.skyIntensity).toBeLessThan(daylight.state.skyIntensity);
		expect(night.state.tintAmount).toBeGreaterThan(daylight.state.tintAmount);
	});

	it('defines ambient, night city and spotlights with distinct moods', () => {
		const { ambient, nightCity, spotlights, daylight } = LIGHTING_PRESETS;

		expect(ambient.state.shadowOpacity).toBeLessThan(daylight.state.shadowOpacity);
		expect(ambient.state.skyIntensity).toBeGreaterThan(daylight.state.skyIntensity);
		expect(nightCity.state.key.color).not.toBe(nightCity.state.fill.color);
		expect(nightCity.state.tintAmount).toBeGreaterThan(0.5);
		expect(spotlights.state.key.intensity).toBeGreaterThan(daylight.state.key.intensity);
		expect(spotlights.state.fill.intensity).toBeLessThan(0.5);
		LIGHTING_PRESET_IDS.forEach((id) => {
			expect(LIGHTING_PRESETS[id].id).toBe(id);
			expect(LIGHTING_PRESETS[id].description).not.toBe('');
		});
	});

	it('mixes hex colors and clamps channels', () => {
		expect(mixHex({ a: '#000000', b: '#ffffff', t: 0.5 })).toBe('#808080');
		expect(mixHex({ a: '#102030', b: '#102030', t: 0.7 })).toBe('#102030');
		expect(mixHex({ a: '#000000', b: '#ffffff', t: 2 })).toBe('#ffffff');
		expect(mixHex({ a: '#ffffff', b: '#000000', t: 2 })).toBe('#000000');
	});

	it('blends whole lighting states', () => {
		const a = LIGHTING_PRESETS.daylight.state;
		const b = LIGHTING_PRESETS.night.state;

		expect(mixLighting({ a, b, t: 0 })).toEqual(a);
		const end = mixLighting({ a, b, t: 1 });
		expect(end.key.intensity).toBeCloseTo(b.key.intensity);
		expect(end.skyColor).toBe(b.skyColor);
		const middle = mixLighting({ a, b, t: 0.5 });
		expect(middle.exposure).toBeCloseTo((a.exposure + b.exposure) / 2);
		expect(middle.fill.position[1]).toBeCloseTo(
			(a.fill.position[1] + b.fill.position[1]) / 2,
		);
	});

	it('tints the scene background toward the mood', () => {
		const night = LIGHTING_PRESETS.night.state;

		expect(getSceneBackground({ base: '#ffffff', lighting: night })).not.toBe('#ffffff');
		expect(
			getSceneBackground({ base: '#ffffff', lighting: { ...night, tintAmount: 0 } }),
		).toBe('#ffffff');
	});
});

describe('applyLightingState', () => {
	it('writes exposure, lights and background', () => {
		const renderer = { toneMappingExposure: 0 };
		const scene: { background: unknown } = { background: null };
		const sky = new HemisphereLight();
		const key = new DirectionalLight();
		const state = LIGHTING_PRESETS.night.state;

		applyLightingState({
			targets: {
				renderer,
				scene: scene as never,
				sky,
				key,
				fill: null,
				rim: null,
				under: null,
			},
			state,
			baseBackground: '#121212',
		});

		expect(renderer.toneMappingExposure).toBe(state.exposure);
		expect(sky.intensity).toBe(state.skyIntensity);
		expect(`#${sky.groundColor.getHexString()}`).toBe(state.groundColor);
		expect(key.intensity).toBe(state.key.intensity);
		expect(key.position.toArray()).toEqual([...state.key.position]);
		expect(`#${(scene.background as Color).getHexString()}`).toBe(
			getSceneBackground({ base: '#121212', lighting: state }),
		);
	});

	it('skips a missing sky light', () => {
		const renderer = { toneMappingExposure: 0 };
		applyLightingState({
			targets: {
				renderer,
				scene: { background: null },
				sky: null,
				key: null,
				fill: null,
				rim: null,
				under: null,
			},
			state: LIGHTING_PRESETS.cloudy.state,
			baseBackground: '#ffffff',
		});
		expect(renderer.toneMappingExposure).toBe(LIGHTING_PRESETS.cloudy.state.exposure);
	});
});

describe('lighting store', () => {
	afterEach(() => {
		useLightingStore.setState({ presetId: 'daylight' });
	});

	it('defaults to daylight, reads and saves the choice', () => {
		expect(readInitialLighting()).toBe('daylight');
		window.localStorage.setItem(LIGHTING_STORAGE_KEY, 'night');
		expect(readInitialLighting()).toBe('night');
		window.localStorage.setItem(LIGHTING_STORAGE_KEY, 'storm');
		expect(readInitialLighting()).toBe('daylight');

		useLightingStore.getState().setPreset({ presetId: 'cloudy' });
		expect(useLightingStore.getState().presetId).toBe('cloudy');
		expect(window.localStorage.getItem(LIGHTING_STORAGE_KEY)).toBe('cloudy');
	});

	it('survives blocked storage', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		expect(readInitialLighting()).toBe('daylight');
		useLightingStore.getState().setPreset({ presetId: 'night' });
		expect(useLightingStore.getState().presetId).toBe('night');
	});
});
