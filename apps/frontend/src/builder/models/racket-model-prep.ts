export type ModelPart =
	'frame' | 'throat' | 'handle' | 'buttCap' | 'strings' | 'grommets';

export type Vec3Tuple = readonly [number, number, number];

export interface Bounds {
	min: Vec3Tuple;
	max: Vec3Tuple;
}

export interface ModelCuts {
	buttCapTop: number;
	handleTop: number;
	throatTop: number;
}

export interface ModelPlacement {
	scale: number;
	headCenterZ: number;
}

export const SOURCE_CUTS: ModelCuts = {
	buttCapTop: 0.02,
	handleTop: 0.245,
	throatTop: 0.44,
};

export const SOURCE_PLACEMENT: ModelPlacement = {
	scale: 0.72,
	headCenterZ: 0.68,
};

const STRING_MIN_SPAN = 0.03;
const STRING_MAX_HALF_DEPTH = 0.0015;
const TAU = Math.PI * 2;

export const readAt = <T>({ list, index }: { list: ArrayLike<T>; index: number }): T => {
	const value = list[index];
	if (value === undefined) {
		throw new RangeError(`index ${String(index)} is out of range`);
	}
	return value;
};

export const findComponents = ({
	indices,
	vertexCount,
}: {
	indices: ArrayLike<number>;
	vertexCount: number;
}): Int32Array => {
	const parent = new Int32Array(vertexCount).map((_, index) => index);
	const find = ({ index }: { index: number }): number => {
		let root = index;
		while (readAt({ list: parent, index: root }) !== root) {
			root = readAt({ list: parent, index: root });
		}
		let current = index;
		while (current !== root) {
			const next = readAt({ list: parent, index: current });
			parent[current] = root;
			current = next;
		}
		return root;
	};

	for (let index = 0; index + 2 < indices.length; index += 3) {
		const a = find({ index: readAt({ list: indices, index }) });
		const b = find({ index: readAt({ list: indices, index: index + 1 }) });
		const c = find({ index: readAt({ list: indices, index: index + 2 }) });
		parent[b] = a;
		parent[c] = a;
	}

	return new Int32Array(vertexCount).map((_, index) => find({ index }));
};

export const classifyComponent = ({
	bounds,
	isBody,
}: {
	bounds: Bounds;
	isBody: boolean;
}): ModelPart | 'body' => {
	if (isBody) {
		return 'body';
	}
	const spanX = bounds.max[0] - bounds.min[0];
	const spanZ = bounds.max[2] - bounds.min[2];
	const halfDepth = Math.max(Math.abs(bounds.min[1]), Math.abs(bounds.max[1]));
	if (Math.max(spanX, spanZ) > STRING_MIN_SPAN || halfDepth <= STRING_MAX_HALF_DEPTH) {
		return 'strings';
	}
	return 'grommets';
};

export const classifyBodyTriangle = ({
	centroidZ,
	cuts = SOURCE_CUTS,
}: {
	centroidZ: number;
	cuts?: ModelCuts;
}): ModelPart => {
	if (centroidZ < cuts.buttCapTop) {
		return 'buttCap';
	}
	if (centroidZ < cuts.handleTop) {
		return 'handle';
	}
	if (centroidZ < cuts.throatTop) {
		return 'throat';
	}
	return 'frame';
};

export const toScenePosition = ({
	position,
	placement = SOURCE_PLACEMENT,
}: {
	position: Vec3Tuple;
	placement?: ModelPlacement;
}): Vec3Tuple => [
	position[0] * placement.scale,
	(position[2] - placement.headCenterZ) * placement.scale,
	-position[1] * placement.scale,
];

export const toSceneDirection = ({ direction }: { direction: Vec3Tuple }): Vec3Tuple => [
	direction[0],
	direction[2],
	-direction[1],
];

const wrapUnit = ({ value }: { value: number }): number => ((value % 1) + 1) % 1;

export const getLoopU = ({ x, y }: { x: number; y: number }): number =>
	wrapUnit({ value: Math.atan2(y, x) / TAU });

export const getBeamCenters = ({
	points,
	bins,
}: {
	points: readonly (readonly [number, number])[];
	bins: number;
}): Float64Array => {
	const low = new Float64Array(bins).fill(Number.POSITIVE_INFINITY);
	const high = new Float64Array(bins).fill(Number.NEGATIVE_INFINITY);

	for (const [x, y] of points) {
		const bin = Math.min(bins - 1, Math.floor(getLoopU({ x, y }) * bins));
		const radius = Math.hypot(x, y);
		low[bin] = Math.min(readAt({ list: low, index: bin }), radius);
		high[bin] = Math.max(readAt({ list: high, index: bin }), radius);
	}

	const centers = new Float64Array(bins).fill(Number.NaN);
	for (let bin = 0; bin < bins; bin += 1) {
		const min = readAt({ list: low, index: bin });
		if (Number.isFinite(min)) {
			centers[bin] = (min + readAt({ list: high, index: bin })) / 2;
		}
	}

	for (let bin = 0; bin < bins; bin += 1) {
		if (!Number.isNaN(readAt({ list: centers, index: bin }))) {
			continue;
		}
		for (let step = 1; step < bins; step += 1) {
			const before = readAt({ list: centers, index: (bin - step + bins) % bins });
			const after = readAt({ list: centers, index: (bin + step) % bins });
			const found = Number.isNaN(before) ? after : before;
			if (!Number.isNaN(found)) {
				centers[bin] = found;
				break;
			}
		}
	}

	return centers;
};

export interface LoopCenterline {
	points: readonly (readonly [number, number])[];
	arc: Float64Array;
}

const CENTERLINE_SEARCH = 1 / 12;

export const getLoopCenterline = ({
	beamCenters,
}: {
	beamCenters: Float64Array;
}): LoopCenterline => {
	const bins = beamCenters.length;
	const points = Array.from({ length: bins + 1 }, (_, bin) => {
		const angle = (bin / bins) * TAU;
		const radius =
			(readAt({ list: beamCenters, index: (bin - 1 + bins) % bins }) +
				readAt({ list: beamCenters, index: bin % bins })) /
			2;
		return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
	});
	const arc = new Float64Array(bins + 1);
	for (let bin = 0; bin < bins; bin += 1) {
		const [ax, ay] = readAt({ list: points, index: bin });
		const [bx, by] = readAt({ list: points, index: bin + 1 });
		arc[bin + 1] = readAt({ list: arc, index: bin }) + Math.hypot(bx - ax, by - ay);
	}
	const total = readAt({ list: arc, index: bins });
	return { points, arc: arc.map((length) => length / total) };
};

export const getFrameUv = ({
	position,
	centerline,
}: {
	position: Vec3Tuple;
	centerline: LoopCenterline;
}): readonly [number, number] => {
	const [x, y, z] = position;
	const segments = centerline.points.length - 1;
	const guess = Math.floor(getLoopU({ x, y }) * segments);
	const window = Math.max(1, Math.ceil(segments * CENTERLINE_SEARCH));
	let best = { distance: Number.POSITIVE_INFINITY, u: 0, normal: 0 };

	for (let step = -window; step <= window; step += 1) {
		const segment = (((guess + step) % segments) + segments) % segments;
		const [ax, ay] = readAt({ list: centerline.points, index: segment });
		const [bx, by] = readAt({ list: centerline.points, index: segment + 1 });
		const dx = bx - ax;
		const dy = by - ay;
		const lengthSquared = Math.max(dx * dx + dy * dy, Number.EPSILON);
		const t = Math.min(1, Math.max(0, ((x - ax) * dx + (y - ay) * dy) / lengthSquared));
		const px = ax + dx * t;
		const py = ay + dy * t;
		const distance = Math.hypot(x - px, y - py);
		if (distance < best.distance) {
			const start = readAt({ list: centerline.arc, index: segment });
			const end = readAt({ list: centerline.arc, index: segment + 1 });
			const length = Math.sqrt(lengthSquared);
			best = {
				distance,
				u: start + (end - start) * t,
				normal: ((x - px) * dy - (y - py) * dx) / length,
			};
		}
	}

	return [
		wrapUnit({ value: best.u }),
		wrapUnit({ value: Math.atan2(-best.normal, z) / TAU }),
	];
};

export const getHandleUv = ({
	position,
	bottomY,
	topY,
}: {
	position: Vec3Tuple;
	bottomY: number;
	topY: number;
}): readonly [number, number] => {
	const [x, y, z] = position;
	return [wrapUnit({ value: Math.atan2(x, z) / TAU }), (y - bottomY) / (topY - bottomY)];
};

export const getThroatUv = ({
	position,
	bounds,
	isFront,
}: {
	position: Vec3Tuple;
	bounds: Bounds;
	isFront: boolean;
}): readonly [number, number] => {
	const [x, y] = position;
	const height = Math.max(bounds.max[1] - bounds.min[1], Number.EPSILON);
	const width = Math.max(bounds.max[0] - bounds.min[0], Number.EPSILON);
	const across = ((x - bounds.min[0]) / width - 0.5) / 2;
	return [(y - bounds.min[1]) / height, isFront ? across : 0.5 - across];
};

export const getPlanarUv = ({
	position,
	bounds,
}: {
	position: Vec3Tuple;
	bounds: Bounds;
}): readonly [number, number] => {
	const [x, y] = position;
	const width = Math.max(bounds.max[0] - bounds.min[0], Number.EPSILON);
	const height = Math.max(bounds.max[1] - bounds.min[1], Number.EPSILON);
	return [(x - bounds.min[0]) / width, (y - bounds.min[1]) / height];
};

export const unwrapSeam = ({ values }: { values: readonly number[] }): number[] => {
	const max = Math.max(...values);
	const min = Math.min(...values);
	if (max - min <= 0.5) {
		return [...values];
	}
	return values.map((value) => (value < 0.5 ? value + 1 : value));
};
