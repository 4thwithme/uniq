import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setGripCommand } from '@builder/design/design-commands';
import { useDesignStore } from '@builder/store/design-store';
import { GripEditor, OvergripEditor } from '@builder/ui/GripEditor';

import type { GripSpec } from '@uniq/shared';

const grip = (): GripSpec => useDesignStore.getState().document.grip;

describe('GripEditor', () => {
	it('edits a synthetic grip: color, texture and finish', async () => {
		const user = userEvent.setup();
		render(<GripEditor />);

		expect(screen.getByRole('radio', { name: 'Synthetic' })).toBeChecked();
		expect(screen.getByText(/Polyurethane/u)).toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: 'Blue' }));
		await user.click(screen.getByRole('radio', { name: 'Grooved' }));
		await user.click(screen.getByRole('radio', { name: 'Gloss · tacky' }));

		expect(grip()).toEqual({
			material: 'synthetic',
			colorId: 'blue',
			customHex: null,
			texture: 'grooved',
			finish: 'gloss',
			overgrip: null,
		});
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
	});

	it('switches to leather with only real leather options and back', async () => {
		const user = userEvent.setup();
		render(<GripEditor />);
		await user.click(screen.getByRole('radio', { name: 'Grooved' }));
		await user.click(screen.getByRole('radio', { name: 'Gloss · tacky' }));

		await user.click(screen.getByRole('radio', { name: 'Leather' }));

		expect(grip()).toMatchObject({
			material: 'leather',
			colorId: 'black',
			texture: 'smooth',
			finish: 'matte',
		});
		expect(screen.queryByRole('radio', { name: 'Grooved' })).not.toBeInTheDocument();
		expect(screen.queryByRole('group', { name: 'Finish' })).not.toBeInTheDocument();
		expect(
			screen.getByText('Leather comes in its natural matte finish.'),
		).toBeInTheDocument();
		expect(screen.getByRole('radio', { name: 'Natural tan' })).toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: 'Dark brown' }));
		await user.click(screen.getByRole('radio', { name: 'Synthetic' }));

		expect(grip()).toMatchObject({
			material: 'synthetic',
			colorId: 'black',
			texture: 'smooth',
		});
	});

	it('picks a custom color and goes back to a preset', async () => {
		const user = userEvent.setup();
		render(<GripEditor />);

		expect(screen.queryByLabelText('Custom color')).not.toBeInTheDocument();
		await user.click(screen.getByRole('radio', { name: 'Custom' }));
		expect(grip().customHex).toBe('#161616');

		const field = screen.getByLabelText('Custom color');
		await user.clear(field);
		await user.type(field, '#12ab9f{Enter}');
		expect(grip().customHex).toBe('#12ab9f');
		expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked();

		await user.click(screen.getByRole('radio', { name: 'Red' }));
		expect(grip()).toMatchObject({ colorId: 'red', customHex: null });
	});

	it('warns when an overgrip covers the base grip', () => {
		useDesignStore.getState().execute({
			command: setGripCommand({
				grip: {
					...grip(),
					overgrip: { colorId: 'white', material: 'tacky', texture: 'smooth' },
				},
			}),
		});
		render(<GripEditor />);

		expect(screen.getByRole('status')).toHaveTextContent('An overgrip covers this grip');
	});
});

describe('OvergripEditor', () => {
	it('adds a tacky overgrip, changes material and texture, and removes it', async () => {
		const user = userEvent.setup();
		render(<OvergripEditor />);

		expect(screen.getByRole('radio', { name: 'None' })).toBeChecked();
		expect(screen.queryByRole('group', { name: 'Material' })).not.toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: 'Pink' }));
		expect(grip().overgrip).toEqual({
			colorId: 'pink',
			material: 'tacky',
			texture: 'smooth',
		});
		expect(screen.getByText(/sticky feel/u)).toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: 'Ribbed' }));
		expect(grip().overgrip?.texture).toBe('ribbed');

		await user.click(screen.getByRole('radio', { name: 'Dry' }));
		expect(grip().overgrip).toEqual({
			colorId: 'pink',
			material: 'dry',
			texture: 'smooth',
		});
		expect(screen.getByText(/anti-sweat/u)).toBeInTheDocument();
		expect(screen.queryByRole('radio', { name: 'Ribbed' })).not.toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: 'Perforated' }));
		await user.click(screen.getByRole('radio', { name: 'Yellow' }));
		expect(grip().overgrip).toEqual({
			colorId: 'yellow',
			material: 'dry',
			texture: 'perforated',
		});

		await user.click(screen.getByRole('radio', { name: 'None' }));
		expect(grip().overgrip).toBeNull();
	});
});
