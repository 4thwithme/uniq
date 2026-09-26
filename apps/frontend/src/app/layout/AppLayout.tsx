import { Outlet } from 'react-router';

import styles from '@app/layout/AppLayout.module.scss';

export function AppLayout(): React.JSX.Element {
	return (
		<main className={styles.shell}>
			<Outlet />
		</main>
	);
}
