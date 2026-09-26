import { withViewTransition } from '@app/view-transition';

import { Select } from '@components/Select/Select';

import { DESIGN_LANGUAGES, useLanguageStore } from '@store/language-store';

interface LanguageSelectProps {
	align?: 'start' | 'end' | undefined;
}

export function LanguageSelect({
	align = 'end',
}: LanguageSelectProps): React.JSX.Element {
	const language = useLanguageStore((state) => state.language);
	const setLanguage = useLanguageStore((state) => state.setLanguage);

	return (
		<Select
			label="Design language"
			isLabelHidden
			size="sm"
			align={align}
			options={DESIGN_LANGUAGES}
			value={language}
			onChange={({ value }) => {
				withViewTransition({
					update: () => {
						setLanguage({ language: value });
					},
				});
			}}
		/>
	);
}
