import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	DEFAULT_LOGO,
	isDesignDocument,
	isDesignDocumentV9,
	isLogoSpec,
	upgradeDesignDocument,
} from '@uniq/shared';
import { Group, Mesh } from 'three';

import { paintSurface } from '@builder/decor/surface-painter';
import {
	buildColumnTable,
	colorAt,
	columnWorldAt,
	gradientT,
	planarWorldAt,
} from '@builder/decor/world-gradient';
import { createDefaultDesign } from '@builder/design/default-design';
import { setLogoCommand } from '@builder/design/design-commands';
import { getTubeMetrics, RACKET_MODEL_NODES } from '@builder/models/racket-model';
import { useDesignStore } from '@builder/store/design-store';
import { LogoEditor } from '@builder/ui/LogoEditor';

import type { SurfaceContext } from '@builder/decor/surface-painter';

const EXTENT = { minX: -1, maxX: 1, minY: 0, maxY: 2 };

describe('world gradient', () => {
	it('interpolates stop colors and clamps outside the stops', () => {
		const stops = [
			{ offset: 0.2, color: '#000000' },
			{ offset: 0.8, color: '#ffffff' },
		];
		expect(colorAt({ stops, t: 0 })).toBe('#000000');
		expect(['#7f7f7f', '#808080']).toContain(colorAt({ stops, t: 0.5 }));
		expect(colorAt({ stops, t: 1 })).toBe('#ffffff');
		expect(colorAt({ stops: [], t: 0.5 })).toBe('#000000');
		expect(
			colorAt({
				stops: [
					{ offset: 0.5, color: '#123456' },
					{ offset: 0.5, color: '#654321' },
				],
				t: 0.5,
			}),
		).toBe('#123456');
	});

	it('measures t along the racket for any angle', () => {
		expect(gradientT({ point: { x: 0, y: 0 }, angle: 0, extent: EXTENT })).toBe(0);
		expect(gradientT({ point: { x: 0, y: 2 }, angle: 0, extent: EXTENT })).toBe(1);
		expect(gradientT({ point: { x: 1, y: 1 }, angle: 90, extent: EXTENT })).toBeCloseTo(
			1,
		);
		expect(gradientT({ point: { x: -1, y: 1 }, angle: 90, extent: EXTENT })).toBeCloseTo(
			0,
		);
	});

	it('maps loop columns to points, filling empty columns, with no seam', () => {
		const table = buildColumnTable({
			positions: [1, 0, 0, 0, 1, 0],
			uvs: [0.1, 0, 0.6, 0],
			bins: 4,
		});
		expect(table[0]).toEqual({ x: 1, y: 0 });
		expect(table[2]).toEqual({ x: 0, y: 1 });
		expect(table[1]).toEqual({ x: 0, y: 1 });
		const worldAt = columnWorldAt({ table });
		const start = worldAt({ u: 0.001, v: 0 });
		const end = worldAt({ u: 0.999, v: 0 });
		expect(Math.hypot(start.x - end.x, start.y - end.y)).toBeLessThan(0.01);
	});

	it('maps shaft uvs back to x and y on front and back', () => {
		const worldAt = planarWorldAt({ extent: EXTENT });
		expect(worldAt({ u: 0.5, v: 0 })).toEqual({ x: 0, y: 1 });
		expect(worldAt({ u: 0, v: 0.25 }).x).toBeCloseTo(1);
		expect(worldAt({ u: 0, v: 0.95 }).x).toBeCloseTo(-0.2);
		expect(worldAt({ u: 1, v: 0.5 })).toEqual({ x: 0, y: 2 });
	});

	it('paints gradients strip by strip when world positions are known', () => {
		const gradients: { stops: string[] }[] = [];
		const context = {
			save: vi.fn(),
			restore: vi.fn(),
			fillRect: vi.fn(),
			createLinearGradient: () => {
				const gradient = {
					stops: [] as string[],
					addColorStop: (_: number, color: string) => {
						gradient.stops.push(color);
					},
				};
				gradients.push(gradient);
				return gradient;
			},
			fillStyle: '',
		} as unknown as SurfaceContext;
		paintSurface({
			context,
			width: 16,
			height: 8,
			paint: {
				finish: 'gloss',
				fill: {
					kind: 'gradient',
					angle: 0,
					stops: [
						{ offset: 0, color: '#000000' },
						{ offset: 1, color: '#ffffff' },
					],
				},
			},
			overlays: { lines: null, print: null },
			layers: [],
			printImage: null,
			bands: [],
			createPath: ({ d }) => ({ d }) as unknown as Path2D,
			world: { worldAt: ({ v }) => ({ x: 0, y: v * 2 }), extent: EXTENT },
		});
		expect(gradients).toHaveLength(4);
		expect(gradients[0]?.stops.at(0)).toBe('#ffffff');
		expect(gradients[0]?.stops.at(-1)).toBe('#000000');
	});
});

describe('tube metrics', () => {
	it('reads the loop length and perimeter from the model or falls back', () => {
		const frame = new Mesh();
		frame.userData = { loopLength: 0.9, perimeter: 0.07 };
		expect(getTubeMetrics({ nodes: { [RACKET_MODEL_NODES.frame]: frame } })).toEqual({
			loopLength: 0.9,
			perimeter: 0.07,
		});
		expect(
			getTubeMetrics({ nodes: { [RACKET_MODEL_NODES.frame]: new Group() } }).loopLength,
		).toBeGreaterThan(0);
		expect(getTubeMetrics({ nodes: {} }).perimeter).toBeGreaterThan(0);
	});
});

describe('HEAD logo', () => {
	it('validates logo settings and upgrades v9 with the default logo', () => {
		expect(isLogoSpec(DEFAULT_LOGO)).toBe(true);
		expect(isLogoSpec({ color: 'gold', size: 1 })).toBe(false);
		expect(isLogoSpec({ color: 'auto', size: 3 })).toBe(false);
		expect(isLogoSpec(null)).toBe(false);
		const v9: Record<string, unknown> = { ...createDefaultDesign(), schemaVersion: 9 };
		delete v9['logo'];
		expect(isDesignDocumentV9(v9)).toBe(true);
		expect(upgradeDesignDocument(v9)).toEqual(createDefaultDesign());
		expect(isDesignDocument(v9)).toBe(false);
	});

	it('changes logo color and size but never removes it', async () => {
		const user = userEvent.setup();
		render(<LogoEditor />);

		expect(screen.getByRole('img', { name: 'HEAD logo' })).toBeInTheDocument();
		expect(screen.getByText(/Required on every racket/u)).toBeInTheDocument();
		await user.click(screen.getByRole('radio', { name: 'White' }));
		fireEvent.change(screen.getByRole('slider', { name: 'Logo size' }), {
			target: { value: '120' },
		});
		expect(useDesignStore.getState().document.logo).toEqual({
			color: 'white',
			size: 1.2,
		});
		expect(screen.queryByRole('radio', { name: 'None' })).not.toBeInTheDocument();

		const base = createDefaultDesign();
		expect(setLogoCommand({ logo: { ...base.logo } }).apply({ document: base })).toBe(
			base,
		);
	});
});

describe('world gradient edge cases', () => {
	it('falls back when no column has points and on dark luminance', async () => {
		expect(buildColumnTable({ positions: [], uvs: [], bins: 2 })).toEqual([
			{ x: 0, y: 0 },
			{ x: 0, y: 0 },
		]);
		const { getLuminance } = await import('@builder/decor/brand-logo');
		expect(getLuminance({ hex: '#050505' })).toBeLessThan(0.01);
	});
});
