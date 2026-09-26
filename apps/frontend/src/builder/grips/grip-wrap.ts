import { Box3, BufferGeometry, Float32BufferAttribute, Mesh } from 'three';

import { readAt } from '@builder/models/racket-model-prep';

import type { GripSpec } from '@uniq/shared';

export const GRIP_WRAP_THICKNESS = 0.0015;
export const OVERGRIP_WRAP_THICKNESS = 0.0006;
export const FINISHING_TAPE_THICKNESS = 0.0005;
export const FINISHING_TAPE_WIDTH = 0.018;

const KEY_PRECISION = 1e5;

export const getGripThickness = ({ grip }: { grip: GripSpec }): number =>
	GRIP_WRAP_THICKNESS + (grip.overgrip === null ? 0 : OVERGRIP_WRAP_THICKNESS);

const positionKey = ({
	positions,
	index,
}: {
	positions: ArrayLike<number>;
	index: number;
}): string =>
	[0, 1, 2]
		.map((axis) =>
			Math.round(readAt({ list: positions, index: index * 3 + axis }) * KEY_PRECISION),
		)
		.join(',');

export const findBoundaryEdges = ({
	positions,
	indices,
}: {
	positions: ArrayLike<number>;
	indices: ArrayLike<number>;
}): (readonly [number, number])[] => {
	const edges = new Map<string, { count: number; edge: readonly [number, number] }>();
	for (let index = 0; index + 2 < indices.length; index += 3) {
		const corners = [0, 1, 2].map((corner) =>
			readAt({ list: indices, index: index + corner }),
		);
		corners.forEach((start, corner) => {
			const end = readAt({ list: corners, index: (corner + 1) % 3 });
			const a = positionKey({ positions, index: start });
			const b = positionKey({ positions, index: end });
			const key = a < b ? `${a}|${b}` : `${b}|${a}`;
			const entry = edges.get(key);
			edges.set(key, { count: (entry?.count ?? 0) + 1, edge: [start, end] });
		});
	}
	return [...edges.values()]
		.filter((entry) => entry.count === 1)
		.map((entry) => entry.edge);
};

export const createGripWrapGeometry = ({
	geometry,
	thickness,
}: {
	geometry: BufferGeometry;
	thickness: number;
}): BufferGeometry => {
	const source = geometry.index === null ? geometry : geometry.toNonIndexed();
	const position = source.getAttribute('position');
	const normal = source.getAttribute('normal');
	const uv = source.getAttribute('uv');
	const inner = Array.from(position.array);
	const indices = Array.from({ length: position.count }, (_, index) => index);
	const box = new Box3().setFromObject(new Mesh(source));
	const halfX = Math.max(Math.abs(box.min.x), Math.abs(box.max.x));
	const halfZ = Math.max(Math.abs(box.min.z), Math.abs(box.max.z));
	const scaleX = (halfX + thickness) / halfX;
	const scaleZ = (halfZ + thickness) / halfZ;
	const middleY = (box.min.y + box.max.y) / 2;

	const outer = inner.map((value, index) => {
		const axis = index % 3;
		if (axis === 0) {
			return value * scaleX;
		}
		return axis === 2 ? value * scaleZ : value;
	});
	const positions = [...outer];
	const normals = Array.from(normal.array);
	const uvs = Array.from(uv.array);

	for (const [start, end] of findBoundaryEdges({ positions: inner, indices })) {
		const point = ({
			list,
			index,
		}: {
			list: number[];
			index: number;
		}): [number, number, number] => [
			readAt({ list, index: index * 3 }),
			readAt({ list, index: index * 3 + 1 }),
			readAt({ list, index: index * 3 + 2 }),
		];
		const a = point({ list: outer, index: start });
		const b = point({ list: outer, index: end });
		const innerA = point({ list: inner, index: start });
		const innerB = point({ list: inner, index: end });
		const isTop = a[1] > middleY;
		const facesUp =
			(innerA[2] - a[2]) * (b[0] - a[0]) - (innerA[0] - a[0]) * (b[2] - a[2]) > 0;
		const ordered =
			facesUp === isTop
				? [a, innerA, b, b, innerA, innerB]
				: [a, b, innerA, b, innerB, innerA];
		const v = isTop ? 1 : 0;
		for (const corner of ordered) {
			positions.push(...corner);
			normals.push(0, isTop ? 1 : -1, 0);
			uvs.push(0, v);
		}
	}

	const wrap = new BufferGeometry();
	wrap.setAttribute('position', new Float32BufferAttribute(positions, 3));
	wrap.setAttribute('normal', new Float32BufferAttribute(normals, 3));
	wrap.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
	if (source !== geometry) {
		source.dispose();
	}
	return wrap;
};

interface SliceVertex {
	position: readonly number[];
	normal: readonly number[];
	uv: readonly number[];
}

const lerpVertex = ({
	from,
	to,
	t,
}: {
	from: SliceVertex;
	to: SliceVertex;
	t: number;
}): SliceVertex => {
	const mix = ({ a, b }: { a: readonly number[]; b: readonly number[] }): number[] =>
		a.map((value, index) => value + (readAt({ list: b, index }) - value) * t);
	return {
		position: mix({ a: from.position, b: to.position }),
		normal: mix({ a: from.normal, b: to.normal }),
		uv: mix({ a: from.uv, b: to.uv }),
	};
};

export const clipTriangleAbove = ({
	triangle,
	minY,
}: {
	triangle: readonly SliceVertex[];
	minY: number;
}): SliceVertex[][] => {
	const polygon: SliceVertex[] = [];
	triangle.forEach((current, index) => {
		const next = readAt({ list: triangle, index: (index + 1) % triangle.length });
		const currentY = readAt({ list: current.position, index: 1 });
		const nextY = readAt({ list: next.position, index: 1 });
		const isInside = currentY >= minY;
		if (isInside) {
			polygon.push(current);
		}
		if (isInside !== nextY >= minY) {
			polygon.push(
				lerpVertex({
					from: current,
					to: next,
					t: (minY - currentY) / (nextY - currentY),
				}),
			);
		}
	});
	const [first] = polygon;
	if (first === undefined) {
		return [];
	}
	return polygon
		.slice(1, -1)
		.map((vertex, index) => [first, vertex, readAt({ list: polygon, index: index + 2 })]);
};

export const sliceGeometryAbove = ({
	geometry,
	minY,
}: {
	geometry: BufferGeometry;
	minY: number;
}): BufferGeometry => {
	const source = geometry.index === null ? geometry : geometry.toNonIndexed();
	const position = source.getAttribute('position');
	const normal = source.getAttribute('normal');
	const uv = source.getAttribute('uv');
	const vertexAt = ({ index }: { index: number }): SliceVertex => ({
		position: [position.getX(index), position.getY(index), position.getZ(index)],
		normal: [normal.getX(index), normal.getY(index), normal.getZ(index)],
		uv: [uv.getX(index), uv.getY(index)],
	});
	const positions: number[] = [];
	const normals: number[] = [];
	const uvs: number[] = [];

	for (let index = 0; index + 2 < position.count; index += 3) {
		const triangle = [0, 1, 2].map((corner) => vertexAt({ index: index + corner }));
		for (const clipped of clipTriangleAbove({ triangle, minY })) {
			for (const vertex of clipped) {
				positions.push(...vertex.position);
				normals.push(...vertex.normal);
				uvs.push(...vertex.uv);
			}
		}
	}

	const slice = new BufferGeometry();
	slice.setAttribute('position', new Float32BufferAttribute(positions, 3));
	slice.setAttribute('normal', new Float32BufferAttribute(normals, 3));
	slice.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
	if (source !== geometry) {
		source.dispose();
	}
	return slice;
};

export const createFinishingTapeGeometry = ({
	geometry,
	gripThickness,
}: {
	geometry: BufferGeometry;
	gripThickness: number;
}): BufferGeometry => {
	const top = new Box3().setFromObject(new Mesh(geometry)).max.y;
	const band = sliceGeometryAbove({ geometry, minY: top - FINISHING_TAPE_WIDTH });
	const tape = createGripWrapGeometry({
		geometry: band,
		thickness: gripThickness + FINISHING_TAPE_THICKNESS,
	});
	band.dispose();
	return tape;
};
