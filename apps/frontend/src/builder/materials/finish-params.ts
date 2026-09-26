import type { Finish } from '@uniq/shared';

export interface FinishParams {
	roughness: number;
	metalness: number;
	clearcoat: number;
	clearcoatRoughness: number;
	iridescence: number;
	sheen: number;
}

export const FINISH_PARAMS: Readonly<Record<Finish, FinishParams>> = {
	gloss: {
		roughness: 0.22,
		metalness: 0.05,
		clearcoat: 1,
		clearcoatRoughness: 0.05,
		iridescence: 0,
		sheen: 0,
	},
	matte: {
		roughness: 0.85,
		metalness: 0,
		clearcoat: 0,
		clearcoatRoughness: 1,
		iridescence: 0,
		sheen: 0.2,
	},
	metallic: {
		roughness: 0.3,
		metalness: 0.95,
		clearcoat: 0.6,
		clearcoatRoughness: 0.2,
		iridescence: 0,
		sheen: 0,
	},
	pearl: {
		roughness: 0.25,
		metalness: 0.1,
		clearcoat: 1,
		clearcoatRoughness: 0.1,
		iridescence: 0.8,
		sheen: 0.4,
	},
};
