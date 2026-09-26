import type { GripColor, GripFinish } from './grip-catalog';

export const BUTT_CAP_COLORS: readonly GripColor[] = [
	{ id: 'black', name: 'Black', hex: '#151515' },
	{ id: 'white', name: 'White', hex: '#f2f2ef' },
	{ id: 'grey', name: 'Grey', hex: '#7d8187' },
	{ id: 'red', name: 'Red', hex: '#c62828' },
	{ id: 'blue', name: 'Blue', hex: '#1e63c4' },
	{ id: 'green', name: 'Green', hex: '#1f7a46' },
	{ id: 'yellow', name: 'Yellow', hex: '#f1d21c' },
	{ id: 'orange', name: 'Orange', hex: '#f06a1c' },
];

export const BADGE_COLORS: readonly GripColor[] = [
	{ id: 'white', name: 'White', hex: '#ffffff' },
	{ id: 'black', name: 'Black', hex: '#111111' },
	{ id: 'gold', name: 'Gold', hex: '#c9a227' },
	{ id: 'silver', name: 'Silver', hex: '#b8bcc2' },
	{ id: 'red', name: 'Red', hex: '#d33a3a' },
	{ id: 'volt', name: 'Volt', hex: '#c6ff3d' },
];

export const BADGE_PRESET_IDS = ['monogram', 'ball', 'star', 'bolt'] as const;
export type BadgePresetId = (typeof BADGE_PRESET_IDS)[number];

export const BADGE_TEXT_PATTERN = /^[A-Z0-9]{1,3}$/;

export type ButtCapBadge =
	| { kind: 'none' }
	| { kind: 'preset'; presetId: BadgePresetId; colorId: string }
	| { kind: 'text'; text: string; colorId: string };

export interface ButtCapSpec {
	colorId: string;
	finish: GripFinish;
	badge: ButtCapBadge;
}

export const DEFAULT_BUTT_CAP: ButtCapSpec = {
	colorId: 'black',
	finish: 'gloss',
	badge: { kind: 'preset', presetId: 'monogram', colorId: 'white' },
};

export const findButtCapColor = ({ colorId }: { colorId: string }): GripColor | null =>
	BUTT_CAP_COLORS.find((color) => color.id === colorId) ?? null;

export const findBadgeColor = ({ colorId }: { colorId: string }): GripColor | null =>
	BADGE_COLORS.find((color) => color.id === colorId) ?? null;

export const normalizeBadgeText = ({ text }: { text: string }): string =>
	text
		.toUpperCase()
		.replace(/[^A-Z]/g, '')
		.slice(0, 3);
