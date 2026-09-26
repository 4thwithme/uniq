import { resolve } from 'node:path';

import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { prune, reorder, weld } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

import type { SweepResult } from '../src/builder/models/frame-sweep.ts';
import type {
	Bounds,
	ModelPart,
	Vec3Tuple,
} from '../src/builder/models/racket-model-prep.ts';
import type { Accessor } from '@gltf-transform/core';

import { smoothPeriodic, sweepLoop } from '../src/builder/models/frame-sweep.ts';
import {
	classifyBodyTriangle,
	classifyComponent,
	findComponents,
	getBeamCenters,
	getFrameUv,
	getLoopCenterline,
	getLoopU,
	getHandleUv,
	getPlanarUv,
	getThroatUv,
	toSceneDirection,
	toScenePosition,
	unwrapSeam,
} from '../src/builder/models/racket-model-prep.ts';

const INPUT = resolve(
	import.meta.dirname,
	process.argv[2] ?? '../../../data/Racket1.glb',
);
const OUTPUT = resolve(import.meta.dirname, '../public/models/racket.glb');
const BEAM_BINS = 720;

const NODE_NAMES: Readonly<Record<ModelPart, string>> = {
	frame: 'zone_frame',
	throat: 'zone_throat',
	handle: 'zone_handle',
	buttCap: 'zone_butt_cap',
	strings: 'zone_strings',
	grommets: 'grommets',
};

const PARTS = Object.keys(NODE_NAMES) as ModelPart[];

interface PartBuffers {
	positions: Vec3Tuple[];
	normals: Vec3Tuple[];
}

const readVec3 = ({
	array,
	index,
}: {
	array: ArrayLike<number>;
	index: number;
}): Vec3Tuple => [
	array[index * 3] ?? 0,
	array[index * 3 + 1] ?? 0,
	array[index * 3 + 2] ?? 0,
];

const getBounds = ({ points }: { points: readonly Vec3Tuple[] }): Bounds => {
	const min = [Infinity, Infinity, Infinity];
	const max = [-Infinity, -Infinity, -Infinity];
	for (const point of points) {
		for (let axis = 0; axis < 3; axis += 1) {
			min[axis] = Math.min(min[axis] ?? Infinity, point[axis] ?? 0);
			max[axis] = Math.max(max[axis] ?? -Infinity, point[axis] ?? 0);
		}
	}
	return {
		min: [min[0] ?? 0, min[1] ?? 0, min[2] ?? 0],
		max: [max[0] ?? 0, max[1] ?? 0, max[2] ?? 0],
	};
};

interface SplitResult {
	parts: Map<ModelPart, PartBuffers>;
	grommetCenters: Vec3Tuple[];
	outerLoops: Map<number, PartBuffers>;
}

const OUTER_LOOP_MAX_SPAN = 0.03;

const splitSource = async ({ input }: { input: string }): Promise<SplitResult> => {
	const source = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(input);
	const primitive = source.getRoot().listMeshes()[0]?.listPrimitives()[0];
	const positions = primitive?.getAttribute('POSITION')?.getArray();
	const normals = primitive?.getAttribute('NORMAL')?.getArray();
	const indices = primitive?.getIndices()?.getArray();
	if (!positions || !normals || !indices) {
		throw new Error('source model needs positions, normals and indices');
	}

	const vertexCount = positions.length / 3;
	const labels = findComponents({ indices, vertexCount });
	const members = new Map<number, Vec3Tuple[]>();
	for (let index = 0; index < vertexCount; index += 1) {
		const label = labels[index] ?? 0;
		const list = members.get(label) ?? [];
		list.push(readVec3({ array: positions, index }));
		members.set(label, list);
	}
	const bodyLabel = [...members.entries()].sort(
		(a, b) => b[1].length - a[1].length,
	)[0]?.[0];
	const componentPart = new Map<number, ModelPart | 'body' | 'drop'>();
	const outerLoops = new Map<number, PartBuffers>();
	const grommetCenters: Vec3Tuple[] = [];
	for (const [label, points] of members) {
		const bounds = getBounds({ points });
		const part = classifyComponent({ bounds, isBody: label === bodyLabel });
		const span = Math.max(bounds.max[0] - bounds.min[0], bounds.max[2] - bounds.min[2]);
		componentPart.set(
			label,
			part === 'strings' && span < OUTER_LOOP_MAX_SPAN ? 'drop' : part,
		);
		if (part === 'grommets') {
			const sum = points.reduce<[number, number, number]>(
				(acc, point) => [acc[0] + point[0], acc[1] + point[1], acc[2] + point[2]],
				[0, 0, 0],
			);

			grommetCenters.push(
				toScenePosition({
					position: [
						sum[0] / points.length,
						sum[1] / points.length,
						sum[2] / points.length,
					],
				}),
			);
		}
	}

	const parts = new Map<ModelPart, PartBuffers>(
		PARTS.map((part) => [part, { positions: [], normals: [] }]),
	);
	for (let index = 0; index + 2 < indices.length; index += 3) {
		const corners = [
			indices[index] ?? 0,
			indices[index + 1] ?? 0,
			indices[index + 2] ?? 0,
		];
		const points = corners.map((corner) => readVec3({ array: positions, index: corner }));
		const component = componentPart.get(labels[corners[0] ?? 0] ?? 0) ?? 'grommets';
		if (component === 'drop') {
			const label = labels[corners[0] ?? 0] ?? 0;
			const loop = outerLoops.get(label) ?? { positions: [], normals: [] };
			corners.forEach((corner, cornerIndex) => {
				const point = points[cornerIndex];
				if (point) {
					loop.positions.push(toScenePosition({ position: point }));
				}
				loop.normals.push(
					toSceneDirection({ direction: readVec3({ array: normals, index: corner }) }),
				);
			});
			outerLoops.set(label, loop);
			continue;
		}
		const part =
			component === 'body'
				? classifyBodyTriangle({
						centroidZ: points.reduce((sum, point) => sum + point[2], 0) / 3,
					})
				: component;
		const target = parts.get(part);
		corners.forEach((corner, cornerIndex) => {
			const point = points[cornerIndex];
			if (point) {
				target?.positions.push(toScenePosition({ position: point }));
			}
			target?.normals.push(
				toSceneDirection({ direction: readVec3({ array: normals, index: corner }) }),
			);
		});
	}
	return { parts, grommetCenters, outerLoops };
};

const computeUvs = ({
	part,
	positions,
	normals,
}: {
	part: ModelPart;
	positions: Vec3Tuple[];
	normals: Vec3Tuple[];
}): number[] => {
	const bounds = getBounds({ points: positions });
	const beamCenters =
		part === 'frame'
			? getBeamCenters({
					points: positions.map(([x, y]) => [x, y] as const),
					bins: BEAM_BINS,
				})
			: null;
	const centerline = beamCenters ? getLoopCenterline({ beamCenters }) : null;
	const raw = positions.map((position, index) => {
		if (part === 'throat') {
			const start = index - (index % 3);
			const facing = [0, 1, 2].reduce(
				(sum, corner) => sum + (normals[start + corner]?.[2] ?? 0),
				0,
			);
			return getThroatUv({ position, bounds, isFront: facing >= 0 });
		}
		if (centerline) {
			return getFrameUv({ position, centerline });
		}
		if (part === 'handle') {
			return getHandleUv({ position, bottomY: bounds.min[1], topY: bounds.max[1] });
		}
		return getPlanarUv({ position, bounds });
	});
	const uvs: number[] = [];
	for (let index = 0; index + 2 < raw.length; index += 3) {
		const triangle = [raw[index], raw[index + 1], raw[index + 2]];
		const us = unwrapSeam({ values: triangle.map((uv) => uv?.[0] ?? 0) });
		const vs = unwrapSeam({ values: triangle.map((uv) => uv?.[1] ?? 0) });
		for (let corner = 0; corner < 3; corner += 1) {
			uvs.push(us[corner] ?? 0, vs[corner] ?? 0);
		}
	}
	return uvs;
};

const TUBE_BINS = 480;
const TUBE_RING = 64;
const TUBE_GROOVE = { halfWidth: 0.003, depth: 0.0019 } as const;
const TUBE_HALF_DEPTH = 0.0098;
const TUBE_CORNER = 0.003;
const INNER_WALL_OFFSET = 0.0019;
const WIDTH_RANGE = { min: 0.0095, max: 0.0145 } as const;

const angleBin = ({ x, y }: { x: number; y: number }): number =>
	Math.min(TUBE_BINS - 1, Math.floor(getLoopU({ x, y }) * TUBE_BINS));

interface RingSample {
	u: number;
	low: number;
	width: number;
}

const interpolateSamples = ({
	samples,
	key,
}: {
	samples: RingSample[];
	key: 'low' | 'width';
}): number[] => {
	const sorted = [...samples].sort((a, b) => a.u - b.u);
	return Array.from({ length: TUBE_BINS }, (_, bin) => {
		const u = (bin + 0.5) / TUBE_BINS;
		const next = sorted.findIndex((item) => item.u >= u);
		const after = sorted[next === -1 ? 0 : next];
		const before = sorted[next <= 0 ? sorted.length - 1 : next - 1];
		if (!after || !before) {
			return 0;
		}
		const span = Math.max((after.u - before.u + 1) % 1, Number.EPSILON);
		const t = ((u - before.u + 1) % 1) / span;
		return before[key] + (after[key] - before[key]) * t;
	});
};

const measureRing = ({
	frame,
	grommetCenters,
}: {
	frame: PartBuffers;
	grommetCenters: Vec3Tuple[];
}): RingSample[] => {
	const ring = grommetCenters
		.map(([x, y]) => ({ u: getLoopU({ x, y }), radius: Math.hypot(x, y), x, y }))
		.sort((a, b) => a.u - b.u);
	const clean = ring.filter((item, index) => {
		const before = ring[(index - 1 + ring.length) % ring.length];
		const after = ring[(index + 1) % ring.length];
		return (
			before !== undefined &&
			after !== undefined &&
			Math.abs(item.radius - (before.radius + after.radius) / 2) < 0.004
		);
	});
	return clean.flatMap(({ u, radius, x, y }) => {
		const angle = Math.atan2(y, x);
		let low = Infinity;
		let high = -Infinity;
		for (const [px, py, pz] of frame.positions) {
			const delta = Math.abs(Math.atan2(py, px) - angle);
			if (
				Math.min(delta, Math.PI * 2 - delta) < 0.012 &&
				Math.abs(pz) < TUBE_HALF_DEPTH + 0.001
			) {
				const r = Math.hypot(px, py);
				low = Math.min(low, r);
				high = Math.max(high, r);
			}
		}
		const width = high - low;
		const isValid =
			width > WIDTH_RANGE.min &&
			width < WIDTH_RANGE.max &&
			Math.abs(low - (radius + INNER_WALL_OFFSET)) < 0.0012;
		return isValid ? [{ u, low, width }] : [];
	});
};

const JUNCTION_ZONES: readonly (readonly [number, number])[] = [
	[0.6, 0.72],
	[0.78, 0.9],
];
const LOOP_SINK = 0.0008;

const isInJunction = ({ x, y }: { x: number; y: number }): boolean => {
	const u = getLoopU({ x, y });
	return JUNCTION_ZONES.some(([from, to]) => u >= from && u <= to);
};

const seatOuterLoops = ({
	loops,
	centerRadius,
	halfWidths,
	strings,
}: {
	loops: Map<number, PartBuffers>;
	centerRadius: number[];
	halfWidths: number[];
	strings: PartBuffers;
}): void => {
	for (const loop of loops.values()) {
		const count = Math.max(loop.positions.length, 1);
		const [cx, cy] = loop.positions.reduce(
			(sum, point) => [sum[0] + point[0] / count, sum[1] + point[1] / count],
			[0, 0],
		);
		const bin = angleBin({ x: cx, y: cy });
		const outer = (centerRadius[bin] ?? 0) + (halfWidths[bin] ?? 0);
		const top = Math.max(...loop.positions.map(([x, y]) => Math.hypot(x, y)));
		const shift = outer - LOOP_SINK - top;
		const length = Math.max(Math.hypot(cx, cy), Number.EPSILON);
		for (const [x, y, z] of loop.positions) {
			strings.positions.push([x + (cx / length) * shift, y + (cy / length) * shift, z]);
		}
		strings.normals.push(...loop.normals);
	}
};

const buildFrameTube = ({
	parts,
	grommetCenters,
	outerLoops,
}: {
	parts: Map<ModelPart, PartBuffers>;
	grommetCenters: Vec3Tuple[];
	outerLoops: Map<number, PartBuffers>;
}): SweepResult => {
	const frame = parts.get('frame') ?? { positions: [], normals: [] };
	const throat = parts.get('throat') ?? { positions: [], normals: [] };
	const samples = measureRing({ frame, grommetCenters });
	const lows = interpolateSamples({ samples, key: 'low' });
	const halfWidths = smoothPeriodic({
		values: interpolateSamples({ samples, key: 'width' }),
		radius: 8,
	}).map((width) => width / 2);
	const centerRadius = smoothPeriodic({
		values: lows.map((low, bin) => low + (halfWidths[bin] ?? 0)),
		radius: 4,
	});
	process.stdout.write(
		`ring samples ${String(samples.length)}/${String(grommetCenters.length)}\n`,
	);

	const kept: PartBuffers = { positions: [], normals: [] };
	for (let index = 0; index + 2 < frame.positions.length; index += 3) {
		const triangle = frame.positions.slice(index, index + 3);
		const [cx, cy, cz] = triangle.reduce(
			(sum, point) => [
				sum[0] + point[0] / 3,
				sum[1] + point[1] / 3,
				sum[2] + point[2] / 3,
			],
			[0, 0, 0],
		);
		const bin = angleBin({ x: cx, y: cy });
		const radius = Math.hypot(cx, cy);
		const center = centerRadius[bin] ?? 0;
		const half = halfWidths[bin] ?? 0;
		const isInsideTube =
			Math.abs(radius - center) <= half + 0.002 &&
			Math.abs(cz) <= TUBE_HALF_DEPTH + 0.0015;
		if (!isInsideTube || isInJunction({ x: cx, y: cy })) {
			kept.positions.push(...triangle);
			kept.normals.push(...frame.normals.slice(index, index + 3));
		}
	}
	throat.positions.push(...kept.positions);
	throat.normals.push(...kept.normals);
	parts.set('throat', throat);
	const strings = parts.get('strings') ?? { positions: [], normals: [] };
	seatOuterLoops({ loops: outerLoops, centerRadius, halfWidths, strings });
	parts.set('strings', strings);
	parts.set('frame', { positions: [], normals: [] });

	return sweepLoop({
		centerRadius,
		halfWidth: halfWidths,
		halfDepth: TUBE_HALF_DEPTH,
		corner: TUBE_CORNER,
		ringSamples: TUBE_RING,
		groove: TUBE_GROOVE,
	});
};

const buildDocument = ({
	parts,
	tube,
}: {
	parts: Map<ModelPart, PartBuffers>;
	tube: SweepResult;
}): Document => {
	const document = new Document();
	const buffer = document.createBuffer();
	const scene = document.createScene('racket');
	for (const part of PARTS) {
		const data = parts.get(part);
		if (part === 'frame') {
			const tubeAccessor = ({
				array,
				type,
			}: {
				array: number[];
				type: 'VEC2' | 'VEC3' | 'SCALAR';
			}): Accessor =>
				document
					.createAccessor()
					.setType(type)
					.setArray(type === 'SCALAR' ? new Uint32Array(array) : new Float32Array(array))
					.setBuffer(buffer);
			const primitive = document
				.createPrimitive()
				.setAttribute('POSITION', tubeAccessor({ array: tube.positions, type: 'VEC3' }))
				.setAttribute('NORMAL', tubeAccessor({ array: tube.normals, type: 'VEC3' }))
				.setAttribute('TEXCOORD_0', tubeAccessor({ array: tube.uvs, type: 'VEC2' }))
				.setIndices(tubeAccessor({ array: tube.indices, type: 'SCALAR' }))
				.setMaterial(document.createMaterial(part));
			const mesh = document.createMesh(NODE_NAMES[part]).addPrimitive(primitive);
			scene.addChild(
				document
					.createNode(NODE_NAMES[part])
					.setMesh(mesh)
					.setExtras({ loopLength: tube.loopLength, perimeter: tube.perimeter }),
			);
			continue;
		}
		if (!data || data.positions.length === 0) {
			continue;
		}
		const accessor = ({
			array,
			type,
		}: {
			array: number[];
			type: 'VEC2' | 'VEC3';
		}): Accessor =>
			document
				.createAccessor()
				.setType(type)
				.setArray(new Float32Array(array))
				.setBuffer(buffer);
		const primitive = document
			.createPrimitive()
			.setAttribute('POSITION', accessor({ array: data.positions.flat(), type: 'VEC3' }))
			.setAttribute('NORMAL', accessor({ array: data.normals.flat(), type: 'VEC3' }))
			.setAttribute(
				'TEXCOORD_0',
				accessor({
					array: computeUvs({ part, positions: data.positions, normals: data.normals }),
					type: 'VEC2',
				}),
			)
			.setMaterial(document.createMaterial(part));
		const mesh = document.createMesh(NODE_NAMES[part]).addPrimitive(primitive);
		scene.addChild(document.createNode(NODE_NAMES[part]).setMesh(mesh));
	}
	return document;
};

const main = async (): Promise<void> => {
	const { parts, grommetCenters, outerLoops } = await splitSource({ input: INPUT });
	const tube = buildFrameTube({ parts, grommetCenters, outerLoops });
	const document = buildDocument({ parts, tube });
	await MeshoptEncoder.ready;
	await document.transform(
		weld(),
		prune({ keepAttributes: true }),
		reorder({ encoder: MeshoptEncoder }),
	);
	document
		.createExtension(EXTMeshoptCompression)
		.setRequired(true)
		.setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
	await new NodeIO()
		.registerExtensions(ALL_EXTENSIONS)
		.registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
		.write(OUTPUT, document);
	process.stdout.write(
		`${PARTS.map((part) => `${NODE_NAMES[part]}: ${String((parts.get(part)?.positions.length ?? 0) / 3)} tris`).join('\n')}\nwrote ${OUTPUT}\n`,
	);
};

await main();
