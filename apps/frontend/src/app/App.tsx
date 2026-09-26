import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { appRoutes } from '@app/routes';

const router = createBrowserRouter(appRoutes, { basename: import.meta.env.BASE_URL });

export function App(): React.JSX.Element {
	return <RouterProvider router={router} />;
}
