import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FileDrop } from '@components/FileDrop/FileDrop';
import { Panel } from '@components/Panel/Panel';
import { StepNav } from '@components/StepNav/StepNav';
import { SwatchGrid } from '@components/SwatchGrid/SwatchGrid';

describe('StepNav', () => {
	const steps = [
		{ id: 'one', label: 'One', description: 'First step' },
		{
			id: 'two',
			label: 'Two',
			options: [
				{ id: 'a', label: 'A', meta: '3' },
				{ id: 'b', label: 'B' },
			],
		},
	] as const;

	it('marks the current step and option and reports selections', async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(
			<StepNav
				label="Steps"
				steps={steps}
				activeStep="two"
				activeOption="a"
				onSelect={onSelect}
			/>,
		);

		expect(screen.getByRole('navigation', { name: 'Steps' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Two/u })).toHaveAttribute(
			'aria-current',
			'step',
		);
		expect(screen.getByRole('button', { name: /^A/u })).toHaveAttribute(
			'aria-current',
			'true',
		);
		expect(screen.getByRole('button', { name: /^B/u })).not.toHaveAttribute(
			'aria-current',
		);
		expect(screen.getByText('First step')).toBeInTheDocument();
		expect(screen.getByText('02')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /One/u }));
		expect(onSelect).toHaveBeenLastCalledWith({ step: 'one' });
		await user.click(screen.getByRole('button', { name: /^B/u }));
		expect(onSelect).toHaveBeenLastCalledWith({ step: 'two', option: 'b' });
	});

	it('hides options of inactive steps', () => {
		render(<StepNav label="Steps" steps={steps} activeStep="one" onSelect={vi.fn()} />);

		expect(screen.queryByRole('button', { name: /^A/u })).not.toBeInTheDocument();
	});
});

describe('SwatchGrid', () => {
	it('selects a swatch and supports four columns', () => {
		const onChange = vi.fn();
		const { container } = render(
			<SwatchGrid
				legend="Pattern"
				name="p"
				columns={4}
				value={null}
				options={[
					{ value: 'x', label: 'Ex', preview: <svg /> },
					{ value: 'y', label: 'Why', preview: null },
				]}
				onChange={onChange}
			/>,
		);

		expect(screen.getByRole('group', { name: 'Pattern' })).toBeInTheDocument();
		expect(screen.getByRole('radio', { name: 'Ex' })).not.toBeChecked();
		expect(container.querySelector('[data-columns="4"]')).not.toBeNull();

		fireEvent.click(screen.getByRole('radio', { name: 'Why' }));
		expect(onChange).toHaveBeenCalledWith({ value: 'y' });
	});
});

describe('FileDrop', () => {
	it('reports picked and dropped files and shows errors', async () => {
		const user = userEvent.setup();
		const onFile = vi.fn();
		const { rerender } = render(
			<FileDrop label="Upload" hint="PNG only" accept=".png" onFile={onFile} />,
		);
		const input = screen.getByLabelText(/Upload/u);
		const file = new File(['x'], 'a.png', { type: 'image/png' });

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		await user.upload(input, file);
		expect(onFile).toHaveBeenCalledWith({ file });
		expect(input).toHaveValue('');

		const zone = input.closest('label') as HTMLElement;
		fireEvent.dragOver(zone);
		expect(zone).toHaveAttribute('data-over', 'true');
		fireEvent.dragLeave(zone);
		expect(zone).toHaveAttribute('data-over', 'false');

		const drop = createEvent.drop(zone);
		Object.defineProperty(drop, 'dataTransfer', {
			value: { files: { item: () => file } },
		});
		fireEvent(zone, drop);
		expect(onFile).toHaveBeenCalledTimes(2);

		const empty = createEvent.drop(zone);
		Object.defineProperty(empty, 'dataTransfer', {
			value: { files: { item: () => null } },
		});
		fireEvent(zone, empty);
		expect(onFile).toHaveBeenCalledTimes(2);

		fireEvent.change(input, { target: { files: { item: () => null, length: 0 } } });
		expect(onFile).toHaveBeenCalledTimes(2);

		rerender(
			<FileDrop
				label="Upload"
				hint="PNG only"
				accept=".png"
				error="Bad file"
				onFile={onFile}
			/>,
		);
		expect(screen.getByRole('alert')).toHaveTextContent('Bad file');
		expect(input).toHaveAttribute('aria-invalid', 'true');
	});
});

describe('Panel footer', () => {
	it('renders a footer when given', () => {
		render(
			<Panel title="Steps" footer={<button type="button">Buy</button>}>
				<p>Body</p>
			</Panel>,
		);

		expect(screen.getByRole('contentinfo')).toContainElement(
			screen.getByRole('button', { name: 'Buy' }),
		);
	});
});
