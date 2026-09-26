import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	isDesignDocument,
	isDesignDocumentV8,
	STICKER_IDS,
	upgradeDesignDocument,
} from '@uniq/shared';

import { getLogoColor, getLuminance } from '@builder/decor/brand-logo';
import { createStickerLayer, updateLayerCommand } from '@builder/design/decor-commands';
import { createDefaultDesign } from '@builder/design/default-design';
import {
	findSticker,
	getStickerUrl,
	STICKER_CATEGORIES,
	STICKERS,
} from '@builder/stickers/sticker-catalog';
import { useStickerImages } from '@builder/stickers/useStickerImages';
import { useDesignStore } from '@builder/store/design-store';
import { StickersEditor } from '@builder/ui/StickersEditor';

import type { StickerId } from '@uniq/shared';

const document = (): ReturnType<typeof createDefaultDesign> =>
	useDesignStore.getState().document;

describe('sticker catalog', () => {
	it('covers every sticker id with a category and url', () => {
		expect(STICKERS.map((sticker) => sticker.id).sort()).toEqual([...STICKER_IDS].sort());
		STICKER_CATEGORIES.forEach((category) => {
			expect(STICKERS.some((sticker) => sticker.category === category.id)).toBe(true);
		});
		expect(findSticker({ stickerId: 'tiger' })?.label).toBe('Tiger');
		expect(findSticker({ stickerId: 'nope' as StickerId })).toBeNull();
		expect(getStickerUrl({ stickerId: 'rose' })).toMatch(/stickers\/rose\.svg$/u);
	});
});

describe('sticker schema', () => {
	it('validates sticker layers and upgrades v8 by dropping the shaft switch', () => {
		const base = createDefaultDesign();
		const layer = createStickerLayer({
			id: 's',
			stickerId: 'dragon',
			zone: 'throat',
			u: 0.2,
		});
		expect(isDesignDocument({ ...base, layers: [layer] })).toBe(true);
		expect(isDesignDocument({ ...base, layers: [{ ...layer, stickerId: 'yeti' }] })).toBe(
			false,
		);

		const v8 = { ...base, schemaVersion: 8, shaftExtendsHead: false };
		expect(isDesignDocumentV8(v8)).toBe(true);
		expect(isDesignDocumentV8({ ...v8, layers: [layer] })).toBe(false);
		expect(upgradeDesignDocument(v8)).toEqual(base);
	});

	it('patches only shared fields on stickers', () => {
		const layer = createStickerLayer({
			id: 's',
			stickerId: 'rose',
			zone: 'frame',
			u: 0.2,
		});
		const next = updateLayerCommand({
			layerId: 's',
			patch: { color: '#ff0000', scale: 0.4, zone: 'throat' },
		}).apply({ document: { ...createDefaultDesign(), layers: [layer] } });
		expect(next.layers[0]).toEqual({ ...layer, scale: 0.4, zone: 'throat' });
	});
});

describe('logo color', () => {
	it('picks a dark logo on light frames and a light one on dark frames', () => {
		expect(getLuminance({ hex: '#ffffff' })).toBeCloseTo(1);
		expect(getLogoColor({ background: '#c6ff3d' })).toBe('#111111');
		expect(getLogoColor({ background: '#1d2b4a' })).toBe('#ffffff');
	});
});

describe('useStickerImages', () => {
	it('loads each sticker once and skips failures', async () => {
		const loadImage = vi.fn(async ({ url }: { url: string }) =>
			url.includes('rose')
				? Promise.reject(new Error('nope'))
				: Promise.resolve({ image: {} as CanvasImageSource, width: 10, height: 10 }),
		);

		const { result, rerender } = renderHook(
			({ ids }: { ids: StickerId[] }) => useStickerImages({ stickerIds: ids, loadImage }),
			{ initialProps: { ids: ['tiger', 'tiger', 'rose'] } },
		);
		await waitFor(() => {
			expect(result.current.has('tiger')).toBe(true);
		});
		expect(result.current.has('rose')).toBe(false);
		rerender({ ids: [] });
		expect(loadImage).toHaveBeenCalledTimes(2);
	});
});

describe('StickersEditor', () => {
	it('adds stickers from a collection, moves one to the shaft and removes it', async () => {
		const user = userEvent.setup();
		let next = 0;
		render(
			<StickersEditor
				createId={() => {
					next += 1;
					return `st-${String(next)}`;
				}}
			/>,
		);

		expect(screen.getByText(/No stickers yet/u)).toBeInTheDocument();
		expect(
			screen.getByRole('link', { name: 'Microsoft Fluent Emoji' }),
		).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Add Rose' }));
		await user.click(screen.getByRole('combobox', { name: 'Collection' }));
		await user.click(screen.getByRole('option', { name: 'Animals' }));
		await user.click(screen.getByRole('button', { name: 'Add Tiger' }));
		expect(
			document().layers.map((layer) => layer.kind === 'sticker' && layer.stickerId),
		).toEqual(['rose', 'tiger']);

		await user.click(screen.getByRole('radio', { name: 'Shaft' }));
		expect(document().layers[1]).toMatchObject({
			zone: 'throat',
			position: { u: 0.15, v: 0.5 },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Position Y' }), {
			target: { value: '30' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Rotation' }), {
			target: { value: '20' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Size' }), {
			target: { value: '50' },
		});
		fireEvent.change(screen.getByRole('slider', { name: 'Position X' }), {
			target: { value: '40' },
		});
		expect(document().layers[1]).toMatchObject({
			position: { u: 0.4, v: 0.3 },
			rotation: 20,
			scale: 0.5,
		});
		await user.click(screen.getByRole('radio', { name: 'Head' }));
		expect(document().layers[1]).toMatchObject({
			zone: 'frame',
			position: { u: 0.4, v: 0.5 },
		});

		await user.click(screen.getByRole('button', { name: 'Rose 1' }));
		await user.click(screen.getByRole('button', { name: 'Remove Rose 1' }));
		expect(document().layers).toHaveLength(1);

		await user.click(screen.getByRole('combobox', { name: 'Collection' }));
		await user.click(screen.getByRole('option', { name: 'Cities' }));
		expect(screen.getByText('City lettering drawn for UNIQ.')).toBeInTheDocument();
	});
});

describe('StickersEditor limits', () => {
	it('shows the limit notice and disables adding when the design is full', () => {
		const layers = Array.from({ length: 24 }, (_, index) =>
			createStickerLayer({
				id: `full-${String(index)}`,
				stickerId: 'rose',
				zone: 'frame',
				u: 0.1,
			}),
		);
		useDesignStore.setState({ document: { ...createDefaultDesign(), layers } });
		render(<StickersEditor />);
		expect(screen.getByRole('status')).toHaveTextContent('Up to 24 shapes and stickers.');
		expect(screen.getByRole('button', { name: 'Add Rose' })).toBeDisabled();
	});
});
