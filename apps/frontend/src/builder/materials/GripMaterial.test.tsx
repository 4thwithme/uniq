import { create } from '@react-three/test-renderer';
import { Color } from 'three';

import { GripMaterial } from '@builder/materials/GripMaterial';

import type { GripSpec } from '@uniq/shared';
import type { Mesh, MeshPhysicalMaterial } from 'three';

const GRIP: GripSpec = {
	material: 'synthetic',
	colorId: 'red',
	customHex: null,
	texture: 'grooved',
	finish: 'gloss',
	overgrip: null,
};

const createContext = (): Record<string, unknown> => {
	const noop = (): void => undefined;
	return {
		save: noop,
		restore: noop,
		fillRect: vi.fn(),
		beginPath: noop,
		moveTo: noop,
		lineTo: noop,
		stroke: noop,
		arc: noop,
		fill: noop,
		fillStyle: '',
		strokeStyle: '',
		lineWidth: 0,
		globalAlpha: 1,
	};
};

const fakeCanvas =
	({ context }: { context: Record<string, unknown> | null }): (() => HTMLCanvasElement) =>
	(): HTMLCanvasElement =>
		({ width: 0, height: 0, getContext: () => context }) as unknown as HTMLCanvasElement;

const renderMaterial = async ({
	createCanvas,
	grip = GRIP,
}: {
	createCanvas: () => HTMLCanvasElement;
	grip?: GripSpec;
}): Promise<{
	material: MeshPhysicalMaterial;
	update: (params: { grip: GripSpec }) => Promise<MeshPhysicalMaterial>;
	unmount: () => Promise<void>;
}> => {
	const element = ({ value }: { value: GripSpec }): React.JSX.Element => (
		<mesh>
			<boxGeometry />
			<GripMaterial grip={value} createCanvas={createCanvas} />
		</mesh>
	);
	const renderer = await create(element({ value: grip }));
	const read = (): MeshPhysicalMaterial =>
		(renderer.scene.children[0]?.instance as Mesh).material as MeshPhysicalMaterial;
	return {
		material: read(),
		update: async ({ grip: next }) => {
			await renderer.update(element({ value: next }));
			return read();
		},
		unmount: async () => {
			await renderer.unmount();
		},
	};
};

describe('GripMaterial', () => {
	it('paints the grip into a map and bump map with gloss params', async () => {
		const context = createContext();
		const { material, update, unmount } = await renderMaterial({
			createCanvas: fakeCanvas({ context }),
		});

		expect(material.map).not.toBeNull();
		expect(material.bumpMap).toBe(material.map);
		expect(material.color.equals(new Color('#ffffff'))).toBe(true);
		expect(material.clearcoat).toBeGreaterThan(0);
		expect(context['fillRect']).toHaveBeenCalled();

		const dispose = vi.spyOn(material.map!, 'dispose');
		const leather = await update({
			grip: {
				material: 'leather',
				colorId: 'brown',
				customHex: null,
				texture: 'smooth',
				finish: 'matte',
				overgrip: null,
			},
		});
		expect(leather.sheen).toBeGreaterThan(0.3);
		await unmount();
		expect(dispose).toHaveBeenCalled();
	});

	it('uses the plain grip color without a 2D context', async () => {
		const { material, unmount } = await renderMaterial({
			createCanvas: fakeCanvas({ context: null }),
		});

		expect(material.map).toBeNull();
		expect(material.color.equals(new Color('#c62828'))).toBe(true);
		await unmount();
	});
});
