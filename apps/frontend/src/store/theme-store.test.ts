import {
	applyTheme,
	readInitialTheme,
	THEME_STORAGE_KEY,
	useThemeStore,
} from '@store/theme-store';

const mockMatchMedia = ({ matches }: { matches: boolean }): void => {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches })),
	);
};

describe('theme store', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('reads a stored theme first', () => {
		window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
		mockMatchMedia({ matches: false });

		expect(readInitialTheme()).toBe('light');
	});

	it('ignores an unknown stored value and follows the system', () => {
		window.localStorage.setItem(THEME_STORAGE_KEY, 'neon');
		mockMatchMedia({ matches: true });

		expect(readInitialTheme()).toBe('dark');
	});

	it('defaults to dark without matchMedia', () => {
		vi.stubGlobal('matchMedia', undefined);

		expect(readInitialTheme()).toBe('dark');
	});

	it('defaults to dark when storage throws', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		expect(readInitialTheme()).toBe('dark');
	});

	it('applies the theme even when storage throws', () => {
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('blocked');
		});

		applyTheme({ theme: 'light' });

		expect(document.documentElement.dataset['theme']).toBe('light');
	});

	it('toggles and persists the theme', () => {
		useThemeStore.getState().toggleTheme();

		expect(useThemeStore.getState().theme).toBe('light');
		expect(document.documentElement.dataset['theme']).toBe('light');
		expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

		useThemeStore.getState().toggleTheme();

		expect(useThemeStore.getState().theme).toBe('dark');
	});
});
