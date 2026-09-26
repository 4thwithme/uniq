import { create } from 'zustand';

import { LIGHTING_PRESET_IDS } from '@builder/lighting/lighting-presets';

import type { LightingPresetId } from '@builder/lighting/lighting-presets';

export const LIGHTING_STORAGE_KEY = 'uniq:scene-lighting:v1';

export const readInitialLighting = (): LightingPresetId => {
	try {
		const stored = window.localStorage.getItem(LIGHTING_STORAGE_KEY);
		return LIGHTING_PRESET_IDS.find((id) => id === stored) ?? 'cloudy';
	} catch {
		return 'cloudy';
	}
};

interface LightingStoreState {
	presetId: LightingPresetId;
	setPreset: (params: { presetId: LightingPresetId }) => void;
}

export const useLightingStore = create<LightingStoreState>()((set) => ({
	presetId: readInitialLighting(),
	setPreset: ({ presetId }) => {
		set({ presetId });
		try {
			window.localStorage.setItem(LIGHTING_STORAGE_KEY, presetId);
		} catch {
			return;
		}
	},
}));
