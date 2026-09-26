import { create } from '@react-three/test-renderer';
import { CanvasTexture } from 'three';

import { FINISH_PARAMS } from '@builder/materials/finish-params';
import { ZONE_TEXTURE_ROTATION } from '@builder/materials/zone-texture-rotation';
import { ZoneMaterial } from '@builder/materials/ZoneMaterial';

import type { GradientFill, ZoneId, ZonePaint } from '@uniq/shared';
import type { Mesh, MeshPhysicalMaterial } from 'three';

vi.mock('@builder/materials/gradient-texture', () => ({
	createGradientTexture: (): CanvasTexture =>
		new CanvasTexture(document.createElement('canvas')),
}));

const GRADIENT: GradientFill = {
	kind: 'gradient',
	angle: 0,
	stops: [
		{ offset: 0, color: '#000000' },
		{ offset: 1, color: '#ffffff' },
	],
};

const renderMaterial = async ({
	paint,
	zoneId = 'frame',
}: {
	paint: ZonePaint;
	zoneId?: ZoneId;
}): Promise<{ material: MeshPhysicalMaterial; unmount: () => Promise<void> }> => {
	const renderer = await create(
		<mesh>
			<boxGeometry />
			<ZoneMaterial zoneId={zoneId} paint={paint} />
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

describe('ZoneMaterial', () => {
	it('renders a solid color with finish params', async () => {
		const { material, unmount } = await renderMaterial({
			paint: { finish: 'metallic', fill: { kind: 'solid', color: '#ff0000' } },
		});

		expect(material.color.getHexString()).toBe('ff0000');
		expect(material.metalness).toBe(FINISH_PARAMS.metallic.metalness);
		expect(material.map).toBeNull();

		await unmount();
	});

	it('renders a gradient as a white base color with a texture map and disposes it', async () => {
		const { material, unmount } = await renderMaterial({
			paint: { finish: 'pearl', fill: GRADIENT },
		});
		const map = material.map;

		expect(material.color.getHexString()).toBe('ffffff');
		expect(map).toBeInstanceOf(CanvasTexture);

		const dispose = vi.spyOn(map as CanvasTexture, 'dispose');
		await unmount();

		expect(dispose).toHaveBeenCalled();
	});

	it.each(['frame', 'throat'] as const)(
		'rotates the gradient so 0° runs along the %s long axis',
		async (zoneId) => {
			const { material, unmount } = await renderMaterial({
				paint: { finish: 'gloss', fill: GRADIENT },
				zoneId,
			});

			expect(material.map?.rotation).toBe(ZONE_TEXTURE_ROTATION[zoneId]);
			expect(material.map?.center.toArray()).toEqual([0.5, 0.5]);

			await unmount();
		},
	);
});
