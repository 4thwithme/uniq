import { DEFAULT_GRIP } from '@uniq/shared';

import { createDefaultDesign } from '@builder/design/default-design';
import {
	AUTOSAVE_STORAGE_KEY,
	getBrowserStorage,
	loadDraft,
	saveDraft,
} from '@builder/history/autosave';

describe('autosave', () => {
	it('saves and loads a valid draft', () => {
		const document = createDefaultDesign();

		expect(saveDraft({ storage: window.localStorage, document })).toBe(true);
		expect(loadDraft({ storage: window.localStorage })).toEqual(document);
	});

	it('upgrades a stored v1 draft to v3', () => {
		const v1 = {
			schemaVersion: 1,
			racketModelId: 'classic-100',
			zones: {
				...createDefaultDesign().zones,
				handle: { finish: 'matte', fill: { kind: 'solid', color: '#1d1f24' } },
			},
			meta: { name: 'Old design', themeId: 'volt' },
		};
		window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(v1));

		const defaultDesign = createDefaultDesign();

		expect(loadDraft({ storage: window.localStorage })).toEqual({
			...defaultDesign,
			grip: { ...defaultDesign.grip, overgrip: DEFAULT_GRIP.overgrip },
			overlays: {
				...defaultDesign.overlays,
				frame: { ...defaultDesign.overlays.frame, print: null },
			},
			finishingTape: null,
			meta: { name: 'Old design', themeId: 'volt' },
		});
	});

	it('returns null for a missing, invalid or unparsable draft', () => {
		expect(loadDraft({ storage: window.localStorage })).toBeNull();

		window.localStorage.setItem(
			AUTOSAVE_STORAGE_KEY,
			JSON.stringify({ schemaVersion: 99 }),
		);
		expect(loadDraft({ storage: window.localStorage })).toBeNull();

		window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, '{not json');
		expect(loadDraft({ storage: window.localStorage })).toBeNull();
	});

	it('handles missing storage', () => {
		expect(loadDraft({ storage: undefined })).toBeNull();
		expect(saveDraft({ storage: undefined, document: createDefaultDesign() })).toBe(
			false,
		);
	});

	it('returns false when storage throws', () => {
		const storage = {
			setItem: (): never => {
				throw new Error('quota');
			},
		} as unknown as Storage;

		expect(saveDraft({ storage, document: createDefaultDesign() })).toBe(false);
	});

	it('returns undefined when localStorage is blocked', () => {
		const spy = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
			throw new Error('blocked');
		});

		expect(getBrowserStorage()).toBeUndefined();
		spy.mockRestore();
	});

	it('returns window.localStorage when available', () => {
		expect(getBrowserStorage()).toBe(window.localStorage);
	});
});
