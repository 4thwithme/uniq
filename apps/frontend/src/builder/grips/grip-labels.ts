import {
	findGripColor,
	findOvergripColor,
	GRIP_CATALOG,
	findTrimColor,
	OVERGRIP_CATALOG,
} from '@uniq/shared';

import type {
	GripFinish,
	GripSpec,
	GripTexture,
	OvergripTexture,
	TrimSpec,
} from '@uniq/shared';

export const GRIP_TEXTURE_LABELS: Readonly<Record<GripTexture, string>> = {
	smooth: 'Smooth',
	perforated: 'Perforated',
	grooved: 'Grooved',
};

export const OVERGRIP_TEXTURE_LABELS: Readonly<Record<OvergripTexture, string>> = {
	smooth: 'Smooth',
	perforated: 'Perforated',
	ribbed: 'Ribbed',
};

export const GRIP_FINISH_LABELS: Readonly<Record<GripFinish, string>> = {
	matte: 'Matte · dry',
	gloss: 'Gloss · tacky',
};

export const describeGrip = ({ grip }: { grip: GripSpec }): string => {
	const color =
		grip.customHex === null
			? (findGripColor({ material: grip.material, colorId: grip.colorId })?.name ?? '')
			: `Custom ${grip.customHex}`;
	return `${GRIP_CATALOG[grip.material].name} · ${color}`;
};

export const describeOvergrip = ({ grip }: { grip: GripSpec }): string => {
	if (grip.overgrip === null) {
		return '—';
	}
	const color = findOvergripColor({ colorId: grip.overgrip.colorId })?.name ?? '';
	return `${color} · ${OVERGRIP_CATALOG[grip.overgrip.material].name.toLowerCase()}`;
};

export const describeTrim = ({ trim }: { trim: TrimSpec | null }): string => {
	if (trim === null) {
		return '—';
	}
	const color = findTrimColor({ colorId: trim.colorId })?.name ?? '';
	return `${color} · ${trim.finish}`;
};
