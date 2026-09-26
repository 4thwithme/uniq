import { create } from '@react-three/test-renderer';
import { Color } from 'three';

import { createDefaultDesign } from '@builder/design/default-design';
import { FrameSurfaceMaterial } from '@builder/materials/FrameSurfaceMaterial';

import type { PathFactory, PrintImage } from '@builder/decor/surface-painter';
import type { ZoneOverlays } from '@uniq/shared';
import type { Mesh, MeshPhysicalMaterial } from 'three';

const createContext = ({
	onDrawImage,
}: {
	onDrawImage?: (() => void) | undefined;
}): Record<string, unknown> => {
	const noop = (): void => undefined;
	return {
		save: noop,
		restore: noop,
		fillRect: vi.fn(),
		beginPath: noop,
		moveTo: noop,
		lineTo: noop,
		stroke: noop,
		translate: noop,
		rotate: noop,
		scale: noop,
		fill: noop,
		drawImage: onDrawImage ?? noop,
		createLinearGradient: () => ({ addColorStop: noop }),
		fillStyle: '',
		strokeStyle: '',
		lineWidth: 0,
		lineJoin: 'miter',
		lineCap: 'butt',
	};
};

const fakeCanvas =
	({ context }: { context: Record<string, unknown> | null }): (() => HTMLCanvasElement) =>
	(): HTMLCanvasElement =>
		({ width: 0, height: 0, getContext: () => context }) as unknown as HTMLCanvasElement;

const createPath: PathFactory = () => ({}) as Path2D;

const PRINT: ZoneOverlays = {
	lines: null,
	print: {
		source: { kind: 'preset', presetId: 'flames' },
		scale: 1,
		repeat: 1,
		offset: 0,
		offsetY: 0.5,
	},
};
const IMAGE: PrintImage = { image: {} as CanvasImageSource, width: 10, height: 10 };

const renderMaterial = async ({
	createCanvas,
	overlays = { lines: null, print: null },
	printImage = null,
}: {
	createCanvas: () => HTMLCanvasElement;
	overlays?: ZoneOverlays;
	printImage?: PrintImage | null;
}): Promise<{ material: MeshPhysicalMaterial; unmount: () => Promise<void> }> => {
	const renderer = await create(
		<mesh>
			<boxGeometry />
			<FrameSurfaceMaterial
				paint={createDefaultDesign().zones.frame}
				overlays={overlays}
				layers={[]}
				printImage={printImage}
				createCanvas={createCanvas}
				createPath={createPath}
			/>
		</mesh>,
	);
	const mesh = renderer.scene.children[0]?.instance as Mesh;
	return {
		material: mesh.material as MeshPhysicalMaterial,
		unmount: async (): Promise<void> => {
			await renderer.unmount();
		},
	};
};

describe('FrameSurfaceMaterial', () => {
	it('paints the surface into a white-tinted canvas texture', async () => {
		const context = createContext({});
		const { material, unmount } = await renderMaterial({
			createCanvas: fakeCanvas({ context }),
		});

		expect(material.map).not.toBeNull();
		expect(material.color.equals(new Color('#ffffff'))).toBe(true);
		expect(context['fillRect']).toHaveBeenCalled();
		await unmount();
	});

	it('falls back to the paint color without a 2D context', async () => {
		const { material, unmount } = await renderMaterial({
			createCanvas: fakeCanvas({ context: null }),
		});

		expect(material.map).toBeNull();
		expect(material.color.equals(new Color('#030303'))).toBe(true);
		await unmount();
	});

	it('repaints without the print when drawing it throws', async () => {
		const context = createContext({
			onDrawImage: () => {
				throw new Error('tainted');
			},
		});
		const { material, unmount } = await renderMaterial({
			createCanvas: fakeCanvas({ context }),
			overlays: PRINT,
			printImage: IMAGE,
		});

		expect(material.map).not.toBeNull();
		expect(context['fillRect']).toHaveBeenCalledTimes(2);
		await unmount();
	});

	it('uses the browser canvas by default', async () => {
		const renderer = await create(
			<mesh>
				<boxGeometry />
				<FrameSurfaceMaterial
					paint={{ finish: 'matte', fill: { kind: 'gradient', angle: 0, stops: [] } }}
					overlays={{ lines: null, print: null }}
					layers={[]}
					printImage={null}
				/>
			</mesh>,
		);
		const mesh = renderer.scene.children[0]?.instance as Mesh;

		expect(
			(mesh.material as MeshPhysicalMaterial).color.equals(new Color('#ffffff')),
		).toBe(true);
		await renderer.unmount();
	});
});
