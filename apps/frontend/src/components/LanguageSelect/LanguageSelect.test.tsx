import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LanguageSelect } from '@components/LanguageSelect/LanguageSelect';

import { LANGUAGE_STORAGE_KEY, useLanguageStore } from '@store/language-store';

describe('LanguageSelect', () => {
	it('switches the design language from the dropdown and stores it', async () => {
		const user = userEvent.setup();
		render(<LanguageSelect />);
		const trigger = screen.getByRole('combobox', { name: 'Design language' });

		expect(trigger).toHaveTextContent('HEAD');
		await user.click(trigger);
		await user.click(screen.getByRole('option', { name: /UNIQ Studio/u }));

		expect(useLanguageStore.getState().language).toBe('uniq');
		expect(document.documentElement.dataset['language']).toBe('uniq');
		expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('uniq');
		expect(trigger).toHaveTextContent('UNIQ Studio');
	});
});
