import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setZoneFinishCommand } from '@builder/design/design-commands';
import { useDesignStore } from '@builder/store/design-store';
import { HistoryToolbar } from '@builder/ui/HistoryToolbar';
import { PaintPanel } from '@builder/ui/PaintPanel';
import { getToolsTitle } from '@builder/ui/tool-labels';

import type { GradientFill } from '@uniq/shared';

const frameGradient = (): GradientFill => {
	const { fill } = useDesignStore.getState().document.zones.frame;
	if (fill.kind !== 'gradient') {
		throw new Error('expected gradient');
	}
	return fill;
};

describe('PaintPanel', () => {
	it('paints the frame only, leaving the shaft for its own step', () => {
		render(<PaintPanel zoneId="frame" />);

		fireEvent.change(screen.getByLabelText('Color picker'), {
			target: { value: '#ff0000' },
		});

		const { zones } = useDesignStore.getState().document;
		expect(zones.frame.fill).toEqual({ kind: 'solid', color: '#ff0000' });
		expect(zones.throat.fill).not.toEqual({ kind: 'solid', color: '#ff0000' });
		expect(useDesignStore.getState().past).toHaveLength(1);
	});

	it('paints only the throat for the throat zone', async () => {
		const user = userEvent.setup();
		const before = useDesignStore.getState().document.zones.frame;
		render(<PaintPanel zoneId="throat" />);

		const input = screen.getByRole('textbox', { name: 'Color' });
		await user.clear(input);
		await user.type(input, '#123456{Enter}');
		fireEvent.click(screen.getByRole('radio', { name: 'Pearl' }));

		const { zones } = useDesignStore.getState().document;
		expect(zones.throat).toEqual({
			finish: 'pearl',
			fill: { kind: 'solid', color: '#123456' },
		});
		expect(zones.frame).toBe(before);
	});

	it('switches to a gradient, edits stops and angle, and back to solid', async () => {
		const user = userEvent.setup();
		render(<PaintPanel zoneId="frame" />);

		await user.click(screen.getByRole('radio', { name: 'Gradient' }));
		expect(screen.getByRole('radio', { name: 'Gradient' })).toBeChecked();

		fireEvent.change(screen.getByLabelText('Stop 2 color picker'), {
			target: { value: '#0000ff' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Stop 2 position' }), {
			target: { value: '80' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Angle' }), {
			target: { value: '45' },
		});

		expect(frameGradient()).toMatchObject({
			angle: 45,
			stops: [{ offset: 0 }, { offset: 0.8, color: '#0000ff' }],
		});
		expect(screen.getByRole('button', { name: 'Remove stop 1' })).toBeDisabled();

		await user.click(screen.getByRole('button', { name: 'Add stop' }));
		await user.click(screen.getByRole('button', { name: 'Add stop' }));
		expect(frameGradient().stops).toHaveLength(4);
		expect(screen.getByRole('button', { name: 'Add stop' })).toBeDisabled();

		await user.click(screen.getByRole('button', { name: 'Remove stop 2' }));
		expect(frameGradient().stops).toHaveLength(3);

		fireEvent.click(screen.getByRole('radio', { name: 'Matte' }));
		expect(useDesignStore.getState().document.zones.frame.finish).toBe('matte');

		await user.click(screen.getByRole('radio', { name: 'Solid' }));
		expect(useDesignStore.getState().document.zones.frame.fill.kind).toBe('solid');
	});
});

describe('HistoryToolbar', () => {
	it('undoes and redoes', async () => {
		const user = userEvent.setup();
		render(<HistoryToolbar />);
		const toolbar = within(screen.getByRole('toolbar', { name: 'History' }));

		expect(toolbar.getByRole('button', { name: 'Undo' })).toBeDisabled();
		act(() => {
			useDesignStore
				.getState()
				.execute({ command: setZoneFinishCommand({ zoneId: 'frame', finish: 'matte' }) });
		});

		await user.click(toolbar.getByRole('button', { name: 'Undo' }));
		expect(useDesignStore.getState().document.zones.frame.finish).toBe('gloss');
		await user.click(toolbar.getByRole('button', { name: 'Redo' }));
		expect(useDesignStore.getState().document.zones.frame.finish).toBe('matte');
	});
});

describe('tool state and labels', () => {
	it('keeps the zone and remembers frame and handle options', () => {
		const { selectTool, selectLayer } = useDesignStore.getState();
		act(() => {
			selectTool({ tool: { step: 'frame', frameOption: 'print' } });
		});
		expect(useDesignStore.getState()).toMatchObject({
			selectedZone: 'frame',
			tool: { step: 'frame', frameOption: 'print' },
		});
		act(() => {
			selectTool({ tool: { step: 'handle', handleOption: 'overgrip' } });
			selectLayer({ layerId: 'x' });
		});
		expect(useDesignStore.getState()).toMatchObject({
			selectedZone: 'frame',
			selectedLayerId: 'x',
			tool: { step: 'handle', frameOption: 'print', handleOption: 'overgrip' },
		});
	});

	it('titles the tools panel per step', () => {
		expect(
			getToolsTitle({
				tool: {
					step: 'buttCap',
					frameOption: 'color',
					handleOption: 'grip',
				},
			}),
		).toBe('Grip Cap');
		expect(
			getToolsTitle({
				tool: {
					step: 'handle',
					frameOption: 'color',
					handleOption: 'grip',
				},
			}),
		).toBe('Handle · Grip');
		expect(
			getToolsTitle({
				tool: {
					step: 'handle',
					frameOption: 'color',
					handleOption: 'overgrip',
				},
			}),
		).toBe('Handle · Overgrip');
		expect(
			getToolsTitle({
				tool: {
					step: 'frame',
					frameOption: 'objects',
					handleOption: 'grip',
				},
			}),
		).toBe('Frame · Objects');
	});
});
