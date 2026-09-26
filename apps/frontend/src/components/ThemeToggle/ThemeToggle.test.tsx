import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeToggle } from '@components/ThemeToggle/ThemeToggle';

import { useThemeStore } from '@store/theme-store';

describe('ThemeToggle', () => {
	it('switches between dark and light mode', async () => {
		const user = userEvent.setup();
		render(<ThemeToggle />);

		await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));

		expect(useThemeStore.getState().theme).toBe('light');
		expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toHaveTextContent(
			'Dark',
		);
	});
});
