import { create } from 'zustand';

export type ColorTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'uniq:theme:v1';

const COLOR_THEMES: readonly ColorTheme[] = ['dark', 'light'];

const toColorTheme = ({ value }: { value: string | null }): ColorTheme | null =>
	COLOR_THEMES.find((theme) => theme === value) ?? null;

export const readInitialTheme = (): ColorTheme => {
	try {
		const stored = toColorTheme({
			value: window.localStorage.getItem(THEME_STORAGE_KEY),
		});
		if (stored !== null) {
			return stored;
		}
	} catch {
		return 'dark';
	}
	if (typeof window.matchMedia !== 'function') {
		return 'dark';
	}
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = ({ theme }: { theme: ColorTheme }): void => {
	document.documentElement.dataset['theme'] = theme;
	try {
		window.localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		return;
	}
};

interface ThemeState {
	theme: ColorTheme;
	setTheme: (params: { theme: ColorTheme }) => void;
	toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
	theme: readInitialTheme(),
	setTheme: ({ theme }) => {
		applyTheme({ theme });
		set({ theme });
	},
	toggleTheme: () => {
		get().setTheme({ theme: get().theme === 'dark' ? 'light' : 'dark' });
	},
}));
