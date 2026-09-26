import { MAX_LAYERS } from '@uniq/shared';

import {
	addLayerCommand,
	createShapeLayer,
	removeLayerCommand,
	setZoneLinesCommand,
	setZonePrintCommand,
	updateLayerCommand,
	withLinkedZonesCommand,
} from '@builder/design/decor-commands';
import { createDefaultDesign } from '@builder/design/default-design';
import { setZoneFillCommand } from '@builder/design/design-commands';

import type { DesignCommand } from '@builder/design/design-commands';

const star = createShapeLayer({
	id: 'a',
	shape: 'star',
	zone: 'frame',
	color: '#ffffff',
	u: 0.3,
});

describe('decor commands', () => {
	it('copies the source zone paint to linked zones', () => {
		const document = createDefaultDesign();
		const command = withLinkedZonesCommand({
			command: setZoneFillCommand({
				zoneId: 'frame',
				fill: { kind: 'solid', color: '#ff0000' },
				mergeKey: 'k',
			}),
			source: 'frame',
			targets: ['throat'],
		});
		const next = command.apply({ document });

		expect(command.mergeKey).toBe('k');
		expect(next.zones.throat).toEqual(next.zones.frame);
		expect(next.zones.throat).not.toBe(next.zones.frame);
	});

	it('returns the same document when the linked command is a no-op', () => {
		const document = createDefaultDesign();
		const noop: DesignCommand = {
			label: 'noop',
			mergeKey: null,
			apply: ({ document: d }) => d,
		};

		expect(
			withLinkedZonesCommand({
				command: noop,
				source: 'frame',
				targets: ['throat'],
			}).apply({
				document,
			}),
		).toBe(document);
	});

	it('sets and removes lines and print overlays', () => {
		const document = createDefaultDesign();
		const lines = {
			patternId: 'grid',
			color: '#000000',
			density: 10,
			thickness: 0.2,
		} as const;
		const withLines = setZoneLinesCommand({
			zoneId: 'frame',
			lines,
			mergeKey: 'l',
		}).apply({
			document,
		});
		const print = {
			source: { kind: 'preset', presetId: 'flames' },
			scale: 0.5,
			repeat: 2,
			offset: 0,
			offsetY: 0.5,
		} as const;
		const withPrint = setZonePrintCommand({ zoneId: 'frame', print }).apply({
			document: withLines,
		});

		expect(withPrint.overlays.frame).toEqual({ lines, print });
		expect(setZoneLinesCommand({ zoneId: 'frame', lines: null }).label).toBe(
			'Remove lines frame',
		);
		expect(setZonePrintCommand({ zoneId: 'frame', print: null }).label).toBe(
			'Remove print frame',
		);
		expect(
			setZonePrintCommand({ zoneId: 'frame', print: null }).apply({ document: withPrint })
				.overlays.frame.print,
		).toBeNull();
		expect(setZoneLinesCommand({ zoneId: 'frame', lines }).label).toBe('Lines frame');
		expect(setZonePrintCommand({ zoneId: 'frame', print }).label).toBe('Print frame');
	});

	it('creates, adds, updates and removes shape layers', () => {
		const document = createDefaultDesign();
		const added = addLayerCommand({ layer: star }).apply({ document });

		expect(star).toMatchObject({
			kind: 'shape',
			position: { u: 0.3, v: 0.5 },
			rotation: 0,
		});
		expect(added.layers).toEqual([star]);
		expect(addLayerCommand({ layer: star }).apply({ document: added })).toBe(added);

		const updated = updateLayerCommand({
			layerId: 'a',
			patch: { color: '#000000' },
			mergeKey: 'm',
		}).apply({ document: added });
		expect(updated.layers[0]).toMatchObject({ color: '#000000' });
		expect(
			updateLayerCommand({ layerId: 'missing', patch: { scale: 0.5 } }).apply({
				document: added,
			}),
		).toBe(added);

		const other = createShapeLayer({
			id: 'b',
			shape: 'bolt',
			zone: 'frame',
			color: '#ffffff',
			u: 0,
		});
		const two = addLayerCommand({ layer: other }).apply({ document: updated });
		const kept = updateLayerCommand({ layerId: 'b', patch: { rotation: 10 } }).apply({
			document: two,
		});
		expect(kept.layers[0]).toBe(two.layers[0]);

		expect(removeLayerCommand({ layerId: 'a' }).apply({ document: two }).layers).toEqual([
			other,
		]);
		expect(removeLayerCommand({ layerId: 'missing' }).apply({ document: two })).toBe(two);
	});

	it('refuses to add past the layer limit', () => {
		const document = {
			...createDefaultDesign(),
			layers: Array.from({ length: MAX_LAYERS }, (_, index) => ({
				...star,
				id: `s${String(index)}`,
			})),
		};

		expect(addLayerCommand({ layer: { ...star, id: 'new' } }).apply({ document })).toBe(
			document,
		);
	});
});
