import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Badge } from '@components/Badge/Badge';
import { Button } from '@components/Button/Button';
import { ColorField } from '@components/ColorField/ColorField';
import { IconButton } from '@components/IconButton/IconButton';
import { CloseIcon, PlusIcon, RedoIcon, UndoIcon } from '@components/icons/Icons';
import { Kbd } from '@components/Kbd/Kbd';
import { Panel } from '@components/Panel/Panel';
import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';
import { Slider } from '@components/Slider/Slider';
import { Switch } from '@components/Switch/Switch';
import { TextField } from '@components/TextField/TextField';

describe('Button', () => {
	it('defaults to a secondary md button', () => {
		render(<Button>Save</Button>);
		const button = screen.getByRole('button', { name: 'Save' });

		expect(button).toHaveAttribute('type', 'button');
		expect(button).toHaveAttribute('data-variant', 'secondary');
		expect(button).toHaveAttribute('data-size', 'md');
	});

	it('supports variant, size, submit and extra classes', () => {
		render(
			<Button variant="primary" size="sm" type="submit" className="extra">
				Go
			</Button>,
		);
		const button = screen.getByRole('button', { name: 'Go' });

		expect(button).toHaveAttribute('type', 'submit');
		expect(button).toHaveAttribute('data-variant', 'primary');
		expect(button).toHaveAttribute('data-size', 'sm');
		expect(button.className).toContain('extra');
	});
});

describe('IconButton', () => {
	it('uses the label as name and tooltip', async () => {
		const onClick = vi.fn();
		render(
			<IconButton label="Undo" onClick={onClick}>
				<UndoIcon />
			</IconButton>,
		);
		const button = screen.getByRole('button', { name: 'Undo' });

		expect(button).toHaveAttribute('title', 'Undo');
		expect(button).toHaveAttribute('data-variant', 'ghost');
		await userEvent.click(button);
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('renders all icons hidden from assistive tech', () => {
		const { container } = render(
			<>
				<RedoIcon />
				<CloseIcon />
				<PlusIcon />
			</>,
		);

		expect(container.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(3);
	});
});

describe('SegmentedControl', () => {
	it('selects an option and can hide the legend', async () => {
		const onChange = vi.fn();
		render(
			<SegmentedControl
				legend="Finish"
				name="finish"
				options={[
					{ value: 'gloss', label: 'Gloss' },
					{ value: 'matte', label: 'Matte' },
				]}
				value="gloss"
				onChange={onChange}
				isLegendHidden
			/>,
		);

		expect(screen.getByRole('group', { name: 'Finish' })).toBeInTheDocument();
		expect(screen.getByRole('radio', { name: 'Gloss' })).toBeChecked();
		expect(screen.getByText('Finish')).toHaveAttribute('data-hidden', 'true');

		await userEvent.click(screen.getByRole('radio', { name: 'Matte' }));
		expect(onChange).toHaveBeenCalledWith({ value: 'matte' });
	});
});

describe('Slider', () => {
	it('shows the value with its unit and reports changes', () => {
		const onChange = vi.fn();
		render(
			<Slider label="Angle" value={45} min={0} max={360} unit="°" onChange={onChange} />,
		);
		const slider = screen.getByRole('slider', { name: 'Angle' });

		expect(screen.getByText('45°')).toBeInTheDocument();
		expect(slider).toHaveAttribute('aria-valuetext', '45°');

		fireEvent.change(slider, { target: { value: '90' } });
		expect(onChange).toHaveBeenCalledWith({ value: 90 });
	});

	it('defaults to no unit', () => {
		render(
			<Slider label="Stop" value={3} min={0} max={10} isDisabled onChange={vi.fn()} />,
		);

		expect(screen.getByRole('slider', { name: 'Stop' })).toBeDisabled();
		expect(screen.getByText('3')).toBeInTheDocument();
	});
});

describe('ColorField', () => {
	it('changes from the picker', () => {
		const onChange = vi.fn();
		render(<ColorField label="Zone color" value="#1f7a3d" onChange={onChange} />);

		fireEvent.change(screen.getByLabelText('Zone color picker'), {
			target: { value: '#ff0000' },
		});
		expect(onChange).toHaveBeenCalledWith({ value: '#ff0000' });
	});

	it('commits a typed hex on Enter and adds the hash', async () => {
		const onChange = vi.fn();
		render(<ColorField label="Zone color" value="#1f7a3d" onChange={onChange} />);
		const input = screen.getByRole('textbox', { name: 'Zone color' });

		await userEvent.clear(input);
		await userEvent.type(input, 'ABCDEF{Enter}');

		expect(onChange).toHaveBeenCalledWith({ value: '#abcdef' });
		expect(input).toHaveValue('#1f7a3d');
	});

	it('shows an error for a bad hex, keeps it on blur and resets on Escape', async () => {
		const onChange = vi.fn();
		render(<ColorField label="Zone color" value="#1f7a3d" onChange={onChange} />);
		const input = screen.getByRole('textbox', { name: 'Zone color' });

		await userEvent.clear(input);
		await userEvent.type(input, '#12');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(screen.getByText(/6-digit hex/u)).toBeInTheDocument();

		fireEvent.blur(input);
		expect(onChange).not.toHaveBeenCalled();
		expect(input).toHaveValue('#12');

		await userEvent.type(input, '{Escape}');
		expect(input).toHaveValue('#1f7a3d');
	});

	it('ignores blur without edits', () => {
		const onChange = vi.fn();
		render(<ColorField label="Zone color" value="#1f7a3d" onChange={onChange} />);

		fireEvent.blur(screen.getByRole('textbox', { name: 'Zone color' }));
		expect(onChange).not.toHaveBeenCalled();
	});
});

describe('TextField', () => {
	it('shows a hint and reports typing', async () => {
		const onChange = vi.fn();
		render(
			<TextField label="Name" value="" hint="Shown on exports" onChange={onChange} />,
		);
		const input = screen.getByRole('textbox', { name: 'Name' });

		expect(input).toHaveAccessibleDescription('Shown on exports');
		expect(input).toHaveAttribute('aria-invalid', 'false');
		await userEvent.type(input, 'a');
		expect(onChange).toHaveBeenCalledWith({ value: 'a' });
	});

	it('shows an error over the hint', () => {
		render(
			<TextField
				label="Name"
				value="x"
				hint="Hint"
				error="Too long"
				onChange={vi.fn()}
			/>,
		);
		const input = screen.getByRole('textbox', { name: 'Name' });

		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAccessibleDescription('Too long');
		expect(screen.getByText('Too long')).toHaveAttribute('data-tone', 'error');
	});

	it('has no description without hint or error', () => {
		render(<TextField label="Name" value="" isDisabled onChange={vi.fn()} />);
		const input = screen.getByRole('textbox', { name: 'Name' });

		expect(input).not.toHaveAttribute('aria-describedby');
		expect(input).toBeDisabled();
	});
});

describe('Switch', () => {
	it('toggles', async () => {
		const onChange = vi.fn();
		render(<Switch label="Mirror" checked={false} onChange={onChange} />);
		const control = screen.getByRole('switch', { name: 'Mirror' });

		expect(control).toHaveAttribute('aria-checked', 'false');
		await userEvent.click(control);
		expect(onChange).toHaveBeenCalledWith({ checked: true });
	});

	it('can be disabled', () => {
		render(<Switch label="Locked" checked isDisabled onChange={vi.fn()} />);

		expect(screen.getByRole('switch', { name: 'Locked' })).toBeDisabled();
	});
});

describe('Panel, Badge, Kbd', () => {
	it('renders a labelled panel with actions', () => {
		render(
			<Panel
				title="Paint"
				elevation="float"
				className="extra"
				actions={<button type="button">x</button>}
			>
				<p>Body</p>
			</Panel>,
		);
		const panel = screen.getByRole('region', { name: 'Paint' });

		expect(panel).toHaveAttribute('data-elevation', 'float');
		expect(panel.className).toContain('extra');
		expect(screen.getByRole('button', { name: 'x' })).toBeInTheDocument();
	});

	it('renders a flat panel without actions', () => {
		render(
			<Panel title="Tools">
				<p>Body</p>
			</Panel>,
		);

		expect(screen.getByRole('region', { name: 'Tools' })).toHaveAttribute(
			'data-elevation',
			'flat',
		);
	});

	it('renders badges with a dot for non-neutral tones and a key', () => {
		const { container } = render(
			<>
				<Badge>Draft</Badge>
				<Badge tone="success">Saved</Badge>
				<Kbd>Z</Kbd>
			</>,
		);

		expect(screen.getByText('Saved').closest('[data-tone]')).toHaveAttribute(
			'data-tone',
			'success',
		);
		expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
		expect(container.querySelector('kbd')).toHaveTextContent('Z');
	});
});
