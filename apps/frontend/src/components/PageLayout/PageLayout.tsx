import styles from '@components/PageLayout/PageLayout.module.scss';

interface PageLayoutProps {
	title: string;
	subtitle?: string | undefined;
	children: React.ReactNode;
}

export function PageLayout({
	title,
	subtitle,
	children,
}: PageLayoutProps): React.JSX.Element {
	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<h1 className={styles.title}>{title}</h1>
				{subtitle === undefined ? null : <p className={styles.subtitle}>{subtitle}</p>}
			</header>
			{children}
		</div>
	);
}
