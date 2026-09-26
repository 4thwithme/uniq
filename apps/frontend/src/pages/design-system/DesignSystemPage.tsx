import { Link } from 'react-router';

import { ColorSection } from '@pages/design-system/components/ColorSection';
import { ComponentGallery } from '@pages/design-system/components/ComponentGallery';
import {
	ElevationSection,
	MotionSection,
	ShapeSection,
	SpacingSection,
	TypographySection,
} from '@pages/design-system/components/FoundationSections';
import styles from '@pages/design-system/DesignSystemPage.module.scss';

import { LanguageSelect } from '@components/LanguageSelect/LanguageSelect';
import { ThemeToggle } from '@components/ThemeToggle/ThemeToggle';

import type { ReactNode } from 'react';

const SECTIONS = [
	{ id: 'color', title: 'Color', Content: ColorSection },
	{ id: 'type', title: 'Typography', Content: TypographySection },
	{ id: 'spacing', title: 'Spacing', Content: SpacingSection },
	{ id: 'shape', title: 'Shape', Content: ShapeSection },
	{ id: 'elevation', title: 'Elevation', Content: ElevationSection },
	{ id: 'motion', title: 'Motion', Content: MotionSection },
	{ id: 'components', title: 'Components', Content: ComponentGallery },
] as const;

function Section({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: ReactNode;
}): React.JSX.Element {
	return (
		<section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
			<h2 id={`${id}-title`} className={styles.sectionTitle}>
				{title}
			</h2>
			{children}
		</section>
	);
}

export function DesignSystemPage(): React.JSX.Element {
	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<div className={styles.brand}>
					<span className={styles.logo}>UNIQ</span>
					<h1 className={styles.title}>Design system</h1>
				</div>
				<div className={styles.headerActions}>
					<Link to="/" className={styles.backLink} viewTransition>
						Open builder
					</Link>
					<LanguageSelect />
					<ThemeToggle />
				</div>
			</header>
			<div className={styles.layout}>
				<nav className={styles.nav} aria-label="Design system sections">
					<ul className={styles.navList}>
						{SECTIONS.map((section) => (
							<li key={section.id}>
								<a className={styles.navLink} href={`#${section.id}`}>
									{section.title}
								</a>
							</li>
						))}
					</ul>
				</nav>
				<div className={styles.content}>
					<p className={styles.intro}>
						Pro studio tool: quiet, precise chrome so the racket paint is the only loud
						thing on screen. Grass green marks the one primary action. Sharp corners, 1px
						hairlines, one shadow for layers that float over the scene. Rules live in{' '}
						<code>DESIGN.md</code>.
					</p>
					{SECTIONS.map(({ id, title, Content }) => (
						<Section key={id} id={id} title={title}>
							<Content />
						</Section>
					))}
				</div>
			</div>
		</div>
	);
}
