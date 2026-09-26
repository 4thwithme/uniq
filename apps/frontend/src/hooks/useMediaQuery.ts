import { useEffect, useState } from 'react';

const hasMatchMedia = (): boolean =>
	typeof window !== 'undefined' && typeof window.matchMedia === 'function';

const getMatches = ({ query }: { query: string }): boolean =>
	hasMatchMedia() && window.matchMedia(query).matches;

export const useMediaQuery = ({ query }: { query: string }): boolean => {
	const [matches, setMatches] = useState(() => getMatches({ query }));

	useEffect(() => {
		if (!hasMatchMedia()) {
			return;
		}
		const list = window.matchMedia(query);
		const onChange = (): void => {
			setMatches(list.matches);
		};
		onChange();
		list.addEventListener('change', onChange);
		return (): void => {
			list.removeEventListener('change', onChange);
		};
	}, [query]);

	return matches;
};
