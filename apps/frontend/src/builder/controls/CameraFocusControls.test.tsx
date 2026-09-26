import { useThree } from '@react-three/fiber';
import { create } from '@react-three/test-renderer';
import { useEffect } from 'react';
import { Vector3 } from 'three';

import { CAMERA_VIEWS } from '@builder/controls/camera-views';
import { CameraFocusControls } from '@builder/controls/CameraFocusControls';

import type { CameraFocus } from '@builder/controls/camera-views';

const controls = {
	target: new Vector3(...CAMERA_VIEWS.overview.target),
	update: vi.fn(),
};
let cameraPosition: Vector3 | null = null;

function Probe({ value }: { value: unknown }): null {
	const set = useThree((state) => state.set);
	const camera = useThree((state) => state.camera);
	useEffect(() => {
		camera.position.set(...CAMERA_VIEWS.overview.position);
		cameraPosition = camera.position;
		set({ controls: value as never });
	}, [camera, set, value]);
	return null;
}

function Scene({
	focus,
	value = controls,
}: {
	focus: CameraFocus;
	value?: unknown;
}): React.JSX.Element {
	return (
		<>
			<Probe value={value} />
			<CameraFocusControls focus={focus} />
		</>
	);
}

describe('CameraFocusControls', () => {
	afterEach(() => {
		controls.target.set(...CAMERA_VIEWS.overview.target);
		vi.unstubAllGlobals();
	});

	it('glides to the grip and back to the overview', async () => {
		const renderer = await create(<Scene focus="overview" />);
		await renderer.advanceFrames(1, 0.016);
		expect(controls.target.toArray()).toEqual([...CAMERA_VIEWS.overview.target]);

		await renderer.update(<Scene focus="grip" />);
		await renderer.advanceFrames(2, 0.05);
		expect(controls.target.y).toBeLessThan(CAMERA_VIEWS.overview.target[1]);
		expect(controls.target.y).toBeGreaterThan(CAMERA_VIEWS.grip.target[1]);

		await renderer.advanceFrames(20, 0.05);
		expect(controls.target.y).toBeCloseTo(CAMERA_VIEWS.grip.target[1]);
		expect(cameraPosition?.z).toBeCloseTo(CAMERA_VIEWS.grip.position[2]);

		await renderer.update(<Scene focus="overview" />);
		await renderer.advanceFrames(20, 0.05);
		expect(controls.target.y).toBeCloseTo(CAMERA_VIEWS.overview.target[1]);
		await renderer.unmount();
	});

	it('jumps at once with reduced motion', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true })),
		);
		const renderer = await create(<Scene focus="grip" />);
		await renderer.advanceFrames(1, 0.001);

		expect(controls.target.y).toBeCloseTo(CAMERA_VIEWS.grip.target[1]);
		await renderer.unmount();
	});

	it('waits for orbit controls', async () => {
		const renderer = await create(<Scene focus="grip" value={null} />);
		await renderer.advanceFrames(3, 0.05);

		expect(controls.target.toArray()).toEqual([...CAMERA_VIEWS.overview.target]);
		await renderer.unmount();
	});
});
