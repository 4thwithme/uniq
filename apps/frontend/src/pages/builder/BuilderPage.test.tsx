import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BuilderPage } from '@pages/builder/BuilderPage';

vi.mock('@builder/scene/BuilderCanvas', () => ({
	BuilderCanvas: (): React.JSX.Element => <div data-testid="builder-canvas" />,
}));

describe('BuilderPage', () => {
	it('renders the header, tools, viewport and steps', async () => {
		render(<BuilderPage />);

		expect(await screen.findByTestId('builder-canvas')).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { level: 1, name: 'Make your HEAD unique' }),
		).toBeInTheDocument();
		expect(screen.getByRole('region', { name: 'Frame · Color' })).toBeInTheDocument();
		expect(screen.getByRole('region', { name: 'Steps' })).toBeInTheDocument();
		expect(screen.getByRole('region', { name: '3D racket preview' })).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Proceed to checkout' }),
		).toBeInTheDocument();
	});

	it('switches the tools panel with the selected step and option', async () => {
		const user = userEvent.setup();
		render(<BuilderPage />);
		const steps = within(screen.getByRole('navigation', { name: 'Customization steps' }));

		await user.click(steps.getByRole('button', { name: /^Print/u }));
		expect(screen.getByRole('region', { name: 'Frame · Print' })).toBeInTheDocument();

		await user.click(steps.getByRole('button', { name: /^Objects/u }));
		expect(screen.getByRole('region', { name: 'Frame · Objects' })).toBeInTheDocument();
		expect(screen.getByRole('radio', { name: 'Chevron' })).toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: 'Shapes' }));
		expect(screen.getByRole('button', { name: 'Add Circle' })).toBeInTheDocument();

		await user.click(screen.getByRole('radio', { name: 'Stickers' }));
		expect(screen.getByText(/No stickers yet/u)).toBeInTheDocument();

		await user.click(steps.getByRole('button', { name: /^Grommets/u }));
		expect(screen.getByRole('region', { name: 'Frame · Grommets' })).toBeInTheDocument();

		await user.click(steps.getByRole('button', { name: /Handle/u }));
		expect(screen.getByRole('region', { name: 'Handle · Grip' })).toBeInTheDocument();
		expect(screen.getByRole('radio', { name: 'Leather' })).toBeInTheDocument();

		await user.click(steps.getByRole('button', { name: /^Overgrip/u }));
		expect(screen.getByRole('region', { name: 'Handle · Overgrip' })).toBeInTheDocument();

		await user.click(steps.getByRole('button', { name: /^Finishing tape/u }));
		expect(
			screen.getByRole('region', { name: 'Handle · Finishing tape' }),
		).toBeInTheDocument();

		await user.click(steps.getByRole('button', { name: /Grip Cap/u }));
		expect(screen.getByRole('region', { name: 'Grip Cap' })).toBeInTheDocument();
		expect(screen.getByRole('img', { name: 'Grip Cap preview' })).toBeInTheDocument();
		expect(steps.queryByRole('button', { name: /Theme/u })).not.toBeInTheDocument();

		await user.click(steps.getByRole('button', { name: /Frame/u }));
		await user.click(steps.getByRole('button', { name: /^Color/u }));
		expect(screen.getByRole('region', { name: 'Frame · Color' })).toBeInTheDocument();
	});

	it('folds and unfolds both side panels', async () => {
		const user = userEvent.setup();
		render(<BuilderPage />);

		await user.click(screen.getByRole('button', { name: 'Hide tools' }));
		expect(
			screen.queryByRole('region', { name: 'Frame · Color' }),
		).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Show tools' })).toHaveAttribute(
			'aria-pressed',
			'false',
		);

		await user.click(screen.getByRole('button', { name: 'Hide steps' }));
		expect(screen.queryByRole('region', { name: 'Steps' })).not.toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Show tools' }));
		await user.click(screen.getByRole('button', { name: 'Show steps' }));
		expect(screen.getByRole('region', { name: 'Frame · Color' })).toBeInTheDocument();
		expect(screen.getByRole('region', { name: 'Steps' })).toBeInTheDocument();
	});

	it('shows the checkout stub message', async () => {
		const user = userEvent.setup();
		render(<BuilderPage />);

		await user.click(screen.getByRole('button', { name: 'Proceed to checkout' }));
		expect(screen.getByText(/Checkout isn’t available yet/u)).toBeInTheDocument();
	});
});
