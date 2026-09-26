import { createDefaultDesign } from '@builder/design/default-design';
import {
	addGradientStopCommand,
	removeGradientStopCommand,
	setGradientAngleCommand,
	setGradientStopCommand,
	setGripCommand,
	setZoneFillCommand,
	setZoneFinishCommand,
	toGradientFill,
	toSolidFill,
} from '@builder/design/design-commands';

import type { DesignDocument, GradientFill } from '@uniq/shared';

const gradientDesign = ({ stops }: { stops: GradientFill['stops'] }): DesignDocument => {
	const document = createDefaultDesign();
	return {
		...document,
		zones: {
			...document.zones,
			frame: { ...document.zones.frame, fill: { kind: 'gradient', angle: 45, stops } },
		},
	};
};

const getFrameGradient = ({ document }: { document: DesignDocument }): GradientFill => {
	const { fill } = document.zones.frame;
	if (fill.kind !== 'gradient') {
		throw new Error('expected gradient');
	}
	return fill;
};

describe('design-commands', () => {
	describe('toGradientFill / toSolidFill', () => {
		it('converts a solid fill to a two-stop gradient and back', () => {
			const gradient = toGradientFill({ fill: { kind: 'solid', color: '#123456' } });

			expect(gradient).toEqual({
				kind: 'gradient',
				angle: 0,
				stops: [
					{ offset: 0, color: '#123456' },
					{ offset: 1, color: '#ffffff' },
				],
			});
			expect(toSolidFill({ fill: gradient })).toEqual({
				kind: 'solid',
				color: '#123456',
			});
		});

		it('returns the same fill when it already has the target kind', () => {
			const solid = { kind: 'solid', color: '#000000' } as const;
			const gradient = toGradientFill({ fill: solid });

			expect(toSolidFill({ fill: solid })).toBe(solid);
			expect(toGradientFill({ fill: gradient })).toBe(gradient);
		});

		it('falls back to white for a gradient without stops', () => {
			expect(toSolidFill({ fill: { kind: 'gradient', angle: 0, stops: [] } })).toEqual({
				kind: 'solid',
				color: '#ffffff',
			});
		});
	});

	it('sets a zone fill and clears the active theme', () => {
		const document = { ...createDefaultDesign(), meta: { name: 'x', themeId: 'volt' } };
		const command = setZoneFillCommand({
			zoneId: 'throat',
			fill: { kind: 'solid', color: '#ff0000' },
			mergeKey: 'k',
		});

		const next = command.apply({ document });

		expect(next.zones.throat.fill).toEqual({ kind: 'solid', color: '#ff0000' });
		expect(next.zones.frame).toBe(document.zones.frame);
		expect(next.meta.themeId).toBeNull();
		expect(command.mergeKey).toBe('k');
		expect(
			setZoneFillCommand({ zoneId: 'frame', fill: { kind: 'solid', color: '#000000' } })
				.mergeKey,
		).toBeNull();
	});

	it('sets a zone finish', () => {
		const next = setZoneFinishCommand({ zoneId: 'frame', finish: 'pearl' }).apply({
			document: createDefaultDesign(),
		});

		expect(next.zones.frame.finish).toBe('pearl');
	});

	describe('gradient stops', () => {
		const stops = [
			{ offset: 0, color: '#000000' },
			{ offset: 1, color: '#ffffff' },
		];

		it('updates color and clamps the offset of one stop', () => {
			const document = gradientDesign({ stops });

			const colored = setGradientStopCommand({
				zoneId: 'frame',
				index: 0,
				color: '#ff0000',
			}).apply({ document });
			const moved = setGradientStopCommand({
				zoneId: 'frame',
				index: 1,
				offset: 1.7,
			}).apply({ document });
			const movedLow = setGradientStopCommand({
				zoneId: 'frame',
				index: 1,
				offset: -3,
			}).apply({ document });

			expect(getFrameGradient({ document: colored }).stops).toEqual([
				{ offset: 0, color: '#ff0000' },
				{ offset: 1, color: '#ffffff' },
			]);
			expect(getFrameGradient({ document: moved }).stops[1]).toEqual({
				offset: 1,
				color: '#ffffff',
			});
			expect(getFrameGradient({ document: movedLow }).stops[1]).toEqual({
				offset: 0,
				color: '#ffffff',
			});
		});

		it('turns a solid zone into a gradient when a stop is edited', () => {
			const next = setGradientStopCommand({
				zoneId: 'throat',
				index: 1,
				color: '#00ff00',
			}).apply({
				document: createDefaultDesign(),
			});

			expect(next.zones.throat.fill).toEqual({
				kind: 'gradient',
				angle: 0,
				stops: [
					{ offset: 0, color: '#c6ff3d' },
					{ offset: 1, color: '#00ff00' },
				],
			});
		});

		it('adds a middle stop up to the maximum', () => {
			let document = gradientDesign({ stops });
			document = addGradientStopCommand({ zoneId: 'frame' }).apply({ document });

			expect(getFrameGradient({ document }).stops.map((stop) => stop.offset)).toEqual([
				0, 0.5, 1,
			]);

			document = addGradientStopCommand({ zoneId: 'frame' }).apply({ document });
			const atMax = addGradientStopCommand({ zoneId: 'frame' }).apply({ document });

			expect(getFrameGradient({ document: atMax }).stops).toHaveLength(4);
			expect(atMax.zones.frame).toBe(document.zones.frame);
		});

		it('adds a white stop when the gradient has no stops', () => {
			const next = addGradientStopCommand({ zoneId: 'frame' }).apply({
				document: gradientDesign({ stops: [] }),
			});

			expect(getFrameGradient({ document: next }).stops).toEqual([
				{ offset: 0.5, color: '#ffffff' },
			]);
		});

		it('removes a stop but keeps the minimum', () => {
			const document = gradientDesign({
				stops: [...stops, { offset: 0.5, color: '#888888' }],
			});

			const removed = removeGradientStopCommand({ zoneId: 'frame', index: 2 }).apply({
				document,
			});
			const atMin = removeGradientStopCommand({ zoneId: 'frame', index: 0 }).apply({
				document: removed,
			});

			expect(getFrameGradient({ document: removed }).stops).toEqual(stops);
			expect(atMin.zones.frame).toBe(removed.zones.frame);
		});

		it('normalizes the gradient angle to 0-359', () => {
			const document = gradientDesign({ stops });

			expect(
				getFrameGradient({
					document: setGradientAngleCommand({ zoneId: 'frame', angle: 370 }).apply({
						document,
					}),
				}).angle,
			).toBe(10);
			expect(
				getFrameGradient({
					document: setGradientAngleCommand({ zoneId: 'frame', angle: -90 }).apply({
						document,
					}),
				}).angle,
			).toBe(270);
		});
	});

	it('sets the grip, clears the theme and ignores an identical grip', () => {
		const document = { ...createDefaultDesign(), meta: { name: 'x', themeId: 'volt' } };
		const same = setGripCommand({ grip: { ...document.grip } });

		expect(same.apply({ document })).toBe(document);
		expect(same.label).toBe('Grip');
		expect(same.mergeKey).toBeNull();

		const grip = { ...document.grip, colorId: 'red' };
		const next = setGripCommand({ grip }).apply({ document });

		expect(next.grip).toBe(grip);
		expect(next.meta.themeId).toBeNull();
	});
});
