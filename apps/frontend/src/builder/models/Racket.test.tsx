import { create } from '@react-three/test-renderer';
import { Color } from 'three';

import {
	addLayerCommand,
	createShapeLayer,
	setZonePrintCommand,
} from '@builder/design/decor-commands';
import { createDefaultDesign } from '@builder/design/default-design';
import { BUTT_CAP_HEIGHT } from '@builder/models/ButtCap';
import { Racket } from '@builder/models/Racket';
import { useDesignStore } from '@builder/store/design-store';

import type { DesignZones, GripSpec } from '@uniq/shared';
import type { Mesh, MeshStandardMaterial } from 'three';

const { CAP_BOTTOM_Y } = vi.hoisted(() => ({ CAP_BOTTOM_Y: -0.49 }));

vi.mock('@react-three/drei', async () => {
	const { BoxGeometry, Mesh: ThreeMesh } = await import('three');
	const names = [
		'zone_frame',
		'zone_throat',
		'zone_handle',
		'zone_butt_cap',
		'zone_strings',
		'grommets',
	];
	const nodes = Object.fromEntries(
		names.map((name) => {
			const geometry = new BoxGeometry(0.02, 0.02, 0.02);
			if (name === 'zone_butt_cap') {
				geometry.translate(0, CAP_BOTTOM_Y + 0.01, 0);
			}
			return [name, new ThreeMesh(geometry)];
		}),
	);
	const useGLTF = Object.assign(() => ({ nodes }), { preload: vi.fn() });
	return { useGLTF };
});

const zonesWith = ({ frame }: { frame: string }): DesignZones => {
	const { zones } = createDefaultDesign();
	return {
		...zones,
		frame: { ...zones.frame, fill: { kind: 'solid', color: frame } },
	};
};

const GRIP: GripSpec = {
	material: 'synthetic',
	colorId: 'blue',
	customHex: null,
	texture: 'smooth',
	finish: 'matte',
	overgrip: null,
};

describe('Racket', () => {
	it('renders the model meshes per zone with the zone colors', async () => {
		const renderer = await create(
			<Racket
				zones={zonesWith({ frame: '#ff0000' })}
				grip={GRIP}
				buttCap={createDefaultDesign().buttCap}
				grommets={createDefaultDesign().grommets}
				finishingTape={createDefaultDesign().finishingTape}
			/>,
		);

		const zoneNames = renderer.scene
			.findAll((node) => node.type === 'Mesh')
			.map((node) => (node.instance as Mesh).name);
		expect(zoneNames).toEqual([
			'zone_frame',
			'zone_throat',
			'zone_handle',
			'zone_strings',
			'finishing_tape',
			'grommets',
			'butt_cap_body',
			'butt_cap_face',
		]);

		const frame = renderer.scene.find(
			(node) => (node.instance as Mesh).name === 'zone_frame',
		).instance as Mesh;
		const handle = renderer.scene.find(
			(node) => (node.instance as Mesh).name === 'zone_handle',
		).instance as Mesh;

		expect(
			(frame.material as MeshStandardMaterial).color.equals(new Color('#ff0000')),
		).toBe(true);
		expect(
			(handle.material as MeshStandardMaterial).color.equals(new Color('#1e63c4')),
		).toBe(true);

		await renderer.unmount();
	});

	it('puts the butt cap badge just under the model cap', async () => {
		const renderer = await create(
			<Racket
				zones={createDefaultDesign().zones}
				grip={GRIP}
				buttCap={createDefaultDesign().buttCap}
				grommets={createDefaultDesign().grommets}
				finishingTape={createDefaultDesign().finishingTape}
			/>,
		);

		const group = renderer.scene.find(
			(node) => (node.instance as Mesh).name === 'butt_cap',
		).instance as Mesh;
		const body = renderer.scene.find(
			(node) => (node.instance as Mesh).name === 'butt_cap_body',
		).instance as Mesh;

		expect(group.position.y).toBeCloseTo(CAP_BOTTOM_Y + BUTT_CAP_HEIGHT / 2);
		expect(group.position.y + body.position.y).toBeCloseTo(0);

		await renderer.unmount();
	});

	it('leaves the finishing tape out when there is none', async () => {
		const renderer = await create(
			<Racket
				zones={createDefaultDesign().zones}
				grip={GRIP}
				buttCap={createDefaultDesign().buttCap}
				grommets={{ colorId: 'nope', finish: 'gloss' }}
				finishingTape={null}
			/>,
		);

		const names = renderer.scene
			.findAll((node) => node.type === 'Mesh')
			.map((node) => (node.instance as Mesh).name);
		expect(names).not.toContain('finishing_tape');
		expect(names).toContain('grommets');

		await renderer.unmount();
	});

	it('paints the shaft with the frame design as one piece', async () => {
		const { zones } = createDefaultDesign();
		const renderer = await create(
			<Racket
				zones={{
					frame: { finish: 'matte', fill: { kind: 'solid', color: '#00ff00' } },
					throat: { finish: 'gloss', fill: { kind: 'solid', color: '#ff0000' } },
				}}
				grip={GRIP}
				buttCap={createDefaultDesign().buttCap}
				grommets={createDefaultDesign().grommets}
				finishingTape={null}
			/>,
		);

		const throat = renderer.scene.find(
			(node) => (node.instance as Mesh).name === 'zone_throat',
		).instance as Mesh;
		expect((throat.material as MeshStandardMaterial).roughness).toBeGreaterThan(0.5);
		expect(zones.throat).toBeDefined();

		await renderer.unmount();
	});

	it('drags a shape and the print on the frame and ignores misses', async () => {
		const { execute } = useDesignStore.getState();
		execute({
			command: addLayerCommand({
				layer: createShapeLayer({
					id: 's1',
					shape: 'star',
					zone: 'frame',
					color: '#ffffff',
					u: 0.3,
				}),
			}),
		});
		execute({
			command: setZonePrintCommand({
				zoneId: 'frame',
				print: {
					source: { kind: 'preset', presetId: 'flames' },
					scale: 1,
					repeat: 1,
					offset: 0.7,
					offsetY: 0.5,
				},
			}),
		});
		const design = (): ReturnType<typeof useDesignStore.getState>['document'] =>
			useDesignStore.getState().document;
		const renderer = await create(
			<Racket
				zones={design().zones}
				grip={GRIP}
				buttCap={design().buttCap}
				grommets={design().grommets}
				finishingTape={null}
				layers={design().layers}
				overlays={design().overlays}
				printImage={{ image: {} as CanvasImageSource, width: 100, height: 100 }}
			/>,
		);
		const frame = renderer.scene.find(
			(node) => (node.instance as Mesh).name === 'zone_frame',
		);
		const capture = { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() };
		const pointer = ({ x, y }: { x: number; y: number }): Record<string, unknown> => ({
			uv: { x, y },
			pointerId: 1,
			target: capture,
			stopPropagation: vi.fn(),
		});

		await renderer.fireEvent(frame, 'onPointerMove', pointer({ x: 0.5, y: 0 }));
		await renderer.fireEvent(frame, 'onPointerUp', pointer({ x: 0.5, y: 0 }));
		await renderer.fireEvent(frame, 'onPointerDown', {
			...pointer({ x: 0.1, y: 0 }),
			uv: undefined,
		});
		await renderer.fireEvent(frame, 'onPointerDown', pointer({ x: 0.1, y: 0 }));
		expect(capture.setPointerCapture).not.toHaveBeenCalled();

		await renderer.fireEvent(frame, 'onPointerDown', pointer({ x: 0.3, y: 0 }));
		expect(capture.setPointerCapture).toHaveBeenCalledWith(1);
		expect(useDesignStore.getState().selectedLayerId).toBe('s1');
		await renderer.fireEvent(frame, 'onPointerMove', {
			...pointer({ x: 0.4, y: 0 }),
			uv: undefined,
		});
		await renderer.fireEvent(frame, 'onPointerMove', pointer({ x: 0.4, y: 0.05 }));
		expect(design().layers[0]?.position).toEqual({ u: 0.4, v: 0.4 });
		await renderer.fireEvent(frame, 'onPointerUp', pointer({ x: 0.4, y: 0.05 }));
		expect(capture.releasePointerCapture).toHaveBeenCalledWith(1);

		await renderer.fireEvent(frame, 'onPointerDown', pointer({ x: 0.71, y: 0 }));
		await renderer.fireEvent(frame, 'onPointerMove', pointer({ x: 0.81, y: 0 }));
		expect(design().overlays.frame.print).toMatchObject({ offset: 0.8, offsetY: 0.5 });
		await renderer.fireEvent(frame, 'onPointerUp', pointer({ x: 0.81, y: 0 }));

		await renderer.unmount();
	});
});
