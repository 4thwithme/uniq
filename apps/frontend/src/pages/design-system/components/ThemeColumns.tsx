import styles from '@pages/design-system/DesignSystemPage.module.scss';

import type { ColorTheme } from '@store/theme-store';
import type { ReactNode } from 'react';

const THEMES: readonly ColorTheme[] = ['dark', 'light'];

interface ThemeColumnsProps {
	children: (params: { theme: ColorTheme }) => ReactNode;
}

export function ThemeColumns({ children }: ThemeColumnsProps): React.JSX.Element {
	return (
		<div className={styles.themeColumns}>
			{THEMES.map((theme) => (
				<div key={theme} className={styles.themeColumn} data-theme={theme}>
					<p className={styles.themeLabel}>{theme === 'dark' ? 'Dark' : 'Light'}</p>
					{children({ theme })}
				</div>
			))}
		</div>
	);
}
