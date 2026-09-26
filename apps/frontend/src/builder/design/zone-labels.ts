import type { Finish, ZoneId } from '@uniq/shared';

export const ZONE_LABELS: Readonly<Record<ZoneId, string>> = {
	frame: 'Frame',
	throat: 'Throat',
};

export const FINISH_LABELS: Readonly<Record<Finish, string>> = {
	gloss: 'Gloss',
	matte: 'Matte',
	metallic: 'Metallic',
	pearl: 'Pearl',
};
