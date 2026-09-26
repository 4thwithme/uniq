import styles from '@components/SegmentedControl/SegmentedControl.module.scss';

export interface SegmentedOption<T extends string> {
	value: T;
	label: string;
}

interface SegmentedControlProps<T extends string> {
	legend: string;
	name: string;
	options: readonly SegmentedOption<T>[];
	value: T;
	onChange: (params: { value: T }) => void;
	isLegendHidden?: boolean | undefined;
}

export function SegmentedControl<T extends string>({
	legend,
	name,
	options,
	value,
	onChange,
	isLegendHidden = false,
}: SegmentedControlProps<T>): React.JSX.Element {
	return (
		<fieldset className={styles.root}>
			<legend className={styles.legend} data-hidden={isLegendHidden}>
				{legend}
			</legend>
			<div className={styles.track}>
				{options.map((option) => (
					<label key={option.value} className={styles.option}>
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
						{option.label}
					</label>
				))}
			</div>
		</fieldset>
	);
}
