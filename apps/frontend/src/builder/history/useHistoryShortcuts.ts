import { useEffect } from 'react';

import { useDesignStore } from '@builder/store/design-store';

const TEXT_INPUT_TYPES = new Set([
	'text',
	'search',
	'email',
	'url',
	'tel',
	'password',
	'number',
]);

const isEditableTarget = ({ target }: { target: EventTarget | null }): boolean => {
	if (!(target instanceof HTMLElement)) {
		return false;
	}

	if (target.isContentEditable || target instanceof HTMLTextAreaElement) {
		return true;
	}

	return target instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(target.type);
};

export function useHistoryShortcuts(): void {
	useEffect(() => {
		// eslint-disable-next-line custom-rules/require-object-params
		const onKeyDown = (event: KeyboardEvent): void => {
			const hasModifier = event.metaKey || event.ctrlKey;

			if (!hasModifier || isEditableTarget({ target: event.target })) {
				return;
			}

			const key = event.key.toLowerCase();
			const { undo, redo } = useDesignStore.getState();

			if (key === 'z' && !event.shiftKey) {
				event.preventDefault();
				undo();
			} else if ((key === 'z' && event.shiftKey) || key === 'y') {
				event.preventDefault();
				redo();
			}
		};

		window.addEventListener('keydown', onKeyDown);

		return (): void => {
			window.removeEventListener('keydown', onKeyDown);
		};
	}, []);
}
