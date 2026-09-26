import styles from '@components/Switch/Switch.module.scss';

interface SwitchProps {
	label: string;
	checked: boolean;
	onChange: (params: { checked: boolean }) => void;
	isDisabled?: boolean | undefined;
}

export function Switch({
	label,
	checked,
	onChange,
	isDisabled = false,
}: SwitchProps): React.JSX.Element {
	return (
		<button
			type="button"
			role="switch"
			className={styles.root}
			aria-checked={checked}
			disabled={isDisabled}
			onClick={() => {
				onChange({ checked: !checked });
			}}
		>
			<span className={styles.track} aria-hidden="true">
				<span className={styles.thumb} />
			</span>
			{label}
		</button>
	);
}
