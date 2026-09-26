import { useId, useState } from 'react';

import styles from '@components/FileDrop/FileDrop.module.scss';

import type { DragEvent } from 'react';

interface FileDropProps {
	label: string;
	hint: string;
	accept: string;
	error?: string | null | undefined;
	onFile: (params: { file: File }) => void;
}

export function FileDrop({
	label,
	hint,
	accept,
	error,
	onFile,
}: FileDropProps): React.JSX.Element {
	const id = useId();
	const [isOver, setIsOver] = useState(false);
	const hasError = error !== undefined && error !== null;

	// eslint-disable-next-line custom-rules/require-object-params
	const onDrop = (event: DragEvent<HTMLLabelElement>): void => {
		event.preventDefault();
		setIsOver(false);
		const file = event.dataTransfer.files.item(0);
		if (file !== null) {
			onFile({ file });
		}
	};

	return (
		<div className={styles.root}>
			{/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
			<label
				htmlFor={id}
				className={styles.zone}
				data-over={isOver}
				data-invalid={hasError}
				onDragOver={(event) => {
					event.preventDefault();
					setIsOver(true);
				}}
				onDragLeave={() => {
					setIsOver(false);
				}}
				onDrop={onDrop}
			>
				<span className={styles.label}>{label}</span>
				<span className={styles.hint}>{hint}</span>
				<input
					id={id}
					className={styles.input}
					type="file"
					accept={accept}
					aria-invalid={hasError}
					aria-describedby={hasError ? `${id}-error` : undefined}
					onChange={(event) => {
						const file = event.currentTarget.files?.item(0) ?? null;
						if (file !== null) {
							onFile({ file });
						}
						const input = event.currentTarget;
						input.value = '';
					}}
				/>
			</label>
			{hasError ? (
				<p id={`${id}-error`} className={styles.error} role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}
