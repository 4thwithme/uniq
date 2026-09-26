import type { DesignLanguage } from '@store/language-store';
import type { ColorTheme } from '@store/theme-store';

export interface SceneColors {
	background: string;
	gridCell: string;
	gridSection: string;
}

const FALLBACK_COLORS: Record<DesignLanguage, Record<ColorTheme, SceneColors>> = {
	uniq: {
		dark: { background: '#0e100e', gridCell: '#1d201d', gridSection: '#2f3430' },
		light: { background: '#edefed', gridCell: '#d6dad7', gridSection: '#bdc3bd' },
	},
	head: {
		dark: { background: '#121212', gridCell: '#1f1f21', gridSection: '#2e2e32' },
		light: { background: '#f4efed', gridCell: '#e6e0de', gridSection: '#d3cbc8' },
	},
	velocity: {
		dark: { background: '#13121a', gridCell: '#1f1e29', gridSection: '#2e2d3b' },
		light: { background: '#f2efe8', gridCell: '#e4e0d8', gridSection: '#d1ccc2' },
	},
};

const readVariable = ({
	styles,
	name,
	fallback,
}: {
	styles: CSSStyleDeclaration;
	name: string;
	fallback: string;
}): string => {
	const value = styles.getPropertyValue(name).trim();
	return value === '' ? fallback : value;
};

export const readSceneColors = ({
	theme,
	language,
}: {
	theme: ColorTheme;
	language: DesignLanguage;
}): SceneColors => {
	const fallback = FALLBACK_COLORS[language][theme];
	const styles = getComputedStyle(document.documentElement);

	return {
		background: readVariable({
			styles,
			name: '--scene-bg',
			fallback: fallback.background,
		}),
		gridCell: readVariable({
			styles,
			name: '--scene-grid-cell',
			fallback: fallback.gridCell,
		}),
		gridSection: readVariable({
			styles,
			name: '--scene-grid-section',
			fallback: fallback.gridSection,
		}),
	};
};
