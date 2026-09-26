import { LINE_PATTERN_IDS, SHAPE_KINDS } from '@uniq/shared';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';

import {
	FRAME_BACK_V,
	FRAME_BANDS,
	FRAME_FRONT_V,
	getEllipsePerimeter,
	getFrameSurfaceSize,
} from '@builder/decor/frame-faces';
import { getGradientEndpointsForRect } from '@builder/decor/gradient-endpoints';
import {
	getLinePatternPolylines,
	getLineSpacing,
	LINE_PATTERN_LABELS,
	toSvgPoints,
} from '@builder/decor/line-patterns';
import {
	getNextShapeU,
	getShapeDefinition,
	SHAPE_CATEGORIES,
	SHAPE_DEFINITIONS,
} from '@builder/decor/shape-paths';
import {
	createHeadOutline,
	DEFAULT_RACKET_DIMENSIONS,
} from '@builder/models/racket-geometry';

describe('line patterns', () => {
	it.each(LINE_PATTERN_IDS)('builds polylines for %s', (patternId) => {
		const polylines = getLinePatternPolylines({
			patternId,
			width: 400,
			height: 100,
			density: 10,
		});

		expect(polylines.length).toBeGreaterThan(0);
		polylines.forEach((polyline) => {
			expect(polyline.length).toBeGreaterThanOrEqual(2);
		});
		expect(LINE_PATTERN_LABELS[patternId]).not.toBe('');
	});

	it('spaces lines by density and formats svg points', () => {
		expect(getLineSpacing({ height: 100, density: 10 })).toBe(40);
		expect(
			toSvgPoints({
				polyline: [
					[1, 2],
					[3, 4],
				],
			}),
		).toBe('1,2 3,4');
	});

	it('draws a grid with vertical and horizontal lines', () => {
		const polylines = getLinePatternPolylines({
			patternId: 'grid',
			width: 80,
			height: 40,
			density: 8,
		});
		const vertical = polylines.filter(([start, end]) => start?.[0] === end?.[0]);
		const horizontal = polylines.filter(([start, end]) => start?.[1] === end?.[1]);

		expect(vertical.length).toBeGreaterThan(0);
		expect(horizontal.length).toBeGreaterThan(0);
	});

	it('alternates zigzag points', () => {
		const [first] = getLinePatternPolylines({
			patternId: 'zigzag',
			width: 80,
			height: 40,
			density: 8,
		});

		expect(first?.[0]?.[1]).not.toBe(first?.[1]?.[1]);
	});
});

describe('shape paths', () => {
	it('has a path and label for every shape', () => {
		SHAPE_KINDS.forEach((shape) => {
			const definition = getShapeDefinition({ shape });
			expect(definition.id).toBe(shape);
			expect(definition.d).toMatch(/^M/u);
			expect(definition.label).not.toBe('');
		});
		expect(SHAPE_DEFINITIONS.map((item) => item.id).sort()).toEqual(
			[...SHAPE_KINDS].sort(),
		);
	});

	it('groups the collection into categories with library shapes on a 512 box', () => {
		SHAPE_CATEGORIES.forEach((category) => {
			expect(SHAPE_DEFINITIONS.some((item) => item.category === category.id)).toBe(true);
		});
		expect(getShapeDefinition({ shape: 'tiger-head' })).toMatchObject({
			category: 'creatures',
			box: 512,
		});
		expect(getShapeDefinition({ shape: 'circle' }).box).toBe(100);
		expect(getShapeDefinition({ shape: 'x' as never }).label).toBe('Circle');
	});

	it('spreads new shapes along the frame and wraps', () => {
		expect(getNextShapeU({ count: 0 })).toBe(0.35);
		expect(getNextShapeU({ count: 1 })).toBe(0.44);
		expect(getNextShapeU({ count: 10 })).toBeCloseTo(0.25);
	});
});

describe('gradient endpoints', () => {
	it('runs along the width at 0° and along the height at 90°', () => {
		expect(getGradientEndpointsForRect({ angle: 0, width: 200, height: 20 })).toEqual([
			0, 10, 200, 10,
		]);
		const [x0, y0, x1, y1] = getGradientEndpointsForRect({
			angle: 90,
			width: 200,
			height: 20,
		});
		expect(x0).toBeCloseTo(100);
		expect(x1).toBeCloseTo(100);
		expect(y0).toBeCloseTo(0);
		expect(y1).toBeCloseTo(20);
	});
});

describe('frame faces', () => {
	it('sizes the surface to the loop length over the tube circumference', () => {
		const { width, height } = getFrameSurfaceSize({});
		const perimeter = getEllipsePerimeter({
			a: DEFAULT_RACKET_DIMENSIONS.headWidth / 2,
			b: DEFAULT_RACKET_DIMENSIONS.headHeight / 2,
		});
		const circumference = 2 * Math.PI * DEFAULT_RACKET_DIMENSIONS.frameThickness;

		expect(width).toBe(2048);
		expect(width / height).toBeCloseTo(perimeter / circumference, 0);
		expect(getFrameSurfaceSize({ width: 16 }).height).toBe(16);
		expect(FRAME_BANDS.map((band) => band.centerV)).toEqual([
			FRAME_FRONT_V,
			FRAME_BACK_V,
		]);
	});

	it('matches the real tube geometry: front faces +z at v=0, back at v=0.5', () => {
		const radial = 16;
		const tubular = 128;
		const outline = createHeadOutline({
			dimensions: DEFAULT_RACKET_DIMENSIONS,
			segments: 128,
		});
		const curve = new CatmullRomCurve3(
			outline.map((point) => new Vector3(point.x, point.y, 0)),
			true,
		);
		const geometry = new TubeGeometry(
			curve,
			tubular,
			DEFAULT_RACKET_DIMENSIONS.frameThickness,
			radial,
			true,
		);
		const normal = geometry.getAttribute('normal');
		const uv = geometry.getAttribute('uv');

		[0, 20, 64, 100].forEach((ring) => {
			let front = { z: -2, v: -1 };
			let back = { z: 2, v: -1 };
			for (let j = 0; j <= radial; j += 1) {
				const index = ring * (radial + 1) + j;
				const z = normal.getZ(index);
				if (z > front.z) {
					front = { z, v: uv.getY(index) };
				}
				if (z < back.z) {
					back = { z, v: uv.getY(index) };
				}
			}
			expect(Math.min(front.v, 1 - front.v)).toBeCloseTo(FRAME_FRONT_V, 1);
			expect(back.v).toBeCloseTo(FRAME_BACK_V, 1);
		});
		geometry.dispose();
	});
});
