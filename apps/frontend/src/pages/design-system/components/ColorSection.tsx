import { ThemeColumns } from '@pages/design-system/components/ThemeColumns';
import { TokenValue } from '@pages/design-system/components/TokenValue';
import styles from '@pages/design-system/DesignSystemPage.module.scss';

import { COLOR_TOKEN_GROUPS } from '@styles/design-tokens';

export function ColorSection(): React.JSX.Element {
	return (
		<ThemeColumns>
			{({ theme }) =>
				COLOR_TOKEN_GROUPS.map((group) => (
					<div key={group.title} className={styles.tokenGroup}>
						<h4 className={styles.groupTitle}>{group.title}</h4>
						<ul className={styles.swatchList}>
							{group.tokens.map((token) => (
								<li key={token.name} className={styles.swatchRow}>
									<span
										className={styles.swatch}
										style={{ background: `var(${token.name})` }}
										aria-hidden="true"
									/>
									<span className={styles.tokenMeta}>
										<code className={styles.tokenName}>{token.name}</code>
										<span className={styles.tokenUsage}>{token.usage}</span>
									</span>
									<TokenValue
										name={token.name}
										theme={theme}
										className={styles.tokenValue}
									/>
								</li>
							))}
						</ul>
					</div>
				))
			}
		</ThemeColumns>
	);
}
