import { Navigate } from 'react-router';

import { AppLayout } from '@app/layout/AppLayout';
import { RouteError } from '@app/RouteError';

import type { RouteObject } from 'react-router';

export const appRoutes: RouteObject[] = [
	{
		path: '/',
		Component: AppLayout,
		ErrorBoundary: RouteError,
		children: [
			{
				index: true,
				lazy: async () => ({
					Component: (await import('@pages/builder/BuilderPage')).BuilderPage,
				}),
			},
			{
				path: 'design-system',
				lazy: async () => ({
					Component: (await import('@pages/design-system/DesignSystemPage'))
						.DesignSystemPage,
				}),
			},
			{
				path: '*',
				element: <Navigate to="/" replace />,
			},
		],
	},
];
