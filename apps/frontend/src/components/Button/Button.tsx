import styles from '@components/Button/Button.module.scss';

import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
	variant?: ButtonVariant | undefined;
	size?: ButtonSize | undefined;
	type?: 'button' | 'submit' | undefined;
}

export function Button({
	variant = 'secondary',
	size = 'md',
	type = 'button',
	className,
	...rest
}: ButtonProps): React.JSX.Element {
	return (
		<button
			{...rest}
			type={type === 'submit' ? 'submit' : 'button'}
			className={
				className === undefined ? styles.button : `${styles.button} ${className}`
			}
			data-variant={variant}
			data-size={size}
		/>
	);
}
