import { GRIP_FINISHES } from './grip-catalog';

import type { GripColor, GripFinish } from './grip-catalog';

export const TRIM_COLORS: readonly GripColor[] = [
	{ id: 'black', name: 'Black', hex: '#141414' },
	{ id: 'white', name: 'White', hex: '#f2f2ef' },
	{ id: 'grey', name: 'Grey', hex: '#7d8187' },
	{ id: 'red', name: 'Red', hex: '#c62828' },
	{ id: 'blue', name: 'Blue', hex: '#1e63c4' },
	{ id: 'green', name: 'Green', hex: '#1f7a46' },
	{ id: 'yellow', name: 'Yellow', hex: '#f1d21c' },
	{ id: 'orange', name: 'Orange', hex: '#f06a1c' },
	{ id: 'pink', name: 'Pink', hex: '#e45b99' },
	{ id: 'volt', name: 'Volt', hex: '#c6ff3d' },
	{ id: 'gold', name: 'Gold', hex: '#c9a227' },
	{ id: 'silver', name: 'Silver', hex: '#b8bcc2' },
];

export interface TrimSpec {
	colorId: string;
	finish: GripFinish;
}

export const DEFAULT_GROMMETS: TrimSpec = { colorId: 'black', finish: 'matte' };

export const DEFAULT_FINISHING_TAPE: TrimSpec = { colorId: 'white', finish: 'matte' };

export const findTrimColor = ({ colorId }: { colorId: string }): GripColor | null =>
	TRIM_COLORS.find((color) => color.id === colorId) ?? null;

export const isTrimSpec = (value: unknown): value is TrimSpec => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	const record = value as Record<string, unknown>;
	const colorId = record['colorId'];
	return (
		typeof colorId === 'string' &&
		findTrimColor({ colorId }) !== null &&
		GRIP_FINISHES.some((finish) => finish === record['finish'])
	);
};
