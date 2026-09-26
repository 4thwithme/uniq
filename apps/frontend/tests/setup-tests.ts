import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

import { useDesignStore } from '@builder/store/design-store';

import { useLanguageStore } from '@store/language-store';
import { useThemeStore } from '@store/theme-store';

afterEach(() => {
	cleanup();
	useDesignStore.getState().reset();
	useThemeStore.setState({ theme: 'dark' });
	delete document.documentElement.dataset['theme'];
	useLanguageStore.setState({ language: 'uniq' });
	delete document.documentElement.dataset['language'];
	window.localStorage.clear();
});
