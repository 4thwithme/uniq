import { useEffect, useId, useRef, useState } from 'react';

import { CheckIcon, ChevronDownIcon } from '@components/icons/Icons';
import styles from '@components/Select/Select.module.scss';

import type { KeyboardEvent } from 'react';

export interface SelectOption<T extends string> {
	value: T;
	label: string;
	description?: string | undefined;
}

interface SelectProps<T extends string> {
	label: string;
	options: readonly SelectOption<T>[];
	value: T;
	onChange: (params: { value: T }) => void;
	isLabelHidden?: boolean | undefined;
	size?: 'sm' | 'md' | undefined;
	align?: 'start' | 'end' | undefined;
}

export function Select<T extends string>({
	label,
	options,
	value,
	onChange,
	isLabelHidden = false,
	size = 'md',
	align = 'start',
}: SelectProps<T>): React.JSX.Element {
	const id = useId();
	const labelId = `${id}-label`;
	const listId = `${id}-list`;
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const selectedIndex = Math.max(
		0,
		options.findIndex((option) => option.value === value),
	);
	const [activeIndex, setActiveIndex] = useState(selectedIndex);
	const selected = options[selectedIndex];

	const open = (): void => {
		setActiveIndex(selectedIndex);
		setIsOpen(true);
	};

	const close = (): void => {
		setIsOpen(false);
	};

	const choose = ({ index }: { index: number }): void => {
		const option = options[index];
		if (option) {
			onChange({ value: option.value });
		}
		close();
		triggerRef.current?.focus();
	};

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}
		// eslint-disable-next-line custom-rules/require-object-params
		const onPointerDown = (event: PointerEvent): void => {
			if (rootRef.current?.contains(event.target as Node) !== true) {
				setIsOpen(false);
			}
		};
		document.addEventListener('pointerdown', onPointerDown);
		return (): void => {
			document.removeEventListener('pointerdown', onPointerDown);
		};
	}, [isOpen]);

	// eslint-disable-next-line custom-rules/require-object-params
	const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
		const last = options.length - 1;
		switch (event.key) {
			case 'ArrowDown':
			case 'ArrowUp': {
				event.preventDefault();
				if (!isOpen) {
					open();
					return;
				}
				const step = event.key === 'ArrowDown' ? 1 : -1;
				setActiveIndex((current) => Math.min(last, Math.max(0, current + step)));
				return;
			}
			case 'Home':
			case 'End':
				if (isOpen) {
					event.preventDefault();
					setActiveIndex(event.key === 'Home' ? 0 : last);
				}
				return;
			case 'Enter':
			case ' ':
				event.preventDefault();
				if (isOpen) {
					choose({ index: activeIndex });
				} else {
					open();
				}
				return;
			case 'Escape':
				if (isOpen) {
					event.preventDefault();
					close();
				}
				return;
			case 'Tab':
				close();
				return;
			default:
				return;
		}
	};

	return (
		<div ref={rootRef} className={styles.root}>
			<span id={labelId} className={styles.label} data-hidden={isLabelHidden}>
				{label}
			</span>
			<button
				ref={triggerRef}
				type="button"
				role="combobox"
				className={styles.trigger}
				data-size={size}
				aria-labelledby={labelId}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-controls={listId}
				aria-activedescendant={isOpen ? `${id}-option-${String(activeIndex)}` : undefined}
				onClick={() => {
					if (isOpen) {
						close();
					} else {
						open();
					}
				}}
				onKeyDown={onKeyDown}
			>
				<span className={styles.value}>{selected?.label}</span>
				<ChevronDownIcon className={styles.chevron} />
			</button>
			<div
				id={listId}
				role="listbox"
				className={styles.list}
				data-align={align}
				aria-labelledby={labelId}
				hidden={!isOpen}
			>
				{options.map((option, index) => (
					// eslint-disable-next-line jsx-a11y/click-events-have-key-events
					<div
						key={option.value}
						tabIndex={-1}
						id={`${id}-option-${String(index)}`}
						role="option"
						className={styles.option}
						aria-selected={option.value === value}
						data-active={index === activeIndex}
						onPointerDown={(event) => {
							event.preventDefault();
						}}
						onPointerEnter={() => {
							setActiveIndex(index);
						}}
						onClick={() => {
							choose({ index });
						}}
					>
						<span className={styles.optionText}>
							<span className={styles.optionLabel}>{option.label}</span>
							{option.description === undefined ? null : (
								<span className={styles.optionDescription}>{option.description}</span>
							)}
						</span>
						{option.value === value ? <CheckIcon className={styles.check} /> : null}
					</div>
				))}
			</div>
		</div>
	);
}
