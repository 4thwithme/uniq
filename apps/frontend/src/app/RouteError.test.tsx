import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { RouteError } from '@app/RouteError';

const renderThrowing = ({ error }: { error: unknown }): void => {
	const router = createMemoryRouter(
		[
			{
				path: '/',
				ErrorBoundary: RouteError,
				loader: (): never => {
					throw error;
				},
				Component: (): null => null,
			},
		],
		{ initialEntries: ['/'] },
	);

	render(<RouterProvider router={router} />);
};

describe('RouteError', () => {
	it('shows the status of a route error response', async () => {
		renderThrowing({
			error: new Response(null, { status: 404, statusText: 'Not Found' }),
		});

		expect(await screen.findByText('404 Not Found')).toBeInTheDocument();
	});

	it('shows a generic message for other errors', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		renderThrowing({ error: new Error('boom') });

		expect(await screen.findByText('Something went wrong.')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Back to builder' })).toHaveAttribute(
			'href',
			'/',
		);
	});
});
