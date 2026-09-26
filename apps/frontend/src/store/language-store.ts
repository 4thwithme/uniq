import { create } from 'zustand';

export type DesignLanguage = 'uniq' | 'head' | 'velocity';

export const LANGUAGE_STORAGE_KEY = 'uniq:design-language:v1';

export const DESIGN_LANGUAGES: readonly {
	value: DesignLanguage;
	label: string;
	description: string;
}[] = [
	{ value: 'uniq', label: 'UNIQ Studio', description: 'Quiet pro tool, grass green' },
	{ value: 'head', label: 'HEAD', description: 'Inter, warm white, HEAD orange' },
	{ value: 'velocity', label: 'Velocity', description: 'Fraunces, cream, soft indigo' },
];

const toDesignLanguage = ({ value }: { value: string | null }): DesignLanguage | null =>
	DESIGN_LANGUAGES.find((language) => language.value === value)?.value ?? null;

export const readInitialLanguage = (): DesignLanguage => {
	try {
		return (
			toDesignLanguage({ value: window.localStorage.getItem(LANGUAGE_STORAGE_KEY) }) ??
			'head'
		);
	} catch {
		return 'head';
	}
};

export const applyLanguage = ({ language }: { language: DesignLanguage }): void => {
	document.documentElement.dataset['language'] = language;
	try {
		window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
	} catch {
		return;
	}
};

interface LanguageState {
	language: DesignLanguage;
	setLanguage: (params: { language: DesignLanguage }) => void;
}

export const useLanguageStore = create<LanguageState>()((set) => ({
	language: readInitialLanguage(),
	setLanguage: ({ language }) => {
		applyLanguage({ language });
		set({ language });
	},
}));
