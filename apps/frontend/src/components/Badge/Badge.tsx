import styles from '@components/Badge/Badge.module.scss';

import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps {
	children: ReactNode;
	tone?: BadgeTone | undefined;
}

export function Badge({ children, tone = 'neutral' }: BadgeProps): React.JSX.Element {
	return (
		<span className={styles.badge} data-tone={tone}>
			{tone === 'neutral' ? null : <span className={styles.dot} aria-hidden="true" />}
			{children}
		</span>
	);
}
