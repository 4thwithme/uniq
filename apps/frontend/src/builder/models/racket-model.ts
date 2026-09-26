import { Box3, Mesh } from 'three';

import type { TubeMetrics } from '@builder/decor/frame-faces';
import type { BufferGeometry, Object3D } from 'three';

export const RACKET_MODEL_URL = `${import.meta.env.BASE_URL}models/racket.glb`;

export const RACKET_MODEL_NODES = {
	frame: 'zone_frame',
	throat: 'zone_throat',
	handle: 'zone_handle',
	buttCap: 'zone_butt_cap',
	strings: 'zone_strings',
	grommets: 'grommets',
} as const;

export type RacketModelPart = keyof typeof RACKET_MODEL_NODES;

export type RacketGeometries = Readonly<Record<RacketModelPart, BufferGeometry>>;

export const getRacketGeometries = ({
	nodes,
}: {
	nodes: Readonly<Record<string, Object3D>>;
}): RacketGeometries => {
	const pick = ({ part }: { part: RacketModelPart }): BufferGeometry => {
		const node = nodes[RACKET_MODEL_NODES[part]];
		if (!(node instanceof Mesh)) {
			throw new Error(`racket model is missing ${RACKET_MODEL_NODES[part]}`);
		}
		return node.geometry as BufferGeometry;
	};

	return {
		frame: pick({ part: 'frame' }),
		throat: pick({ part: 'throat' }),
		handle: pick({ part: 'handle' }),
		buttCap: pick({ part: 'buttCap' }),
		strings: pick({ part: 'strings' }),
		grommets: pick({ part: 'grommets' }),
	};
};

const FALLBACK_METRICS: TubeMetrics = { loopLength: 0.93, perimeter: 0.06 };

const isPositive = ({ value }: { value: unknown }): boolean =>
	typeof value === 'number' && Number.isFinite(value) && value > 0;

export const getTubeMetrics = ({
	nodes,
}: {
	nodes: Readonly<Record<string, Object3D>>;
}): TubeMetrics => {
	const data = nodes[RACKET_MODEL_NODES.frame]?.userData as
		Record<string, unknown> | undefined;
	const loopLength = data?.['loopLength'];
	const perimeter = data?.['perimeter'];
	return typeof loopLength === 'number' &&
		typeof perimeter === 'number' &&
		isPositive({ value: loopLength }) &&
		isPositive({ value: perimeter })
		? { loopLength, perimeter }
		: FALLBACK_METRICS;
};

export const getGeometryBottomY = ({ geometry }: { geometry: BufferGeometry }): number =>
	new Box3().setFromObject(new Mesh(geometry)).min.y;
