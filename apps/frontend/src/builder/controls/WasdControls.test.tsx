import { useThree } from '@react-three/fiber';
import { create } from '@react-three/test-renderer';
import { useEffect } from 'react';
import { Vector3 } from 'three';

import { WasdControls } from '@builder/controls/WasdControls';

const fakeControls = { target: new Vector3(0, 0, 0), update: vi.fn() };

function ControlsProbe({ controls }: { controls: unknown }): null {
	const set = useThree((state) => state.set);
	const camera = useThree((state) => state.camera);
	useEffect(() => {
		camera.position.set(0, 0, 1);
		set({ controls: controls as never });
	}, [camera, controls, set]);
	return null;
}

const press = ({ code, init = {} }: { code: string; init?: KeyboardEventInit }): void => {
	window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true, ...init }));
};

describe('WasdControls', () => {
	afterEach(() => {
		fakeControls.target.set(0, 0, 0);
		window.dispatchEvent(new Event('blur'));
	});

	it('moves the camera and target while keys are held', async () => {
		const renderer = await create(
			<>
				<ControlsProbe controls={fakeControls} />
				<WasdControls />
			</>,
		);

		press({ code: 'KeyD' });
		press({ code: 'KeyW' });
		press({ code: 'ShiftLeft' });
		await renderer.advanceFrames(3, 0.05);

		expect(fakeControls.target.x).toBeGreaterThan(0);
		expect(fakeControls.update).toHaveBeenCalled();

		window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
		window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
		const x = fakeControls.target.x;
		await renderer.advanceFrames(2, 0.05);
		expect(fakeControls.target.x).toBe(x);
		await renderer.unmount();
	});

	it('ignores modified keys, unbound keys, typing and missing controls', async () => {
		const input = document.createElement('input');
		document.body.append(input);
		const renderer = await create(
			<>
				<ControlsProbe controls={null} />
				<WasdControls />
			</>,
		);

		press({ code: 'KeyD', init: { metaKey: true } });
		press({ code: 'KeyX' });
		input.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', bubbles: true }));
		window.dispatchEvent(new Event('keyup'));
		press({ code: 'KeyA' });
		await renderer.advanceFrames(2, 0.05);

		expect(fakeControls.target.x).toBe(0);
		input.remove();
		await renderer.unmount();
	});
});
