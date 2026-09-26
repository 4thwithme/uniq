import { useEffect } from 'react';

import {
	AUTOSAVE_DEBOUNCE_MS,
	getBrowserStorage,
	loadDraft,
	saveDraft,
} from '@builder/history/autosave';
import { useDesignStore } from '@builder/store/design-store';

export function useDesignAutosave(): void {
	useEffect(() => {
		const storage = getBrowserStorage();
		const draft = loadDraft({ storage });

		if (draft) {
			useDesignStore.getState().loadDocument({ document: draft });
		}

		let timeoutId: ReturnType<typeof setTimeout> | undefined;

		const unsubscribe = useDesignStore.subscribe((state, previousState) => {
			if (state.document === previousState.document) {
				return;
			}

			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				saveDraft({ storage, document: state.document });
			}, AUTOSAVE_DEBOUNCE_MS);
		});

		return (): void => {
			clearTimeout(timeoutId);
			unsubscribe();
		};
	}, []);
}
