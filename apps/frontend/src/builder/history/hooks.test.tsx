import { act, renderHook } from '@testing-library/react';

import { createDefaultDesign } from '@builder/design/default-design';
import { setZoneFinishCommand } from '@builder/design/design-commands';
import { AUTOSAVE_DEBOUNCE_MS, AUTOSAVE_STORAGE_KEY } from '@builder/history/autosave';
import { useDesignAutosave } from '@builder/history/useDesignAutosave';
import { useHistoryShortcuts } from '@builder/history/useHistoryShortcuts';
import { useDesignStore } from '@builder/store/design-store';

describe('useDesignAutosave', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('restores a saved draft on mount', () => {
		const draft = { ...createDefaultDesign(), meta: { name: 'Saved', themeId: null } };
		window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(draft));

		renderHook(() => {
			useDesignAutosave();
		});

		expect(useDesignStore.getState().document.meta.name).toBe('Saved');
	});

	it('saves the document after a debounce and stops on unmount', () => {
		vi.useFakeTimers();
		const { unmount } = renderHook(() => {
			useDesignAutosave();
		});

		act(() => {
			useDesignStore.getState().selectZone({ zoneId: 'throat' });
			useDesignStore
				.getState()
				.execute({ command: setZoneFinishCommand({ zoneId: 'frame', finish: 'matte' }) });
			useDesignStore
				.getState()
				.execute({ command: setZoneFinishCommand({ zoneId: 'frame', finish: 'pearl' }) });
		});

		expect(window.localStorage.getItem(AUTOSAVE_STORAGE_KEY)).toBeNull();

		act(() => {
			vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);
		});

		expect(
			JSON.parse(window.localStorage.getItem(AUTOSAVE_STORAGE_KEY) ?? '{}'),
		).toMatchObject({
			zones: { frame: { finish: 'pearl' } },
		});

		unmount();
		act(() => {
			useDesignStore.getState().execute({
				command: setZoneFinishCommand({ zoneId: 'frame', finish: 'metallic' }),
			});
			vi.advanceTimersByTime(AUTOSAVE_DEBOUNCE_MS);
		});

		expect(window.localStorage.getItem(AUTOSAVE_STORAGE_KEY)).not.toContain('metallic');
	});
});

describe('useHistoryShortcuts', () => {
	const press = ({
		key,
		shiftKey = false,
		ctrlKey = true,
		target = window,
	}: {
		key: string;
		shiftKey?: boolean;
		ctrlKey?: boolean;
		target?: EventTarget;
	}): void => {
		act(() => {
			target.dispatchEvent(
				new KeyboardEvent('keydown', { key, shiftKey, ctrlKey, bubbles: true }),
			);
		});
	};

	it('undoes and redoes with keyboard shortcuts', () => {
		const { unmount } = renderHook(() => {
			useHistoryShortcuts();
		});
		useDesignStore
			.getState()
			.execute({ command: setZoneFinishCommand({ zoneId: 'frame', finish: 'matte' }) });

		press({ key: 'z' });
		expect(useDesignStore.getState().document.zones.frame.finish).toBe('gloss');

		press({ key: 'Z', shiftKey: true });
		expect(useDesignStore.getState().document.zones.frame.finish).toBe('matte');

		press({ key: 'z' });
		press({ key: 'y' });
		expect(useDesignStore.getState().document.zones.frame.finish).toBe('matte');

		unmount();
		press({ key: 'z' });
		expect(useDesignStore.getState().document.zones.frame.finish).toBe('matte');
	});

	it('ignores keys without a modifier, other keys and editable targets', () => {
		renderHook(() => {
			useHistoryShortcuts();
		});
		useDesignStore
			.getState()
			.execute({ command: setZoneFinishCommand({ zoneId: 'frame', finish: 'matte' }) });
		const input = document.createElement('input');
		document.body.append(input);

		press({ key: 'z', ctrlKey: false });
		press({ key: 'x' });
		press({ key: 'z', target: input });

		expect(useDesignStore.getState().document.zones.frame.finish).toBe('matte');
		input.remove();
	});

	it.each([
		['textarea', (): HTMLElement => document.createElement('textarea')],
		[
			'contenteditable',
			(): HTMLElement => {
				const element = document.createElement('div');
				element.contentEditable = 'true';
				Object.defineProperty(element, 'isContentEditable', { value: true });
				return element;
			},
		],
	])('ignores shortcuts typed into a %s', (_label, createTarget) => {
		renderHook(() => {
			useHistoryShortcuts();
		});
		useDesignStore
			.getState()
			.execute({ command: setZoneFinishCommand({ zoneId: 'frame', finish: 'matte' }) });
		const target = createTarget();
		document.body.append(target);

		press({ key: 'z', target });

		expect(useDesignStore.getState().document.zones.frame.finish).toBe('matte');
		target.remove();
	});

	it('still undoes while a radio, range or color control has focus', () => {
		renderHook(() => {
			useHistoryShortcuts();
		});
		useDesignStore
			.getState()
			.execute({ command: setZoneFinishCommand({ zoneId: 'frame', finish: 'matte' }) });
		const radio = document.createElement('input');
		radio.type = 'radio';
		document.body.append(radio);

		press({ key: 'z', target: radio });

		expect(useDesignStore.getState().document.zones.frame.finish).toBe('gloss');
		radio.remove();
	});
});
