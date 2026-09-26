export type LightingPresetId =
	'daylight' | 'cloudy' | 'night' | 'ambient' | 'nightCity' | 'spotlights';

export type Vec3Tuple = readonly [number, number, number];

export interface LightSpec {
	color: string;
	intensity: number;
	position: Vec3Tuple;
}

export interface LightingState {
	exposure: number;
	skyColor: string;
	groundColor: string;
	skyIntensity: number;
	key: LightSpec;
	fill: LightSpec;
	rim: LightSpec;
	under: LightSpec;
	tint: string;
	tintAmount: number;
	shadowOpacity: number;
}

export interface LightingPreset {
	id: LightingPresetId;
	label: string;
	description: string;
	state: LightingState;
}

export const LIGHTING_PRESETS: Readonly<Record<LightingPresetId, LightingPreset>> = {
	daylight: {
		id: 'daylight',
		label: 'Day',
		description: 'Bright sun, blue sky, crisp shadows',
		state: {
			exposure: 1.1,
			skyColor: '#cfe8ff',
			groundColor: '#8a7a5c',
			skyIntensity: 0.8,
			key: { color: '#fff1d6', intensity: 2.8, position: [1.2, 2.4, 1.6] },
			fill: { color: '#bcd8ff', intensity: 0.6, position: [-2, 1, -1] },
			rim: { color: '#ffffff', intensity: 0.5, position: [0, -1, 2] },
			under: { color: '#d8c6a0', intensity: 0.5, position: [0.3, -2, 0.6] },
			tint: '#8fc4f2',
			tintAmount: 0.32,
			shadowOpacity: 0.6,
		},
	},
	cloudy: {
		id: 'cloudy',
		label: 'Cloudy',
		description: 'Soft, even grey-blue light',
		state: {
			exposure: 0.95,
			skyColor: '#dfe4ea',
			groundColor: '#62676e',
			skyIntensity: 1.3,
			key: { color: '#e7edf4', intensity: 0.9, position: [0.4, 3, 1] },
			fill: { color: '#cfd6df', intensity: 0.7, position: [-2, 1.5, -1] },
			rim: { color: '#dde3ea', intensity: 0.4, position: [0, -1, 2] },
			under: { color: '#9aa1aa', intensity: 0.6, position: [0.3, -2, 0.6] },
			tint: '#9aa3ad',
			tintAmount: 0.3,
			shadowOpacity: 0.3,
		},
	},
	night: {
		id: 'night',
		label: 'Night',
		description: 'Floodlit court, deep blue ambience',
		state: {
			exposure: 1,
			skyColor: '#1c2c52',
			groundColor: '#07090d',
			skyIntensity: 0.35,
			key: { color: '#f4f8ff', intensity: 3.2, position: [1.6, 3.2, 1.2] },
			fill: { color: '#e9f0ff', intensity: 2, position: [-1.8, 3, 0.6] },
			rim: { color: '#5b7cff', intensity: 0.9, position: [0, 0.4, -2] },
			under: { color: '#27345c', intensity: 0.4, position: [0.3, -2, 0.6] },
			tint: '#0a1330',
			tintAmount: 0.72,
			shadowOpacity: 0.75,
		},
	},
	ambient: {
		id: 'ambient',
		label: 'Ambient',
		description: 'Soft studio wrap light, no harsh shadows',
		state: {
			exposure: 1,
			skyColor: '#f4f1ec',
			groundColor: '#b9b3aa',
			skyIntensity: 1.8,
			key: { color: '#fffaf2', intensity: 0.7, position: [0.8, 2.5, 2] },
			fill: { color: '#f4f1ec', intensity: 0.8, position: [-2, 1, 1.5] },
			rim: { color: '#ffffff', intensity: 0.5, position: [0, 1, -2] },
			under: { color: '#e6e0d6', intensity: 0.7, position: [0.3, -2, 0.6] },
			tint: '#d9d4cc',
			tintAmount: 0.2,
			shadowOpacity: 0.2,
		},
	},
	nightCity: {
		id: 'nightCity',
		label: 'Night city',
		description: 'Neon magenta and cyan glow over a dark skyline',
		state: {
			exposure: 1.05,
			skyColor: '#2a1846',
			groundColor: '#05040a',
			skyIntensity: 0.45,
			key: { color: '#ff3fa4', intensity: 2.4, position: [2, 1.4, 1.2] },
			fill: { color: '#2de2ff', intensity: 2.2, position: [-2.2, 1, 0.8] },
			rim: { color: '#9b5cff', intensity: 1.4, position: [0, 1.2, -2.2] },
			under: { color: '#ffb347', intensity: 0.5, position: [0.3, -2, 0.6] },
			tint: '#120a26',
			tintAmount: 0.78,
			shadowOpacity: 0.55,
		},
	},
	spotlights: {
		id: 'spotlights',
		label: 'Spotlights',
		description: 'Stage projectors from above, dark hall, high contrast',
		state: {
			exposure: 1.1,
			skyColor: '#1a1a1f',
			groundColor: '#000000',
			skyIntensity: 0.15,
			key: { color: '#fff6e0', intensity: 4.2, position: [0.3, 3.5, 0.8] },
			fill: { color: '#dfe8ff', intensity: 0.25, position: [-2, 1, 1] },
			rim: { color: '#ffffff', intensity: 2.2, position: [-0.6, 2.4, -2] },
			under: { color: '#15151a', intensity: 0.1, position: [0.3, -2, 0.6] },
			tint: '#050507',
			tintAmount: 0.88,
			shadowOpacity: 0.85,
		},
	},
};

export const LIGHTING_PRESET_IDS: readonly LightingPresetId[] = [
	'daylight',
	'cloudy',
	'night',
	'ambient',
	'nightCity',
	'spotlights',
];

const toRgb = ({ hex }: { hex: string }): [number, number, number] => [
	Number.parseInt(hex.slice(1, 3), 16),
	Number.parseInt(hex.slice(3, 5), 16),
	Number.parseInt(hex.slice(5, 7), 16),
];

const toHex = ({ rgb }: { rgb: readonly [number, number, number] }): string =>
	`#${rgb
		.map((value) =>
			Math.round(Math.min(255, Math.max(0, value)))
				.toString(16)
				.padStart(2, '0'),
		)
		.join('')}`;

export const mixHex = ({ a, b, t }: { a: string; b: string; t: number }): string => {
	const from = toRgb({ hex: a });
	const to = toRgb({ hex: b });
	return toHex({
		rgb: [
			from[0] + (to[0] - from[0]) * t,
			from[1] + (to[1] - from[1]) * t,
			from[2] + (to[2] - from[2]) * t,
		],
	});
};

const mixNumber = ({ a, b, t }: { a: number; b: number; t: number }): number =>
	a + (b - a) * t;

const mixLight = ({ a, b, t }: { a: LightSpec; b: LightSpec; t: number }): LightSpec => ({
	color: mixHex({ a: a.color, b: b.color, t }),
	intensity: mixNumber({ a: a.intensity, b: b.intensity, t }),
	position: [
		mixNumber({ a: a.position[0], b: b.position[0], t }),
		mixNumber({ a: a.position[1], b: b.position[1], t }),
		mixNumber({ a: a.position[2], b: b.position[2], t }),
	],
});

export const mixLighting = ({
	a,
	b,
	t,
}: {
	a: LightingState;
	b: LightingState;
	t: number;
}): LightingState => ({
	exposure: mixNumber({ a: a.exposure, b: b.exposure, t }),
	skyColor: mixHex({ a: a.skyColor, b: b.skyColor, t }),
	groundColor: mixHex({ a: a.groundColor, b: b.groundColor, t }),
	skyIntensity: mixNumber({ a: a.skyIntensity, b: b.skyIntensity, t }),
	key: mixLight({ a: a.key, b: b.key, t }),
	fill: mixLight({ a: a.fill, b: b.fill, t }),
	rim: mixLight({ a: a.rim, b: b.rim, t }),
	under: mixLight({ a: a.under, b: b.under, t }),
	tint: mixHex({ a: a.tint, b: b.tint, t }),
	tintAmount: mixNumber({ a: a.tintAmount, b: b.tintAmount, t }),
	shadowOpacity: mixNumber({ a: a.shadowOpacity, b: b.shadowOpacity, t }),
});

export const LIGHTING_TRANSITION_S = 0.6;

export const getSceneBackground = ({
	base,
	lighting,
}: {
	base: string;
	lighting: LightingState;
}): string => mixHex({ a: base, b: lighting.tint, t: lighting.tintAmount });
