import { useId } from 'react';

import styles from '@components/Slider/Slider.module.scss';

interface SliderProps {
	label: string;
	value: number;
	min: number;
	max: number;
	step?: number | undefined;
	unit?: string | undefined;
	isDisabled?: boolean | undefined;
	onChange: (params: { value: number }) => void;
}

export function Slider({
	label,
	value,
	min,
	max,
	step = 1,
	unit = '',
	isDisabled = false,
	onChange,
}: SliderProps): React.JSX.Element {
	const id = useId();
	const valueText = `${String(value)}${unit}`;

	return (
		<div className={styles.root}>
			<label className={styles.label} htmlFor={id}>
				{label}
			</label>
			<output className={styles.value} htmlFor={id}>
				{valueText}
			</output>
			<input
				id={id}
				className={styles.input}
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				disabled={isDisabled}
				aria-valuetext={valueText}
				onChange={(event) => {
					onChange({ value: Number(event.currentTarget.value) });
				}}
			/>
		</div>
	);
}
