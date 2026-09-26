import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import { PageLayout } from '@components/PageLayout/PageLayout';
import styles from '@components/PageLayout/PageLayout.module.scss';

export function RouteError(): React.JSX.Element {
	const error = useRouteError();
	const message = isRouteErrorResponse(error)
		? `${String(error.status)} ${error.statusText}`
		: 'Something went wrong.';

	return (
		<PageLayout title="Something went wrong" subtitle={message}>
			<Link to="/" className={styles.button}>
				Back to builder
			</Link>
		</PageLayout>
	);
}
