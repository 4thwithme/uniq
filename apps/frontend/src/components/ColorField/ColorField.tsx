import { isHexColor } from '@uniq/shared';
import { useId, useState } from 'react';

import styles from '@components/ColorField/ColorField.module.scss';

interface ColorFieldProps {
	label: string;
	value: string;
	onChange: (params: { value: string }) => void;
}

const normalizeHex = ({ text }: { text: string }): string => {
	const trimmed = text.trim().toLowerCase();
	return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

export function ColorField({
	label,
	value,
	onChange,
}: ColorFieldProps): React.JSX.Element {
	const id = useId();
	const [draft, setDraft] = useState<string | null>(null);
	const text = draft ?? value;
	const isInvalid = draft !== null && !isHexColor(normalizeHex({ text: draft }));

	const commit = (): void => {
		if (draft === null) {
			return;
		}
		const next = normalizeHex({ text: draft });
		if (isHexColor(next)) {
			onChange({ value: next });
			setDraft(null);
		}
	};

	return (
		<div className={styles.root}>
			<label className={styles.label} htmlFor={id}>
				{label}
			</label>
			<div className={styles.row}>
				<input
					className={styles.swatch}
					type="color"
					value={value}
					aria-label={`${label} picker`}
					onChange={(event) => {
						setDraft(null);
						onChange({ value: event.currentTarget.value });
					}}
				/>
				<input
					id={id}
					className={styles.hex}
					type="text"
					value={text}
					spellCheck={false}
					autoComplete="off"
					maxLength={7}
					aria-invalid={isInvalid}
					aria-describedby={isInvalid ? `${id}-error` : undefined}
					onChange={(event) => {
						setDraft(event.currentTarget.value);
					}}
					onBlur={commit}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							commit();
						}
						if (event.key === 'Escape') {
							setDraft(null);
						}
					}}
				/>
			</div>
			{isInvalid ? (
				<span id={`${id}-error`} className={styles.error}>
					Use a 6-digit hex, like #1f7a3d
				</span>
			) : null}
		</div>
	);
}
