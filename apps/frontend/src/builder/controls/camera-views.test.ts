import {
	CAMERA_VIEWS,
	easeOutCubic,
	interpolateView,
} from '@builder/controls/camera-views';
import {
	DEFAULT_RACKET_DIMENSIONS,
	getHandleOffsetY,
} from '@builder/models/racket-geometry';

describe('camera views', () => {
	it('aims the grip view at the center of the handle', () => {
		const handleY = getHandleOffsetY({ dimensions: DEFAULT_RACKET_DIMENSIONS });

		expect(CAMERA_VIEWS.grip.target).toEqual([0, handleY, 0]);
		expect(CAMERA_VIEWS.grip.position[2]).toBeLessThan(CAMERA_VIEWS.overview.position[2]);
	});

	it('aims the butt cap view at the bottom of the handle from below', () => {
		const bottomY =
			getHandleOffsetY({ dimensions: DEFAULT_RACKET_DIMENSIONS }) -
			DEFAULT_RACKET_DIMENSIONS.handleLength / 2;

		expect(Math.abs(CAMERA_VIEWS.buttCap.target[1] - bottomY)).toBeLessThan(0.02);
		expect(CAMERA_VIEWS.buttCap.position[1]).toBeLessThan(CAMERA_VIEWS.buttCap.target[1]);
	});

	it('eases out and interpolates, clamping progress', () => {
		expect(easeOutCubic({ t: 0 })).toBe(0);
		expect(easeOutCubic({ t: 1 })).toBe(1);
		expect(easeOutCubic({ t: 0.5 })).toBeGreaterThan(0.5);

		const from = CAMERA_VIEWS.overview;
		const to = CAMERA_VIEWS.grip;
		expect(interpolateView({ from, to, progress: -1 })).toEqual(from);
		const end = interpolateView({ from, to, progress: 2 });
		end.position.forEach((value, index) => {
			expect(value).toBeCloseTo(to.position[index] ?? 0);
		});
		end.target.forEach((value, index) => {
			expect(value).toBeCloseTo(to.target[index] ?? 0);
		});
		const middle = interpolateView({ from, to, progress: 0.5 });
		expect(middle.target[1]).toBeLessThan(from.target[1]);
		expect(middle.target[1]).toBeGreaterThan(to.target[1]);
	});
});
