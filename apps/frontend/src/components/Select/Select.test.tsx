import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Select } from '@components/Select/Select';

const OPTIONS = [
	{ value: 'a', label: 'Alpha', description: 'First' },
	{ value: 'b', label: 'Beta' },
	{ value: 'c', label: 'Gamma' },
] as const;

const setup = (): { onChange: ReturnType<typeof vi.fn>; trigger: HTMLElement } => {
	const onChange = vi.fn();
	render(<Select label="Letter" options={OPTIONS} value="a" onChange={onChange} />);
	return { onChange, trigger: screen.getByRole('combobox', { name: 'Letter' }) };
};

describe('Select', () => {
	it('opens on click, shows the selection and picks with the mouse', async () => {
		const user = userEvent.setup();
		const { onChange, trigger } = setup();

		expect(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(screen.getByRole('listbox', { hidden: true })).not.toBeVisible();

		await user.click(trigger);
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(screen.getByRole('option', { name: /Alpha/u })).toHaveAttribute(
			'aria-selected',
			'true',
		);
		expect(screen.getByText('First')).toBeInTheDocument();

		await user.hover(screen.getByRole('option', { name: 'Gamma' }));
		await user.click(screen.getByRole('option', { name: 'Gamma' }));
		expect(onChange).toHaveBeenCalledWith({ value: 'c' });
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
		expect(trigger).toHaveFocus();
	});

	it('toggles closed on a second click and closes on outside pointer down', async () => {
		const user = userEvent.setup();
		const { trigger } = setup();

		await user.click(trigger);
		await user.click(trigger);
		expect(trigger).toHaveAttribute('aria-expanded', 'false');

		await user.click(trigger);
		await user.click(document.body);
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('navigates with the keyboard', async () => {
		const user = userEvent.setup();
		const { onChange, trigger } = setup();
		trigger.focus();

		await user.keyboard('{ArrowDown}');
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(trigger.getAttribute('aria-activedescendant')).toMatch(/option-0$/u);

		await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
		expect(trigger.getAttribute('aria-activedescendant')).toMatch(/option-2$/u);

		await user.keyboard('{Home}');
		expect(trigger.getAttribute('aria-activedescendant')).toMatch(/option-0$/u);
		await user.keyboard('{End}{ArrowUp}');
		expect(trigger.getAttribute('aria-activedescendant')).toMatch(/option-1$/u);

		await user.keyboard('{Enter}');
		expect(onChange).toHaveBeenCalledWith({ value: 'b' });
	});

	it('opens with ArrowUp, Enter or Space, closes with Escape and Tab, ignores other keys', async () => {
		const user = userEvent.setup();
		const { onChange, trigger } = setup();
		trigger.focus();

		await user.keyboard('{ArrowUp}');
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		await user.keyboard('{Escape}');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');

		await user.keyboard('{Home}{Escape}a');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');

		await user.keyboard(' ');
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		await user.keyboard(' ');
		expect(onChange).toHaveBeenCalledWith({ value: 'a' });

		await user.keyboard('{Enter}');
		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		await user.keyboard('{Tab}');
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('falls back to the first option for an unknown value and supports end alignment', () => {
		render(
			<Select
				label="Letter"
				isLabelHidden
				size="sm"
				align="end"
				options={OPTIONS}
				value={'z' as 'a'}
				onChange={vi.fn()}
			/>,
		);

		expect(screen.getByRole('combobox', { name: 'Letter' })).toHaveTextContent('Alpha');
		expect(screen.getByRole('listbox', { hidden: true })).toHaveAttribute(
			'data-align',
			'end',
		);
	});
});
