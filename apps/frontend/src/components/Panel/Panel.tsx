import { useId } from 'react';

import styles from '@components/Panel/Panel.module.scss';

import type { ReactNode } from 'react';

interface PanelProps {
	title: string;
	children: ReactNode;
	actions?: ReactNode;
	footer?: ReactNode;
	elevation?: 'flat' | 'float' | undefined;
	className?: string | undefined;
}

export function Panel({
	title,
	children,
	actions,
	footer,
	elevation = 'flat',
	className,
}: PanelProps): React.JSX.Element {
	const titleId = useId();

	return (
		<section
			className={className === undefined ? styles.panel : `${styles.panel} ${className}`}
			data-elevation={elevation}
			aria-labelledby={titleId}
		>
			<header className={styles.header}>
				<h2 id={titleId} className={styles.title}>
					{title}
				</h2>
				{actions === undefined ? null : <div className={styles.actions}>{actions}</div>}
			</header>
			<div className={styles.body}>{children}</div>
			{footer === undefined ? null : <footer className={styles.footer}>{footer}</footer>}
		</section>
	);
}
