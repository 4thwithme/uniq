import { findBadgeColor, findButtCapColor } from '@uniq/shared';

import type { BadgePresetId, ButtCapSpec } from '@uniq/shared';

export const BADGE_PRESET_LABELS: Readonly<Record<BadgePresetId, string>> = {
	monogram: 'UNIQ monogram',
	ball: 'Ball',
	star: 'Star',
	bolt: 'Bolt',
};

export const describeButtCap = ({ buttCap }: { buttCap: ButtCapSpec }): string => {
	const color = findButtCapColor({ colorId: buttCap.colorId })?.name ?? '';
	const { badge } = buttCap;
	if (badge.kind === 'none') {
		return `${color} · no badge`;
	}
	const badgeColor = findBadgeColor({ colorId: badge.colorId })?.name ?? '';
	const label = badge.kind === 'text' ? badge.text : BADGE_PRESET_LABELS[badge.presetId];
	return `${color} · ${label} in ${badgeColor.toLowerCase()}`;
};
