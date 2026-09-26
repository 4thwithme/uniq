export const GRIP_MATERIALS = ['leather', 'synthetic'] as const;
export type GripMaterial = (typeof GRIP_MATERIALS)[number];

export const GRIP_FINISHES = ['matte', 'gloss'] as const;
export type GripFinish = (typeof GRIP_FINISHES)[number];

export const GRIP_TEXTURES = ['smooth', 'perforated', 'grooved'] as const;
export type GripTexture = (typeof GRIP_TEXTURES)[number];

export interface GripColor {
	id: string;
	name: string;
	hex: string;
}

export interface GripMaterialSpec {
	name: string;
	description: string;
	colors: readonly GripColor[];
	textures: readonly GripTexture[];
	finishes: readonly GripFinish[];
	resetsOvergrip: boolean;
}

export const GRIP_CATALOG: Readonly<Record<GripMaterial, GripMaterialSpec>> = {
	leather: {
		name: 'Leather',
		description: 'Genuine leather. Firm feel, clear bevels, natural dry finish.',
		colors: [
			{ id: 'natural', name: 'Natural tan', hex: '#c49a6c' },
			{ id: 'brown', name: 'Brown', hex: '#7a4a2a' },
			{ id: 'dark-brown', name: 'Dark brown', hex: '#4a2c1a' },
			{ id: 'black', name: 'Black', hex: '#1b1918' },
		],
		textures: ['smooth', 'perforated'],
		finishes: ['matte'],
		resetsOvergrip: true,
	},
	synthetic: {
		name: 'Synthetic',
		description: 'Polyurethane. Soft and cushioned, tacky or dry.',
		colors: [
			{ id: 'black', name: 'Black', hex: '#161616' },
			{ id: 'white', name: 'White', hex: '#f1f1ee' },
			{ id: 'grey', name: 'Grey', hex: '#8a8d92' },
			{ id: 'navy', name: 'Navy', hex: '#1d2b4a' },
			{ id: 'blue', name: 'Blue', hex: '#1e63c4' },
			{ id: 'green', name: 'Green', hex: '#1f7a46' },
			{ id: 'red', name: 'Red', hex: '#c62828' },
			{ id: 'orange', name: 'Orange', hex: '#f06a1c' },
			{ id: 'yellow', name: 'Yellow', hex: '#f1d21c' },
			{ id: 'pink', name: 'Pink', hex: '#e45b99' },
		],
		textures: ['smooth', 'perforated', 'grooved'],
		finishes: ['matte', 'gloss'],
		resetsOvergrip: false,
	},
};

export const OVERGRIP_COLORS: readonly GripColor[] = [
	{ id: 'white', name: 'White', hex: '#f4f4f1' },
	{ id: 'black', name: 'Black', hex: '#151515' },
	{ id: 'grey', name: 'Grey', hex: '#9a9da3' },
	{ id: 'blue', name: 'Blue', hex: '#2f73d0' },
	{ id: 'green', name: 'Green', hex: '#2e9a5a' },
	{ id: 'red', name: 'Red', hex: '#d33a3a' },
	{ id: 'yellow', name: 'Yellow', hex: '#f3e24a' },
	{ id: 'pink', name: 'Pink', hex: '#f07aa9' },
];

export const OVERGRIP_MATERIALS = ['tacky', 'dry'] as const;
export type OvergripMaterial = (typeof OVERGRIP_MATERIALS)[number];

export const OVERGRIP_TEXTURES = ['smooth', 'perforated', 'ribbed'] as const;
export type OvergripTexture = (typeof OVERGRIP_TEXTURES)[number];

export interface OvergripMaterialSpec {
	name: string;
	description: string;
	textures: readonly OvergripTexture[];
}

export const OVERGRIP_CATALOG: Readonly<Record<OvergripMaterial, OvergripMaterialSpec>> =
	{
		tacky: {
			name: 'Tacky',
			description:
				'Thin polyurethane with a sticky feel. Best for dry hands and a firm hold.',
			textures: ['smooth', 'perforated', 'ribbed'],
		},
		dry: {
			name: 'Dry',
			description:
				'Felt-like, anti-sweat surface that soaks up moisture and gets grippier as you sweat.',
			textures: ['smooth', 'perforated'],
		},
	};

export interface OvergripSpec {
	colorId: string;
	material: OvergripMaterial;
	texture: OvergripTexture;
}

export interface GripSpec {
	material: GripMaterial;
	colorId: string;
	customHex: string | null;
	texture: GripTexture;
	finish: GripFinish;
	overgrip: OvergripSpec | null;
}

export interface OvergripSpecV4 {
	colorId: string;
	finish: GripFinish;
}

export type GripSpecV4 = Omit<GripSpec, 'customHex' | 'overgrip'> & {
	overgrip: OvergripSpecV4 | null;
};

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

export const findGripColor = ({
	material,
	colorId,
}: {
	material: GripMaterial;
	colorId: string;
}): GripColor | null =>
	GRIP_CATALOG[material].colors.find((color) => color.id === colorId) ?? null;

export const findOvergripColor = ({ colorId }: { colorId: string }): GripColor | null =>
	OVERGRIP_COLORS.find((color) => color.id === colorId) ?? null;

export const isValidGrip = ({ grip }: { grip: GripSpec }): boolean => {
	const spec = GRIP_CATALOG[grip.material];
	const isBaseValid =
		findGripColor({ material: grip.material, colorId: grip.colorId }) !== null &&
		spec.textures.includes(grip.texture) &&
		spec.finishes.includes(grip.finish);
	const isCustomValid = grip.customHex === null || HEX_PATTERN.test(grip.customHex);
	const isOvergripValid =
		grip.overgrip === null ||
		(findOvergripColor({ colorId: grip.overgrip.colorId }) !== null &&
			OVERGRIP_MATERIALS.includes(grip.overgrip.material) &&
			OVERGRIP_CATALOG[grip.overgrip.material].textures.includes(grip.overgrip.texture));
	return isBaseValid && isCustomValid && isOvergripValid;
};

export const withOvergripMaterial = ({
	overgrip,
	material,
}: {
	overgrip: OvergripSpec;
	material: OvergripMaterial;
}): OvergripSpec => ({
	...overgrip,
	material,
	texture: OVERGRIP_CATALOG[material].textures.includes(overgrip.texture)
		? overgrip.texture
		: 'smooth',
});

export const getGripHex = ({ grip }: { grip: GripSpec }): string | null =>
	grip.customHex ??
	findGripColor({ material: grip.material, colorId: grip.colorId })?.hex ??
	null;

export const withGripMaterial = ({
	grip,
	material,
}: {
	grip: GripSpec;
	material: GripMaterial;
}): GripSpec => {
	const spec = GRIP_CATALOG[material];
	const [firstColor] = spec.colors;
	const [firstTexture] = spec.textures;
	const [firstFinish] = spec.finishes;
	return {
		material,
		colorId:
			findGripColor({ material, colorId: grip.colorId })?.id ??
			firstColor?.id ??
			grip.colorId,
		texture: spec.textures.includes(grip.texture)
			? grip.texture
			: (firstTexture ?? 'smooth'),
		customHex: grip.customHex,
		finish: spec.finishes.includes(grip.finish) ? grip.finish : (firstFinish ?? 'matte'),
		overgrip: spec.resetsOvergrip ? null : grip.overgrip,
	};
};

const hexToRgb = ({ hex }: { hex: string }): [number, number, number] => [
	Number.parseInt(hex.slice(1, 3), 16),
	Number.parseInt(hex.slice(3, 5), 16),
	Number.parseInt(hex.slice(5, 7), 16),
];

export const nearestGripColor = ({
	colors,
	hex,
}: {
	colors: readonly GripColor[];
	hex: string;
}): GripColor | null => {
	const [r, g, b] = hexToRgb({ hex });
	let best: GripColor | null = null;
	let bestDistance = Number.POSITIVE_INFINITY;
	for (const color of colors) {
		const [cr, cg, cb] = hexToRgb({ hex: color.hex });
		const distance = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
		if (distance < bestDistance) {
			best = color;
			bestDistance = distance;
		}
	}
	return best;
};
