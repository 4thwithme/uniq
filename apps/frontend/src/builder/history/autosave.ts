import { upgradeDesignDocument } from '@uniq/shared';

import type { DesignDocument } from '@uniq/shared';

export const AUTOSAVE_STORAGE_KEY = 'uniq:builder:draft:v1';
export const AUTOSAVE_DEBOUNCE_MS = 500;

export const loadDraft = ({
	storage,
}: {
	storage: Storage | undefined;
}): DesignDocument | null => {
	try {
		const raw = storage?.getItem(AUTOSAVE_STORAGE_KEY);

		if (raw === undefined || raw === null) {
			return null;
		}

		const parsed: unknown = JSON.parse(raw);

		return upgradeDesignDocument(parsed);
	} catch {
		return null;
	}
};

export const saveDraft = ({
	storage,
	document,
}: {
	storage: Storage | undefined;
	document: DesignDocument;
}): boolean => {
	try {
		storage?.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(document));
		return storage !== undefined;
	} catch {
		return false;
	}
};

export const getBrowserStorage = (): Storage | undefined => {
	try {
		return window.localStorage;
	} catch {
		return undefined;
	}
};
