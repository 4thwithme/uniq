import {
	applyLanguage,
	LANGUAGE_STORAGE_KEY,
	readInitialLanguage,
} from '@store/language-store';

describe('language store', () => {
	it('defaults to head', () => {
		expect(readInitialLanguage()).toBe('head');
	});

	it('reads a stored language and ignores unknown values', () => {
		window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'uniq');
		expect(readInitialLanguage()).toBe('uniq');

		window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'nike');
		expect(readInitialLanguage()).toBe('head');
	});

	it('falls back when storage throws', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		expect(readInitialLanguage()).toBe('head');
		applyLanguage({ language: 'uniq' });
		expect(document.documentElement.dataset['language']).toBe('uniq');
	});
});
