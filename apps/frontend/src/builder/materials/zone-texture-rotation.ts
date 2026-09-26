import type { ZoneId } from '@uniq/shared';

const QUARTER_TURN = Math.PI / 2;

export const ZONE_TEXTURE_ROTATION: Readonly<Record<ZoneId, number>> = {
	frame: 0,
	throat: QUARTER_TURN,
};
