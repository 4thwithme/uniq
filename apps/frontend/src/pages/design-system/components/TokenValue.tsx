import { useLayoutEffect, useRef, useState } from 'react';

import type { ColorTheme } from '@store/theme-store';

interface TokenValueProps {
	name: string;
	theme?: ColorTheme | undefined;
	className?: string | undefined;
}

export function TokenValue({
	name,
	theme,
	className,
}: TokenValueProps): React.JSX.Element {
	const ref = useRef<HTMLElement>(null);
	const [value, setValue] = useState('');

	useLayoutEffect(() => {
		const element = ref.current;
		if (element) {
			setValue(getComputedStyle(element).getPropertyValue(name).trim());
		}
	}, [name, theme]);

	return (
		<code ref={ref} className={className}>
			{value === '' ? '—' : value}
		</code>
	);
}
