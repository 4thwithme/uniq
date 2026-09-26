import {
	applyLanguage,
	LANGUAGE_STORAGE_KEY,
	readInitialLanguage,
} from '@store/language-store';

describe('language store', () => {
	it('defaults to uniq', () => {
		expect(readInitialLanguage()).toBe('uniq');
	});

	it('reads a stored language and ignores unknown values', () => {
		window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'head');
		expect(readInitialLanguage()).toBe('head');

		window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'nike');
		expect(readInitialLanguage()).toBe('uniq');
	});

	it('falls back when storage throws', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		expect(readInitialLanguage()).toBe('uniq');
		applyLanguage({ language: 'head' });
		expect(document.documentElement.dataset['language']).toBe('head');
	});
});
