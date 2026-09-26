import { create } from '@react-three/test-renderer';
import { DEFAULT_BUTT_CAP } from '@uniq/shared';
import { Color } from 'three';

import { BUTT_CAP_HEIGHT, ButtCap } from '@builder/models/ButtCap';

import type { ButtCapSpec } from '@uniq/shared';
import type { Mesh, MeshPhysicalMaterial } from 'three';

const createContext = (): Record<string, unknown> => {
	const noop = (): void => undefined;
	return {
		save: noop,
		restore: noop,
		fillRect: vi.fn(),
		beginPath: noop,
		arc: noop,
		fill: noop,
		stroke: noop,
		translate: noop,
		scale: noop,
		fillText: vi.fn(),
		moveTo: noop,
		bezierCurveTo: noop,
		createRadialGradient: () => ({ addColorStop: noop }),
		fillStyle: '',
		strokeStyle: '',
		lineWidth: 0,
		font: '',
		textAlign: 'start',
		textBaseline: 'alphabetic',
		globalAlpha: 1,
	};
};

const fakeCanvas =
	({ context }: { context: Record<string, unknown> | null }): (() => HTMLCanvasElement) =>
	(): HTMLCanvasElement =>
		({ width: 0, height: 0, getContext: () => context }) as unknown as HTMLCanvasElement;

const createPath = ({ d }: { d: string }): Path2D => ({ d }) as unknown as Path2D;

const renderCap = async ({
	buttCap,
	context,
}: {
	buttCap: ButtCapSpec;
	context: Record<string, unknown> | null;
}): Promise<Awaited<ReturnType<typeof create>>> =>
	create(
		<ButtCap
			buttCap={buttCap}
			handleRadius={0.014}
			bottomY={-0.48}
			createCanvas={fakeCanvas({ context })}
			createPath={createPath}
		/>,
	);

const meshNamed = ({
	renderer,
	name,
}: {
	renderer: Awaited<ReturnType<typeof create>>;
	name: string;
}): Mesh =>
	renderer.scene.find((node) => (node.instance as Mesh).name === name).instance as Mesh;

describe('ButtCap', () => {
	it('renders a glossy cap body and a badge face painted on a canvas', async () => {
		const context = createContext();
		const renderer = await renderCap({ buttCap: DEFAULT_BUTT_CAP, context });

		const group = renderer.scene.children[0]?.instance as Mesh;
		expect(group.name).toBe('butt_cap');
		expect(group.position.y).toBeCloseTo(-0.48 - BUTT_CAP_HEIGHT / 2);

		const body = meshNamed({ renderer, name: 'butt_cap_body' });
		const bodyMaterial = body.material as MeshPhysicalMaterial;
		expect(bodyMaterial.color.getHexString()).toBe(new Color('#151515').getHexString());
		expect(bodyMaterial.roughness).toBeCloseTo(0.25);
		expect(bodyMaterial.clearcoat).toBeCloseTo(0.8);

		const face = meshNamed({ renderer, name: 'butt_cap_face' });
		const faceMaterial = face.material as MeshPhysicalMaterial;
		expect(faceMaterial.map).not.toBeNull();
		expect(faceMaterial.clearcoat).toBeCloseTo(1);
		expect(context['fillText']).toHaveBeenCalledWith(
			'U',
			expect.any(Number),
			expect.any(Number),
		);
		await renderer.unmount();
	});

	it('uses a matte finish and a plain face color without a canvas context', async () => {
		const renderer = await renderCap({
			buttCap: { ...DEFAULT_BUTT_CAP, colorId: 'red', finish: 'matte' },
			context: null,
		});

		const body = meshNamed({ renderer, name: 'butt_cap_body' })
			.material as MeshPhysicalMaterial;
		expect(body.roughness).toBeCloseTo(0.7);
		expect(body.clearcoat).toBe(0);

		const face = meshNamed({ renderer, name: 'butt_cap_face' })
			.material as MeshPhysicalMaterial;
		expect(face.map).toBeNull();
		expect(face.color.getHexString()).toBe(new Color('#c62828').getHexString());
		expect(face.roughness).toBeCloseTo(0.65);
		await renderer.unmount();
	});

	it('falls back to black for an unknown cap color', async () => {
		const renderer = await renderCap({
			buttCap: { ...DEFAULT_BUTT_CAP, colorId: 'nope' },
			context: null,
		});

		const body = meshNamed({ renderer, name: 'butt_cap_body' })
			.material as MeshPhysicalMaterial;
		expect(body.color.getHexString()).toBe(new Color('#151515').getHexString());
		await renderer.unmount();
	});
});
