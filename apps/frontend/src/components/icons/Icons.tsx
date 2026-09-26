import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...rest }: IconProps): React.JSX.Element {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="square"
			aria-hidden="true"
			focusable="false"
			{...rest}
		>
			{children}
		</svg>
	);
}

export function UndoIcon({ ...props }: IconProps): React.JSX.Element {
	return (
		<IconBase {...props}>
			<path d="M5 3 2 6l3 3" />
			<path d="M2.5 6H10a4 4 0 0 1 0 8H7" />
		</IconBase>
	);
}

export function RedoIcon({ ...props }: IconProps): React.JSX.Element {
	return (
		<IconBase {...props}>
			<path d="m11 3 3 3-3 3" />
			<path d="M13.5 6H6a4 4 0 0 0 0 8h3" />
		</IconBase>
	);
}

export function CloseIcon({ ...props }: IconProps): React.JSX.Element {
	return (
		<IconBase {...props}>
			<path d="m4 4 8 8M12 4l-8 8" />
		</IconBase>
	);
}

export function PlusIcon({ ...props }: IconProps): React.JSX.Element {
	return (
		<IconBase {...props}>
			<path d="M8 3v10M3 8h10" />
		</IconBase>
	);
}

export function SidebarIcon({ ...props }: IconProps): React.JSX.Element {
	return (
		<IconBase {...props}>
			<path d="M2.5 2.5h11v11h-11z" />
			<path d="M10 2.5v11" />
		</IconBase>
	);
}

export function ChevronDownIcon({ ...props }: IconProps): React.JSX.Element {
	return (
		<IconBase {...props}>
			<path d="m4 6 4 4 4-4" />
		</IconBase>
	);
}

export function CheckIcon({ ...props }: IconProps): React.JSX.Element {
	return (
		<IconBase {...props}>
			<path d="m3.5 8.5 3 3 6-7" />
		</IconBase>
	);
}
