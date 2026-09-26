import { screen } from '@testing-library/react';

import { renderRoute } from '@tests/render-route';

vi.mock('@builder/scene/BuilderCanvas', () => ({
	BuilderCanvas: (): React.JSX.Element => <div data-testid="builder-canvas" />,
}));

describe('app routes', () => {
	it('renders the builder at /', async () => {
		renderRoute({ path: '/' });

		expect(
			await screen.findByRole(
				'heading',
				{ level: 1, name: 'Make your HEAD unique' },
				{ timeout: 5000 },
			),
		).toBeInTheDocument();
		expect(await screen.findByTestId('builder-canvas')).toBeInTheDocument();
	});

	it.each(['/builder', '/cart', '/does-not-exist'])(
		'redirects %s to the builder',
		async (path) => {
			const { router } = renderRoute({ path });

			expect(
				await screen.findByRole(
					'heading',
					{ level: 1, name: 'Make your HEAD unique' },
					{ timeout: 5000 },
				),
			).toBeInTheDocument();
			expect(router.state.location.pathname).toBe('/');
		},
	);
});
