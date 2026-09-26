import { Box3, CylinderGeometry, Mesh } from 'three';

import {
	clipTriangleAbove,
	createFinishingTapeGeometry,
	createGripWrapGeometry,
	FINISHING_TAPE_THICKNESS,
	FINISHING_TAPE_WIDTH,
	sliceGeometryAbove,
	findBoundaryEdges,
	getGripThickness,
	GRIP_WRAP_THICKNESS,
	OVERGRIP_WRAP_THICKNESS,
} from '@builder/grips/grip-wrap';

import type { GripSpec } from '@uniq/shared';

const handle = (): CylinderGeometry => new CylinderGeometry(0.02, 0.02, 0.2, 8, 1, true);

const GRIP: GripSpec = {
	material: 'synthetic',
	colorId: 'black',
	customHex: null,
	texture: 'smooth',
	finish: 'matte',
	overgrip: null,
};

describe('grip wrap', () => {
	it('adds overgrip thickness on top of the base grip', () => {
		expect(getGripThickness({ grip: GRIP })).toBe(GRIP_WRAP_THICKNESS);
		expect(
			getGripThickness({
				grip: {
					...GRIP,
					overgrip: { colorId: 'white', material: 'dry', texture: 'smooth' },
				},
			}),
		).toBeCloseTo(GRIP_WRAP_THICKNESS + OVERGRIP_WRAP_THICKNESS);
	});

	it('finds only the open top and bottom rings as boundary edges', () => {
		const flat = handle().toNonIndexed();
		const position = flat.getAttribute('position');
		const edges = findBoundaryEdges({
			positions: position.array,
			indices: Array.from({ length: position.count }, (_, index) => index),
		});

		expect(edges).toHaveLength(16);
		edges.forEach(([start]) => {
			expect(Math.abs(position.getY(start))).toBeCloseTo(0.1);
		});
	});

	it('grows the handle outward and closes both ends with a step ring', () => {
		const source = handle();
		const sourceBox = new Box3().setFromObject(new Mesh(source));
		const wrap = createGripWrapGeometry({ geometry: source, thickness: 0.002 });
		const box = new Box3().setFromObject(new Mesh(wrap));
		const normal = wrap.getAttribute('normal');
		const sideCount = source.toNonIndexed().getAttribute('position').count;

		expect(box.max.x).toBeCloseTo(sourceBox.max.x + 0.002);
		expect(box.max.z).toBeCloseTo(sourceBox.max.z + 0.002);
		expect(box.max.y).toBeCloseTo(sourceBox.max.y);
		expect(wrap.getAttribute('position').count).toBe(sideCount + 16 * 6);
		expect(wrap.getAttribute('uv').count).toBe(wrap.getAttribute('position').count);

		const ringNormals = Array.from({ length: normal.count - sideCount }, (_, index) =>
			normal.getY(sideCount + index),
		);
		expect(ringNormals.filter((y) => y === 1)).toHaveLength(48);
		expect(ringNormals.filter((y) => y === -1)).toHaveLength(48);
	});

	it('winds the step rings to face up on top and down at the bottom', () => {
		const wrap = createGripWrapGeometry({ geometry: handle(), thickness: 0.002 });
		const position = wrap.getAttribute('position');
		const start = handle().toNonIndexed().getAttribute('position').count;

		for (let index = start; index + 2 < position.count; index += 3) {
			const ux = position.getX(index + 1) - position.getX(index);
			const uz = position.getZ(index + 1) - position.getZ(index);
			const vx = position.getX(index + 2) - position.getX(index);
			const vz = position.getZ(index + 2) - position.getZ(index);
			const up = uz * vx - ux * vz;
			expect(Math.sign(up)).toBe(Math.sign(position.getY(index)));
		}
	});

	it('keeps a non-indexed source untouched', () => {
		const source = handle().toNonIndexed();
		const dispose = vi.spyOn(source, 'dispose');
		createGripWrapGeometry({ geometry: source, thickness: 0.001 });

		expect(dispose).not.toHaveBeenCalled();
	});

	it('clips triangles against a height and keeps what is above', () => {
		const vertex = (
			y: number,
		): { position: number[]; normal: number[]; uv: number[] } => ({
			position: [0, y, y],
			normal: [0, 0, 1],
			uv: [0, y],
		});
		const below = [vertex(0), vertex(0.1), vertex(0.2)];

		expect(clipTriangleAbove({ triangle: below, minY: 1 })).toEqual([]);
		expect(clipTriangleAbove({ triangle: below, minY: -1 })).toHaveLength(1);
		const oneAbove = clipTriangleAbove({
			triangle: [vertex(0), vertex(1), vertex(0)],
			minY: 0.5,
		});
		expect(oneAbove).toHaveLength(1);
		oneAbove[0]?.forEach((corner) => {
			expect(corner.position[1]).toBeGreaterThanOrEqual(0.5);
		});
		const twoAbove = clipTriangleAbove({
			triangle: [vertex(1), vertex(1), vertex(0)],
			minY: 0.5,
		});
		expect(twoAbove).toHaveLength(2);
		expect(twoAbove.flat().some((corner) => corner.uv[1] === 0.5)).toBe(true);
	});

	it('slices a handle to a band at the top', () => {
		const band = sliceGeometryAbove({ geometry: handle(), minY: 0.05 });
		const box = new Box3().setFromObject(new Mesh(band));

		expect(box.min.y).toBeCloseTo(0.05);
		expect(box.max.y).toBeCloseTo(0.1);
		expect(
			sliceGeometryAbove({ geometry: handle().toNonIndexed(), minY: 0.2 }).getAttribute(
				'position',
			).count,
		).toBe(0);
	});

	it('wraps the finishing tape over the top of the grip', () => {
		const tape = createFinishingTapeGeometry({
			geometry: handle(),
			gripThickness: 0.002,
		});
		const box = new Box3().setFromObject(new Mesh(tape));

		expect(box.max.y).toBeCloseTo(0.1);
		expect(box.min.y).toBeCloseTo(0.1 - FINISHING_TAPE_WIDTH);
		expect(box.max.x).toBeCloseTo(0.02 + 0.002 + FINISHING_TAPE_THICKNESS);
	});
});
