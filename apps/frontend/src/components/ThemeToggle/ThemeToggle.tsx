import { withViewTransition } from '@app/view-transition';

import { Button } from '@components/Button/Button';

import { useThemeStore } from '@store/theme-store';

export function ThemeToggle(): React.JSX.Element {
	const theme = useThemeStore((state) => state.theme);
	const toggleTheme = useThemeStore((state) => state.toggleTheme);
	const next = theme === 'dark' ? 'light' : 'dark';

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => {
				withViewTransition({ update: toggleTheme });
			}}
			aria-label={`Switch to ${next} mode`}
		>
			{theme === 'dark' ? 'Light' : 'Dark'}
		</Button>
	);
}
