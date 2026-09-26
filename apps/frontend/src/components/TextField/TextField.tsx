import { useId } from 'react';

import styles from '@components/TextField/TextField.module.scss';

interface TextFieldProps {
	label: string;
	value: string;
	onChange: (params: { value: string }) => void;
	placeholder?: string | undefined;
	hint?: string | undefined;
	error?: string | undefined;
	isDisabled?: boolean | undefined;
}

export function TextField({
	label,
	value,
	onChange,
	placeholder,
	hint,
	error,
	isDisabled = false,
}: TextFieldProps): React.JSX.Element {
	const id = useId();
	const message = error ?? hint;
	const messageId = `${id}-message`;

	return (
		<div className={styles.root}>
			<label className={styles.label} htmlFor={id}>
				{label}
			</label>
			<input
				id={id}
				className={styles.input}
				type="text"
				value={value}
				placeholder={placeholder}
				disabled={isDisabled}
				aria-invalid={error !== undefined}
				aria-describedby={message === undefined ? undefined : messageId}
				onChange={(event) => {
					onChange({ value: event.currentTarget.value });
				}}
			/>
			{message === undefined ? null : (
				<span
					id={messageId}
					className={styles.hint}
					data-tone={error === undefined ? 'hint' : 'error'}
				>
					{message}
				</span>
			)}
		</div>
	);
}
