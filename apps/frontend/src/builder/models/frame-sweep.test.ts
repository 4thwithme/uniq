import {
	buildRoundedProfile,
	fillPeriodicGaps,
	getProfilePerimeter,
	smoothPeriodic,
	sweepLoop,
} from '@builder/models/frame-sweep';

describe('frame sweep', () => {
	it('fills gaps between valid samples around the loop', () => {
		expect(
			fillPeriodicGaps({ values: [1, 0, 3, 0], isValid: [true, false, true, false] }),
		).toEqual([1, 2, 3, 2]);
		expect(fillPeriodicGaps({ values: [5, 6], isValid: [false, false] })).toEqual([5, 6]);
		expect(smoothPeriodic({ values: [0, 3, 0], radius: 1 })).toEqual([1, 1, 1]);
	});

	it('walks the profile front, inside, back, outside with outward normals', () => {
		const profile = buildRoundedProfile({
			halfWidth: 1,
			halfDepth: 2,
			corner: 0.5,
			samples: 8,
		});
		expect(profile[0]).toMatchObject({ radial: 0, depth: 2, normalDepth: 1, v: 0 });
		expect(profile[2]).toMatchObject({ radial: -1, normalRadial: -1 });
		expect(profile[4]?.depth).toBeCloseTo(-2);
		expect(profile[6]).toMatchObject({ radial: 1, normalRadial: 1 });
		expect(profile[8]?.v).toBe(1);
		profile.forEach((point) => {
			expect(Math.hypot(point.normalRadial, point.normalDepth)).toBeCloseTo(1);
		});
	});

	it('cuts a groove into the outer side and counts its walls in the perimeter', () => {
		const groove = { halfWidth: 0.5, depth: 0.3 };
		const profile = buildRoundedProfile({
			halfWidth: 1,
			halfDepth: 2,
			corner: 0.5,
			samples: 64,
			groove,
		});
		const outside = profile.find((point) => Math.abs(point.v - 0.75) < 0.01);
		expect(outside?.radial).toBeCloseTo(0.7);
		expect(
			getProfilePerimeter({ halfWidth: 1, halfDepth: 2, corner: 0.5, groove }),
		).toBeCloseTo(getProfilePerimeter({ halfWidth: 1, halfDepth: 2, corner: 0.5 }) + 0.6);
	});

	it('sweeps a closed ring with a duplicate seam and outward-facing triangles', () => {
		const bins = 32;
		const result = sweepLoop({
			centerRadius: new Array<number>(bins).fill(1),
			halfWidth: new Array<number>(bins).fill(0.05),
			halfDepth: 0.1,
			corner: 0.02,
			ringSamples: 8,
		});
		expect(result.positions.length / 3).toBe((bins + 1) * 9);
		expect(result.indices.length).toBe(bins * 8 * 6);
		expect(result.loopLength).toBeCloseTo(Math.PI * 2, 1);
		expect(result.uvs.at(-2)).toBe(1);
		const [a = 0, b = 0, c = 0] = result.indices;
		const at = (index: number): number[] =>
			result.positions.slice(index * 3, index * 3 + 3);
		const [ax = 0, ay = 0, az = 0] = at(a);
		const [bx = 0, by = 0, bz = 0] = at(b);
		const [cx = 0, cy = 0, cz = 0] = at(c);
		const normal = [
			(by - ay) * (cz - az) - (bz - az) * (cy - ay),
			(bz - az) * (cx - ax) - (bx - ax) * (cz - az),
			(bx - ax) * (cy - ay) - (by - ay) * (cx - ax),
		];
		const vertex = result.normals.slice(a * 3, a * 3 + 3);
		const dot = normal.reduce(
			(sum, value, index) => sum + value * (vertex[index] ?? 0),
			0,
		);
		expect(dot).toBeGreaterThan(0);
		expect(result.perimeter).toBeGreaterThan(0);
	});
});

describe('frame sweep edge cases', () => {
	it('handles square corners and sizes the tube and shaft canvases', async () => {
		const profile = buildRoundedProfile({
			halfWidth: 1,
			halfDepth: 1,
			corner: 0,
			samples: 4,
		});
		expect(profile).toHaveLength(5);
		const { getTubeSurfaceSize, getShaftSurfaceSize, getPixelsPerMeter } =
			await import('@builder/decor/frame-faces');
		expect(
			getTubeSurfaceSize({ metrics: { loopLength: 1, perimeter: 0.1 }, width: 1000 }),
		).toEqual({
			width: 1000,
			height: 100,
		});
		expect(getTubeSurfaceSize({ metrics: { loopLength: 1, perimeter: 0 } }).height).toBe(
			16,
		);
		expect(getShaftSurfaceSize({ length: 0.1, width: 0.05, pixels: 1000 })).toEqual({
			width: 100,
			height: 100,
		});
		expect(getPixelsPerMeter({ width: 100 })).toBeGreaterThan(0);
	});
});
