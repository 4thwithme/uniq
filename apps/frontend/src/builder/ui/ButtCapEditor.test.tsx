import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_BUTT_CAP } from '@uniq/shared';

import { useDesignStore } from '@builder/store/design-store';
import { ButtCapEditor, ButtCapPreview } from '@builder/ui/ButtCapEditor';

import type { ButtCapSpec } from '@uniq/shared';

const buttCap = (): ButtCapSpec => useDesignStore.getState().document.buttCap;

describe('ButtCapEditor', () => {
	it('changes the cap color and finish', async () => {
		const user = userEvent.setup();
		render(<ButtCapEditor />);

		expect(screen.getByRole('img', { name: 'Grip Cap preview' })).toBeInTheDocument();
		await user.click(
			within(screen.getByRole('group', { name: 'Cap color' })).getByRole('radio', {
				name: 'Red',
			}),
		);
		expect(buttCap().colorId).toBe('red');

		await user.click(screen.getByRole('radio', { name: 'Matte' }));
		expect(buttCap().finish).toBe('matte');
	});

	it('switches badge kinds, icons, letters and badge color', async () => {
		const user = userEvent.setup();
		render(<ButtCapEditor />);
		const badgeGroup = within(screen.getByRole('group', { name: 'Badge' }));

		await user.click(screen.getByRole('radio', { name: 'Star' }));
		expect(buttCap().badge).toEqual({
			kind: 'preset',
			presetId: 'star',
			colorId: 'white',
		});

		await user.click(
			within(screen.getByRole('group', { name: 'Badge color' })).getByRole('radio', {
				name: 'Gold',
			}),
		);
		expect(buttCap().badge).toMatchObject({ colorId: 'gold' });

		await user.click(badgeGroup.getByRole('radio', { name: 'Letters' }));
		expect(buttCap().badge).toEqual({ kind: 'text', text: 'UQ', colorId: 'gold' });

		const letters = screen.getByRole('textbox', { name: 'Letters' });
		fireEvent.change(letters, { target: { value: 'ab!' } });
		expect(buttCap().badge).toMatchObject({ kind: 'text', text: 'AB' });

		fireEvent.change(letters, { target: { value: '!!' } });
		expect(buttCap().badge).toMatchObject({ kind: 'text', text: 'AB' });

		await user.click(badgeGroup.getByRole('radio', { name: 'None' }));
		expect(buttCap().badge).toEqual({ kind: 'none' });
		expect(screen.queryByRole('group', { name: 'Badge color' })).not.toBeInTheDocument();

		await user.click(badgeGroup.getByRole('radio', { name: 'Icon' }));
		expect(buttCap().badge).toEqual({
			kind: 'preset',
			presetId: 'monogram',
			colorId: 'white',
		});

		await user.click(badgeGroup.getByRole('radio', { name: 'None' }));
		await user.click(badgeGroup.getByRole('radio', { name: 'Letters' }));
		expect(buttCap().badge).toEqual({ kind: 'text', text: 'UQ', colorId: 'white' });
	});
});

describe('ButtCapPreview', () => {
	it.each(['monogram', 'ball', 'star', 'bolt'] as const)(
		'renders the %s badge',
		(presetId) => {
			const { container } = render(
				<ButtCapPreview
					buttCap={{
						...DEFAULT_BUTT_CAP,
						badge: { kind: 'preset', presetId, colorId: 'gold' },
					}}
				/>,
			);

			expect(container.querySelector('polygon')).not.toBeNull();
			if (presetId === 'monogram') {
				expect(container.querySelector('text')).toHaveTextContent('U');
			} else if (presetId === 'ball') {
				expect(container.querySelectorAll('circle')).toHaveLength(2);
			} else {
				expect(container.querySelector('path')).not.toBeNull();
			}
		},
	);

	it('renders letters with a smaller size for three characters, and nothing for none', () => {
		const { container, rerender } = render(
			<ButtCapPreview
				buttCap={{
					...DEFAULT_BUTT_CAP,
					badge: { kind: 'text', text: 'ABC', colorId: 'nope' },
				}}
			/>,
		);
		expect(container.querySelector('text')).toHaveAttribute('font-size', '26');
		expect(container.querySelector('text')).toHaveAttribute('fill', '#ffffff');

		rerender(
			<ButtCapPreview
				buttCap={{
					...DEFAULT_BUTT_CAP,
					badge: { kind: 'text', text: 'AB', colorId: 'red' },
				}}
			/>,
		);
		expect(container.querySelector('text')).toHaveAttribute('font-size', '36');

		rerender(
			<ButtCapPreview
				buttCap={{ colorId: 'nope', finish: 'matte', badge: { kind: 'none' } }}
			/>,
		);
		expect(container.querySelector('text')).toBeNull();
		expect(container.querySelector('polygon')).toHaveAttribute('fill', '#151515');
	});
});
