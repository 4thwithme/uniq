import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MAX_LAYERS } from '@uniq/shared';

import { SHAPE_DEFINITIONS } from '@builder/decor/shape-paths';
import { createShapeLayer } from '@builder/design/decor-commands';
import { createMemoryAssetStore } from '@builder/prints/asset-store';
import { MAX_PRINT_BYTES } from '@builder/prints/print-files';
import { useDesignStore } from '@builder/store/design-store';
import { LinesEditor } from '@builder/ui/LinesEditor';
import { PrintEditor } from '@builder/ui/PrintEditor';
import { ShapesEditor } from '@builder/ui/ShapesEditor';
import { CheckoutFooter, StepsNav } from '@builder/ui/StepsPanel';

import type { AssetStore } from '@builder/prints/asset-store';

const frame = (): ReturnType<
	typeof useDesignStore.getState
>['document']['overlays']['frame'] => useDesignStore.getState().document.overlays.frame;

const upload = async ({ file }: { file: File }): Promise<void> => {
	const user = userEvent.setup({ applyAccept: false });
	await user.upload(screen.getByLabelText(/Upload your own print/u), file);
};

const PICKED = [
	...SHAPE_DEFINITIONS.filter((item) => item.category === 'basic').slice(0, 6),
	...SHAPE_DEFINITIONS.filter((item) => item.category === 'creatures').slice(0, 2),
];

describe('LinesEditor', () => {
	it('adds a pattern, edits it and removes it', () => {
		render(<LinesEditor />);
		expect(screen.getByRole('radio', { name: 'None' })).toBeChecked();
		expect(screen.queryByRole('slider', { name: 'Density' })).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole('radio', { name: 'Chevron' }));
		expect(frame().lines).toMatchObject({ patternId: 'chevron', density: 12 });

		fireEvent.click(screen.getByRole('radio', { name: 'Grid' }));
		fireEvent.change(screen.getByLabelText('Line color picker'), {
			target: { value: '#ff0000' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Density' }), {
			target: { value: '20' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Thickness' }), {
			target: { value: '40' },
		});
		expect(frame().lines).toEqual({
			patternId: 'grid',
			color: '#ff0000',
			density: 20,
			thickness: 0.4,
		});

		fireEvent.click(screen.getByRole('radio', { name: 'None' }));
		expect(frame().lines).toBeNull();
	});
});

describe('PrintEditor', () => {
	it('picks a preset, edits it and removes it', () => {
		render(<PrintEditor status="none" store={createMemoryAssetStore()} />);

		fireEvent.click(screen.getByRole('radio', { name: 'Feather splash' }));
		expect(frame().print).toMatchObject({
			source: { kind: 'preset', presetId: 'feather-splash' },
		});

		fireEvent.change(screen.getByRole('slider', { name: 'Size' }), {
			target: { value: '50' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Repeat' }), {
			target: { value: '4' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Position X' }), {
			target: { value: '30' },
		});
		fireEvent.click(screen.getByRole('radio', { name: 'Low poly' }));
		expect(frame().print).toEqual({
			source: { kind: 'preset', presetId: 'low-poly' },
			scale: 0.5,
			repeat: 4,
			offset: 0.3,
			offsetY: 0.5,
		});

		fireEvent.click(screen.getByRole('radio', { name: 'None' }));
		expect(frame().print).toBeNull();
	});

	it('uploads a transparent png into the asset store', async () => {
		const store = createMemoryAssetStore();
		render(<PrintEditor status="loading" store={store} createId={() => 'asset-1'} />);

		await upload({ file: new File(['png'], 'logo.png', { type: 'image/png' }) });

		await waitFor(() => {
			expect(frame().print?.source).toEqual({
				kind: 'upload',
				assetId: 'asset-1',
				name: 'logo.png',
			});
		});
		expect(await store.get({ id: 'asset-1' })).toMatchObject({ name: 'logo.png' });
		expect(screen.getByRole('radio', { name: 'logo.png' })).toBeChecked();

		fireEvent.click(screen.getByRole('radio', { name: 'logo.png' }));
		expect(frame().print?.source.kind).toBe('upload');
	});

	it.each([
		['logo.ai', 'application/postscript', 3, /Export as SVG or PNG/u],
		['photo.jpg', 'image/jpeg', 3, /no transparent background/u],
		['big.png', 'image/png', MAX_PRINT_BYTES + 1, /larger than 10 MB/u],
	])('rejects %s', async (name, type, size, message) => {
		render(<PrintEditor status="none" store={createMemoryAssetStore()} />);
		const file = new File(['x'], name, { type });
		Object.defineProperty(file, 'size', { value: size });

		await upload({ file });

		expect(await screen.findByRole('alert')).toHaveTextContent(message);
		expect(frame().print).toBeNull();
	});

	it('explains when the browser cannot store the file', async () => {
		const store: AssetStore = {
			put: async () => Promise.reject(new Error('quota')),
			get: async () => Promise.resolve(null),
		};
		render(<PrintEditor status="none" store={store} />);

		await upload({ file: new File(['png'], 'logo.png', { type: 'image/png' }) });

		expect(await screen.findByRole('alert')).toHaveTextContent('Could not save the file');
	});

	it.each([
		['missing', /isn’t on this device/u],
		['error', /couldn’t be drawn/u],
	] as const)('shows the %s notice', (status, message) => {
		render(<PrintEditor status={status} store={createMemoryAssetStore()} />);

		expect(screen.getByRole('status')).toHaveTextContent(message);
	});
});

describe('ShapesEditor', () => {
	it('adds every shape, edits the selected one and removes it', async () => {
		const user = userEvent.setup();
		let next = 0;
		render(
			<ShapesEditor
				createId={() => {
					next += 1;
					return `id-${String(next)}`;
				}}
			/>,
		);
		expect(screen.getByText(/No shapes yet/u)).toBeInTheDocument();

		expect(screen.getByRole('button', { name: 'Add Circle' })).toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: 'Add Tiger head' }),
		).not.toBeInTheDocument();
		for (const shape of PICKED) {
			if (shape.category === 'creatures') {
				await user.click(screen.getByRole('combobox', { name: 'Collection' }));
				await user.click(screen.getByRole('option', { name: 'Creatures' }));
			}
			await user.click(screen.getByRole('button', { name: `Add ${shape.label}` }));
		}
		const { layers } = useDesignStore.getState().document;
		expect(layers.map((layer) => (layer.kind === 'shape' ? layer.shape : null))).toEqual(
			PICKED.map((item) => item.id),
		);
		expect(new Set(layers.map((layer) => layer.position.u)).size).toBe(PICKED.length);
		expect(useDesignStore.getState().selectedLayerId).toBe(`id-${String(PICKED.length)}`);
		expect(screen.getByRole('button', { name: 'Tiger head 7' })).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Circle 1' }));
		expect(screen.getByRole('button', { name: 'Circle 1' })).toHaveAttribute(
			'aria-pressed',
			'true',
		);
		fireEvent.change(screen.getByLabelText('Shape color picker'), {
			target: { value: '#ff0000' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Position X' }), {
			target: { value: '60' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Size' }), {
			target: { value: '40' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Rotation' }), {
			target: { value: '-45' },
		});
		expect(useDesignStore.getState().document.layers[0]).toMatchObject({
			color: '#ff0000',
			position: { u: 0.6, v: 0.5 },
			scale: 0.4,
			rotation: -45,
		});

		await user.click(screen.getByRole('button', { name: 'Remove Circle 1' }));
		expect(useDesignStore.getState().document.layers).toHaveLength(PICKED.length - 1);
		expect(screen.queryByRole('slider', { name: 'Rotation' })).not.toBeInTheDocument();
	});

	it('stops adding at the layer limit', () => {
		const layers = Array.from({ length: MAX_LAYERS }, (_, index) =>
			createShapeLayer({
				id: `s${String(index)}`,
				shape: 'circle',
				zone: 'frame',
				color: '#ffffff',
				u: 0,
			}),
		);
		act(() => {
			useDesignStore
				.getState()
				.loadDocument({ document: { ...useDesignStore.getState().document, layers } });
		});
		render(<ShapesEditor />);

		expect(screen.getByRole('button', { name: 'Add Star' })).toBeDisabled();
		expect(screen.getByRole('status')).toHaveTextContent(
			`Up to ${String(MAX_LAYERS)} shapes.`,
		);
	});
});

describe('StepsNav and CheckoutFooter', () => {
	it('shows steps with live metas and selects steps and options', async () => {
		const user = userEvent.setup();
		render(<StepsNav />);
		const nav = within(screen.getByRole('navigation', { name: 'Customization steps' }));

		expect(nav.getByRole('button', { name: /Frame/u })).toHaveAttribute(
			'aria-current',
			'step',
		);
		expect(nav.getByRole('button', { name: /^Color\s*#c6ff3d/iu })).toHaveAttribute(
			'aria-current',
			'true',
		);

		await user.click(nav.getByRole('button', { name: /^Objects/u }));
		expect(useDesignStore.getState().tool).toEqual({
			step: 'frame',
			frameOption: 'objects',
			handleOption: 'grip',
		});

		expect(nav.queryByRole('button', { name: /^Shaft/u })).not.toBeInTheDocument();

		await user.click(nav.getByRole('button', { name: /Handle/u }));
		expect(useDesignStore.getState().tool.step).toBe('handle');
		expect(nav.queryByRole('button', { name: /^Objects/u })).not.toBeInTheDocument();
		expect(
			nav.getByRole('button', { name: /^Grip\s*Synthetic · Black/u }),
		).toHaveAttribute('aria-current', 'true');

		await user.click(nav.getByRole('button', { name: /^Overgrip\s*—/u }));
		expect(useDesignStore.getState().tool).toMatchObject({
			step: 'handle',
			handleOption: 'overgrip',
			frameOption: 'objects',
		});
		await user.click(nav.getByRole('button', { name: /^Grip\s*Synthetic/u }));
		expect(useDesignStore.getState().tool.handleOption).toBe('grip');

		await user.click(nav.getByRole('button', { name: /Grip Cap/u }));
		expect(useDesignStore.getState().tool.step).toBe('buttCap');
		expect(nav.getByRole('button', { name: /Grip Cap/u })).toHaveTextContent(
			'Black · HEAD in white',
		);
		expect(nav.queryByRole('button', { name: /Theme/u })).not.toBeInTheDocument();
	});

	it('summarizes lines, print, shapes and gradients in the metas', async () => {
		const user = userEvent.setup();
		const { document } = useDesignStore.getState();
		act(() => {
			useDesignStore.getState().loadDocument({
				document: {
					...document,
					zones: {
						...document.zones,
						frame: {
							...document.zones.frame,
							fill: {
								kind: 'gradient',
								angle: 0,
								stops: [
									{ offset: 0, color: '#000000' },
									{ offset: 1, color: '#ffffff' },
								],
							},
						},
					},
					grip: {
						material: 'leather',
						colorId: 'brown',
						customHex: null,
						texture: 'smooth',
						finish: 'matte',
						overgrip: { colorId: 'white', material: 'dry', texture: 'smooth' },
					},
					overlays: {
						...document.overlays,
						frame: {
							lines: {
								patternId: 'zigzag',
								color: '#000000',
								density: 10,
								thickness: 0.2,
							},
							print: {
								source: { kind: 'upload', assetId: 'a', name: 'logo.png' },
								scale: 0.5,
								repeat: 1,
								offset: 0,
								offsetY: 0.5,
							},
						},
					},
					layers: [
						createShapeLayer({
							id: 'a',
							shape: 'star',
							zone: 'frame',
							color: '#ffffff',
							u: 0,
						}),
					],
				},
			});
		});
		const { rerender } = render(<StepsNav />);

		expect(screen.getByRole('button', { name: /Color\s*Gradient/u })).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Print\s*logo\.png/u }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Objects\s*Zigzag\s*·\s*1 shape/u }),
		).toBeInTheDocument();
		act(() => {
			useDesignStore.getState().selectTool({ tool: { step: 'handle' } });
		});
		rerender(<StepsNav />);
		expect(
			screen.getByRole('button', { name: /^Grip\s*Leather · Brown/u }),
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /^Overgrip\s*White · dry/u }),
		).toBeInTheDocument();
		act(() => {
			useDesignStore.getState().selectTool({ tool: { step: 'frame' } });
		});
		rerender(<StepsNav />);

		act(() => {
			useDesignStore.getState().loadDocument({
				document: {
					...useDesignStore.getState().document,
					overlays: {
						...document.overlays,
						frame: {
							lines: null,
							print: {
								source: { kind: 'preset', presetId: 'low-poly' },
								scale: 0.5,
								repeat: 1,
								offset: 0,
								offsetY: 0.5,
							},
						},
					},
				},
			});
		});
		rerender(<StepsNav />);
		expect(screen.getByRole('button', { name: /Print\s*Low poly/u })).toBeInTheDocument();

		act(() => {
			useDesignStore.getState().loadDocument({
				document: {
					...useDesignStore.getState().document,
					overlays: {
						...document.overlays,
						frame: {
							lines: null,
							print: {
								source: { kind: 'preset', presetId: 'gone' },
								scale: 0.5,
								repeat: 1,
								offset: 0,
								offsetY: 0.5,
							},
						},
					},
				},
			});
		});
		rerender(<StepsNav />);
		await user.click(screen.getByRole('button', { name: /Print\s*—/u }));
		expect(useDesignStore.getState().tool.frameOption).toBe('print');
	});

	it('shows a checkout button with a stub message and no price', async () => {
		const user = userEvent.setup();
		render(<CheckoutFooter />);

		expect(screen.queryByText(/\$/u)).not.toBeInTheDocument();
		expect(screen.getByRole('status')).toHaveTextContent('');

		await user.click(screen.getByRole('button', { name: 'Proceed to checkout' }));
		expect(screen.getByRole('status')).toHaveTextContent('Checkout isn’t available yet');
	});
});
