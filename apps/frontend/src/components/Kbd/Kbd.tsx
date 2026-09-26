import styles from '@components/Kbd/Kbd.module.scss';

import type { ReactNode } from 'react';

export function Kbd({ children }: { children: ReactNode }): React.JSX.Element {
	return <kbd className={styles.kbd}>{children}</kbd>;
}
