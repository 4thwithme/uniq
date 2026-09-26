import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@app/App';

import { applyLanguage, useLanguageStore } from '@store/language-store';
import { applyTheme, useThemeStore } from '@store/theme-store';

import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource-variable/instrument-sans/wght.css';
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/fraunces/wght.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import '@styles/global.scss';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Root element #root not found');
}

applyTheme({ theme: useThemeStore.getState().theme });
applyLanguage({ language: useLanguageStore.getState().language });

createRoot(rootElement).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
