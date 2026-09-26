import {
	createHeadOutline,
	DEFAULT_RACKET_DIMENSIONS,
	getHandleOffsetY,
} from '@builder/models/racket-geometry';

describe('racket-geometry', () => {
	describe('createHeadOutline', () => {
		it('returns a closed ellipse with segments + 1 points inside the head bounds', () => {
			const points = createHeadOutline({
				dimensions: DEFAULT_RACKET_DIMENSIONS,
				segments: 64,
			});

			expect(points).toHaveLength(65);
			for (const point of points) {
				expect(Math.abs(point.x)).toBeLessThanOrEqual(
					DEFAULT_RACKET_DIMENSIONS.headWidth / 2 + 1e-9,
				);
				expect(Math.abs(point.y)).toBeLessThanOrEqual(
					DEFAULT_RACKET_DIMENSIONS.headHeight / 2 + 1e-9,
				);
			}
			expect(points[0]?.distanceTo(points[64] ?? points[0])).toBeLessThan(1e-9);
		});

		it.each([4, 7.5])('throws for invalid segments %s', (segments) => {
			expect(() =>
				createHeadOutline({ dimensions: DEFAULT_RACKET_DIMENSIONS, segments }),
			).toThrow(RangeError);
		});
	});

	describe('getHandleOffsetY', () => {
		it('places the handle centre below the head and throat', () => {
			expect(getHandleOffsetY({ dimensions: DEFAULT_RACKET_DIMENSIONS })).toBeCloseTo(
				-0.385,
			);
		});
	});
});
