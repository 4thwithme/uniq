import {
	isDesignDocument,
	isDesignDocumentV7,
	upgradeDesignDocument,
} from '@uniq/shared';

import { FRAME_BANDS } from '@builder/decor/frame-faces';
import {
	circularDelta,
	findLayerAt,
	findPrintAt,
	moveLayerPosition,
	movePrintOffset,
	uvToSurfaceHit,
} from '@builder/decor/surface-coords';
import { createShapeLayer } from '@builder/design/decor-commands';
import { createDefaultDesign } from '@builder/design/default-design';

import type { PrintOverlay, ShapeLayer } from '@uniq/shared';

const SIZE = { width: 1000, height: 200 };

const layerAt = ({ id, u, v }: { id: string; u: number; v: number }): ShapeLayer => ({
	...createShapeLayer({ id, shape: 'star', zone: 'frame', color: '#ffffff', u }),
	position: { u, v },
});

const PRINT: PrintOverlay = {
	source: { kind: 'preset', presetId: 'flames' },
	scale: 0.5,
	repeat: 2,
	offset: 0.1,
	offsetY: 0.5,
};

describe('surface coords', () => {
	it('measures the short way around the loop', () => {
		expect(circularDelta({ from: 0.9, to: 0.1 })).toBeCloseTo(0.2);
		expect(circularDelta({ from: 0.1, to: 0.9 })).toBeCloseTo(-0.2);
	});

	it('maps a texture uv back to a shape position on the nearest band', () => {
		const front = uvToSurfaceHit({ uv: { x: 0.3, y: 0 }, bands: FRAME_BANDS });
		expect(front?.band).toBe(FRAME_BANDS[0]);
		expect(front?.position.u).toBeCloseTo(0.3);
		expect(front?.position.v).toBeCloseTo(0.5);
		const back = uvToSurfaceHit({ uv: { x: 1.25, y: 0.45 }, bands: FRAME_BANDS });
		expect(back?.band).toBe(FRAME_BANDS[1]);
		expect(back?.position.u).toBeCloseTo(0.25);
		expect(back?.position.v).toBeCloseTo(0.6);
		expect(
			uvToSurfaceHit({ uv: { x: 0, y: 0.2 }, bands: FRAME_BANDS })?.position.v,
		).toBeCloseTo(0.1);
		expect(uvToSurfaceHit({ uv: { x: 0, y: 0 }, bands: [] })).toBeNull();
	});

	it('finds the closest shape under the pointer', () => {
		const a = layerAt({ id: 'a', u: 0.5, v: 0.5 });
		const b = layerAt({ id: 'b', u: 0.52, v: 0.5 });
		expect(
			findLayerAt({ layers: [a, b], position: { u: 0.515, v: 0.5 }, size: SIZE })?.id,
		).toBe('b');
		expect(
			findLayerAt({ layers: [a], position: { u: 0.99, v: 0.5 }, size: SIZE }),
		).toBeNull();
		const wrapped = layerAt({ id: 'w', u: 0.995, v: 0.5 });
		expect(
			findLayerAt({ layers: [wrapped], position: { u: 0.005, v: 0.5 }, size: SIZE })?.id,
		).toBe('w');
	});

	it('finds which print copy is under the pointer', () => {
		expect(
			findPrintAt({
				print: PRINT,
				position: { u: 0.61, v: 0.55 },
				size: SIZE,
				aspect: 1,
			}),
		).toEqual({
			index: 1,
			du: expect.closeTo(0.01) as number,
			dv: expect.closeTo(0.05) as number,
		});
		expect(
			findPrintAt({ print: PRINT, position: { u: 0.35, v: 0.5 }, size: SIZE, aspect: 1 }),
		).toBeNull();
	});

	it('moves shapes and prints while keeping the grab point', () => {
		expect(
			moveLayerPosition({ position: { u: 0.05, v: 0.9 }, grab: { du: 0.1, dv: -0.2 } }),
		).toEqual({
			u: 0.95,
			v: 1,
		});
		expect(
			movePrintOffset({
				position: { u: 0.7, v: 0.4 },
				grab: { index: 1, du: 0.05, dv: 0.1 },
				repeat: 2,
			}),
		).toEqual({ offset: 0.15, offsetY: 0.3 });
	});
});

describe('print Y position schema', () => {
	it('upgrades v7 prints to sit in the middle and requires offsetY in v8', () => {
		const current = createDefaultDesign();
		const print = {
			source: { kind: 'preset', presetId: 'flames' },
			scale: 0.5,
			repeat: 2,
			offset: 0.1,
		};
		const v7 = {
			...current,
			schemaVersion: 7,
			shaftExtendsHead: true,
			overlays: { frame: { lines: null, print }, throat: { lines: null, print: null } },
		};
		expect(isDesignDocumentV7(v7)).toBe(true);
		expect(upgradeDesignDocument(v7)?.overlays.frame.print).toEqual({
			...print,
			offsetY: 0.5,
		});
		expect(upgradeDesignDocument(v7)?.overlays.throat.print).toBeNull();
		expect(isDesignDocument({ ...v7, schemaVersion: 8 })).toBe(false);
		expect(
			isDesignDocument({
				...v7,
				schemaVersion: 8,
				overlays: {
					...v7.overlays,
					frame: { lines: null, print: { ...print, offsetY: 2 } },
				},
			}),
		).toBe(false);
		expect(isDesignDocument({ ...current, overlays: 'x' })).toBe(false);
	});
});
