import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { COLOR_TOKEN_GROUPS } from '@styles/design-tokens';

import { renderRoute } from '@tests/render-route';

describe('DesignSystemPage', () => {
	it('renders tokens and components for both themes', async () => {
		renderRoute({ path: '/design-system' });

		expect(
			await screen.findByRole(
				'heading',
				{ level: 1, name: 'Design system' },
				{ timeout: 5000 },
			),
		).toBeInTheDocument();
		[
			'Color',
			'Typography',
			'Spacing',
			'Shape',
			'Elevation',
			'Motion',
			'Components',
		].forEach((title) => {
			expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
		});
		const tokenCount = COLOR_TOKEN_GROUPS.flatMap((group) => group.tokens).length;
		expect(screen.getAllByText('--color-accent')).toHaveLength(2);
		expect(
			document.querySelectorAll('[data-theme="dark"] [class*="swatchRow"]'),
		).toHaveLength(tokenCount);
		expect(document.querySelectorAll('[data-theme="light"]').length).toBeGreaterThan(0);
		expect(screen.getByRole('link', { name: 'Open builder' })).toHaveAttribute(
			'href',
			'/',
		);
	});

	it('shares interactive state across the theme columns', async () => {
		const user = userEvent.setup();
		renderRoute({ path: '/design-system' });
		await screen.findByRole(
			'heading',
			{ level: 1, name: 'Design system' },
			{ timeout: 5000 },
		);

		const [darkColumn, lightColumn] = [
			document.querySelector<HTMLElement>('[data-theme="dark"]:has([class*="gallery"])'),
			document.querySelector<HTMLElement>('[data-theme="light"]:has([class*="gallery"])'),
		];
		if (!darkColumn || !lightColumn) {
			throw new Error('expected both gallery columns');
		}

		await user.click(within(darkColumn).getAllByRole('radio', { name: 'Matte' })[0]!);
		expect(within(lightColumn).getAllByRole('radio', { name: 'Matte' })[0]).toBeChecked();

		await user.click(within(darkColumn).getByRole('button', { name: 'Snap' }));
		expect(within(lightColumn).getByRole('button', { name: 'Snap' })).toHaveAttribute(
			'aria-pressed',
			'true',
		);

		await user.click(
			within(darkColumn).getByRole('switch', { name: 'Mirror left and right' }),
		);
		expect(
			within(lightColumn).getByRole('switch', { name: 'Mirror left and right' }),
		).toHaveAttribute('aria-checked', 'false');

		await user.type(
			within(darkColumn).getByRole('textbox', { name: 'Design name' }),
			'A',
		);
		expect(within(lightColumn).getByRole('textbox', { name: 'Design name' })).toHaveValue(
			'A',
		);
	});

	it('replays the enter animations', async () => {
		const user = userEvent.setup();
		renderRoute({ path: '/design-system' });
		await screen.findByRole(
			'heading',
			{ level: 1, name: 'Design system' },
			{ timeout: 5000 },
		);
		const before = document.querySelector('[data-animation="rise"]');

		await user.click(screen.getByRole('button', { name: 'Replay' }));

		expect(document.querySelector('[data-animation="rise"]')).not.toBe(before);
		expect(screen.getByText('Menus and dropdown lists')).toBeInTheDocument();
	});
});
