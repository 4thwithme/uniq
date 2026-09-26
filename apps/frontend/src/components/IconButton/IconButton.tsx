import { Button } from '@components/Button/Button';
import styles from '@components/IconButton/IconButton.module.scss';

import type { ButtonSize, ButtonVariant } from '@components/Button/Button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	'type' | 'children' | 'aria-label'
> {
	label: string;
	children: ReactNode;
	variant?: ButtonVariant | undefined;
	size?: ButtonSize | undefined;
}

export function IconButton({
	label,
	children,
	variant = 'ghost',
	size = 'md',
	...rest
}: IconButtonProps): React.JSX.Element {
	return (
		<Button
			{...rest}
			variant={variant}
			size={size}
			className={styles.iconButton}
			aria-label={label}
			title={label}
		>
			{children}
		</Button>
	);
}
