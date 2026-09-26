import styles from '@components/SwatchGrid/SwatchGrid.module.scss';

import type { ReactNode } from 'react';

export interface SwatchOption<T extends string> {
	value: T;
	label: string;
	preview: ReactNode;
}

interface SwatchGridProps<T extends string> {
	legend: string;
	name: string;
	options: readonly SwatchOption<T>[];
	value: T | null;
	onChange: (params: { value: T }) => void;
	columns?: 1 | 3 | 4 | undefined;
}

export function SwatchGrid<T extends string>({
	legend,
	name,
	options,
	value,
	onChange,
	columns = 3,
}: SwatchGridProps<T>): React.JSX.Element {
	return (
		<fieldset className={styles.root}>
			<legend className={styles.legend}>{legend}</legend>
			<div className={styles.grid} data-columns={columns}>
				{options.map((option) => (
					<label key={option.value} className={styles.tile}>
						<input
							className={styles.input}
							type="radio"
							name={name}
							value={option.value}
							checked={option.value === value}
							onChange={() => {
								onChange({ value: option.value });
							}}
						/>
						<span className={styles.preview} aria-hidden="true">
							{option.preview}
						</span>
						<span className={styles.label}>{option.label}</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}
