import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';

import {
	createHeadOutline,
	DEFAULT_RACKET_DIMENSIONS,
} from '@builder/models/racket-geometry';
import {
	classifyBodyTriangle,
	classifyComponent,
	findComponents,
	getBeamCenters,
	getFrameUv,
	getLoopCenterline,
	getHandleUv,
	getLoopU,
	getPlanarUv,
	readAt,
	SOURCE_CUTS,
	toSceneDirection,
	toScenePosition,
	unwrapSeam,
} from '@builder/models/racket-model-prep';

import type { Bounds, Vec3Tuple } from '@builder/models/racket-model-prep';

const circularDistance = ({ a, b }: { a: number; b: number }): number => {
	const delta = Math.abs((((a - b) % 1) + 1) % 1);
	return Math.min(delta, 1 - delta);
};

describe('racket-model-prep', () => {
	describe('findComponents', () => {
		it('labels vertices that share triangles with the same root', () => {
			const chain = findComponents({ indices: [3, 2, 1, 1, 0, 3], vertexCount: 4 });
			expect(new Set(chain).size).toBe(1);

			const labels = findComponents({
				indices: [0, 1, 2, 2, 3, 4, 5, 6, 7],
				vertexCount: 8,
			});

			expect(new Set([labels[0], labels[1], labels[2], labels[3], labels[4]]).size).toBe(
				1,
			);
			expect(new Set([labels[5], labels[6], labels[7]]).size).toBe(1);
			expect(labels[0]).not.toBe(labels[5]);
		});
	});

	describe('readAt', () => {
		it('returns the value or throws out of range', () => {
			expect(readAt({ list: [4, 5], index: 1 })).toBe(5);
			expect(() => readAt({ list: [4, 5], index: 2 })).toThrow(RangeError);
		});
	});

	describe('classifyComponent', () => {
		it('keeps the body, long or flat pieces are strings, small pieces are grommets', () => {
			const bounds = ({ span, depth }: { span: number; depth: number }): Bounds => ({
				min: [0, -depth, 0] as const,
				max: [span, depth, span] as const,
			});

			expect(
				classifyComponent({ bounds: bounds({ span: 1, depth: 1 }), isBody: true }),
			).toBe('body');
			expect(
				classifyComponent({ bounds: bounds({ span: 0.4, depth: 0.003 }), isBody: false }),
			).toBe('strings');
			expect(
				classifyComponent({
					bounds: bounds({ span: 0.017, depth: 0.001 }),
					isBody: false,
				}),
			).toBe('strings');
			expect(
				classifyComponent({
					bounds: bounds({ span: 0.006, depth: 0.003 }),
					isBody: false,
				}),
			).toBe('grommets');
		});
	});

	describe('classifyBodyTriangle', () => {
		it('cuts the body into cap, handle, throat and frame by height', () => {
			expect(classifyBodyTriangle({ centroidZ: SOURCE_CUTS.buttCapTop / 2 })).toBe(
				'buttCap',
			);
			expect(classifyBodyTriangle({ centroidZ: 0.1 })).toBe('handle');
			expect(classifyBodyTriangle({ centroidZ: 0.3 })).toBe('throat');
			expect(classifyBodyTriangle({ centroidZ: 0.7 })).toBe('frame');
		});
	});

	describe('toScenePosition', () => {
		it('turns the Z-up source into Y-up with the head center at the origin', () => {
			const [x, y, z] = toScenePosition({
				position: [1, 2, 3],
				placement: { scale: 2, headCenterZ: 1 },
			});

			expect([x, y, z]).toEqual([2, 4, -4]);
			expect(toSceneDirection({ direction: [1, 2, 3] })).toEqual([1, 3, -2]);
		});
	});

	describe('getLoopU', () => {
		it('starts at +X and runs counter-clockwise', () => {
			expect(getLoopU({ x: 1, y: 0 })).toBeCloseTo(0);
			expect(getLoopU({ x: 0, y: 1 })).toBeCloseTo(0.25);
			expect(getLoopU({ x: 0, y: -1 })).toBeCloseTo(0.75);
		});
	});

	describe('getFrameUv', () => {
		it('runs u along the loop like the procedural tube frame', () => {
			const dimensions = DEFAULT_RACKET_DIMENSIONS;
			const curve = new CatmullRomCurve3(
				createHeadOutline({ dimensions, segments: 128 }).map(
					(point) => new Vector3(point.x, point.y, 0),
				),
				true,
			);
			const tube = new TubeGeometry(curve, 128, dimensions.frameThickness, 16, true);
			const positions = tube.getAttribute('position');
			const uvs = tube.getAttribute('uv');
			const points: Vec3Tuple[] = Array.from({ length: positions.count }, (_, index) => [
				positions.getX(index),
				positions.getY(index),
				positions.getZ(index),
			]);
			const beamCenters = getBeamCenters({
				points: points.map(([x, y]) => [x, y] as const),
				bins: 128,
			});
			const centerline = getLoopCenterline({ beamCenters });

			let worstU = 0;
			points.forEach((position, index) => {
				const [u] = getFrameUv({ position, centerline });
				worstU = Math.max(worstU, circularDistance({ a: u, b: uvs.getX(index) }));
			});

			expect(worstU).toBeLessThan(0.025);
			tube.dispose();
		});

		it('puts the front at v 0, inside at 0.25, back at 0.5 and outside at 0.75', () => {
			const centerline = getLoopCenterline({
				beamCenters: new Float64Array(64).fill(1),
			});
			const vAt = ({ position }: { position: Vec3Tuple }): number =>
				getFrameUv({ position, centerline })[1];

			expect(circularDistance({ a: vAt({ position: [1, 0, 0.1] }), b: 0 })).toBeLessThan(
				1e-6,
			);
			expect(vAt({ position: [0.9, 0, 0] })).toBeCloseTo(0.25);
			expect(vAt({ position: [1, 0, -0.1] })).toBeCloseTo(0.5);
			expect(vAt({ position: [0, 1.1, 0] })).toBeCloseTo(0.75);
		});
	});

	describe('getBeamCenters', () => {
		it('fills empty bins from neighbours', () => {
			const centers = getBeamCenters({
				points: [
					[1, 0],
					[2, 0],
				],
				bins: 8,
			});

			expect([...centers]).toEqual(new Array(8).fill(1.5));
		});
	});

	describe('getHandleUv', () => {
		it('wraps u around the handle and runs v from bottom to top', () => {
			expect(getHandleUv({ position: [0, 1, 1], bottomY: 1, topY: 3 })).toEqual([0, 0]);
			const [u, v] = getHandleUv({ position: [1, 3, 0], bottomY: 1, topY: 3 });
			expect(u).toBeCloseTo(0.25);
			expect(v).toBe(1);
		});
	});

	describe('getPlanarUv', () => {
		it('maps x and y inside the bounds to 0..1', () => {
			expect(
				getPlanarUv({
					position: [1, 3, 0],
					bounds: { min: [0, 2, 0], max: [2, 4, 0] },
				}),
			).toEqual([0.5, 0.5]);
		});
	});

	describe('unwrapSeam', () => {
		it('lifts low values past 1 when a triangle crosses the seam', () => {
			expect(unwrapSeam({ values: [0.98, 0.01, 0.99] })).toEqual([0.98, 1.01, 0.99]);
			expect(unwrapSeam({ values: [0.2, 0.3, 0.25] })).toEqual([0.2, 0.3, 0.25]);
		});
	});
});
