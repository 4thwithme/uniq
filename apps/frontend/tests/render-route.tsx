import { render } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { appRoutes } from '@app/routes';

import type { RenderResult } from '@testing-library/react';

export const renderRoute = ({
	path,
}: {
	path: string;
}): RenderResult & { router: ReturnType<typeof createMemoryRouter> } => {
	const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

	return { ...render(<RouterProvider router={router} />), router };
};
