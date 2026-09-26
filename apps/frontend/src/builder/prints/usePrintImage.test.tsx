import { renderHook, waitFor } from '@testing-library/react';

import { createMemoryAssetStore } from '@builder/prints/asset-store';
import {
	loadBrowserImage,
	resolvePrintUrl,
	usePrintImage,
} from '@builder/prints/usePrintImage';

import type { PrintImage } from '@builder/decor/surface-painter';
import type { ImageLoader } from '@builder/prints/usePrintImage';
import type { PrintSource } from '@uniq/shared';

const IMAGE: PrintImage = { image: {} as CanvasImageSource, width: 10, height: 5 };

const withAssets = async (): Promise<ReturnType<typeof createMemoryAssetStore>> => {
	const store = createMemoryAssetStore();
	await store.put({
		asset: { id: 'png', name: 'a.png', type: 'image/png', blob: new Blob(['png']) },
	});
	await store.put({
		asset: {
			id: 'svg',
			name: 'a.svg',
			type: 'image/svg+xml',
			blob: new Blob(['<svg viewBox="0 0 20 10"></svg>'], { type: 'image/svg+xml' }),
		},
	});
	return store;
};

describe('usePrintImage', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('is idle without a source', () => {
		const loadImage = vi.fn<ImageLoader>();
		const { result } = renderHook(() => usePrintImage({ source: null, loadImage }));

		expect(result.current).toEqual({ status: 'none', image: null });
		expect(loadImage).not.toHaveBeenCalled();
	});

	it('loads a preset from its image url', async () => {
		const loadImage = vi.fn<ImageLoader>().mockResolvedValue(IMAGE);
		const source: PrintSource = { kind: 'preset', presetId: 'low-poly' };
		const { result } = renderHook(() =>
			usePrintImage({ source, store: createMemoryAssetStore(), loadImage }),
		);

		expect(result.current.status).toBe('loading');
		await waitFor(() => {
			expect(result.current).toEqual({ status: 'ready', image: IMAGE });
		});
		expect(loadImage.mock.calls[0]?.[0].url).toMatch(/\/prints\/low-poly\.webp$/u);
	});

	it('reports missing presets and uploads', async () => {
		const loadImage = vi.fn<ImageLoader>().mockResolvedValue(IMAGE);
		const store = createMemoryAssetStore();
		const preset = renderHook(() =>
			usePrintImage({ source: { kind: 'preset', presetId: 'nope' }, store, loadImage }),
		);
		const upload = renderHook(() =>
			usePrintImage({
				source: { kind: 'upload', assetId: 'gone', name: 'x.png' },
				store,
				loadImage,
			}),
		);

		await waitFor(() => {
			expect(preset.result.current.status).toBe('missing');
			expect(upload.result.current.status).toBe('missing');
		});
	});

	it('loads an uploaded png from an object url and revokes it', async () => {
		const createObjectURL = vi.fn(() => 'blob:print');
		const revokeObjectURL = vi.fn();
		vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }));
		const loadImage = vi.fn<ImageLoader>().mockResolvedValue(IMAGE);
		const store = await withAssets();
		const { result } = renderHook(() =>
			usePrintImage({
				source: { kind: 'upload', assetId: 'png', name: 'a.png' },
				store,
				loadImage,
			}),
		);

		await waitFor(() => {
			expect(result.current.status).toBe('ready');
		});
		expect(loadImage).toHaveBeenCalledWith({ url: 'blob:print' });
		expect(revokeObjectURL).toHaveBeenCalledWith('blob:print');
	});

	it('sizes an uploaded svg before loading it', async () => {
		const store = await withAssets();
		const resolved = await resolvePrintUrl({
			source: { kind: 'upload', assetId: 'svg', name: 'a.svg' },
			store,
		});

		expect(resolved?.revoke).toBe(false);
		expect(decodeURIComponent(resolved?.url ?? '')).toContain('width="20" height="10"');
	});

	it('reports an error when the image fails', async () => {
		const loadImage = vi.fn<ImageLoader>().mockRejectedValue(new Error('bad'));
		const { result, unmount } = renderHook(() =>
			usePrintImage({
				source: { kind: 'preset', presetId: 'feather-splash' },
				store: createMemoryAssetStore(),
				loadImage,
			}),
		);

		await waitFor(() => {
			expect(result.current.status).toBe('error');
		});
		unmount();
	});

	it('ignores results after unmount', async () => {
		let resolveImage: (value: PrintImage) => void = () => undefined;
		const loadImage = vi.fn<ImageLoader>(
			async () =>
				new Promise<PrintImage>((resolve) => {
					resolveImage = resolve;
				}),
		);
		const { result, unmount } = renderHook(() =>
			usePrintImage({
				source: { kind: 'preset', presetId: 'feather-splash' },
				store: createMemoryAssetStore(),
				loadImage,
			}),
		);
		await waitFor(() => {
			expect(loadImage).toHaveBeenCalled();
		});
		unmount();
		resolveImage(IMAGE);

		expect(result.current.status).toBe('loading');
	});
});

describe('loadBrowserImage', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	const stubImage = ({ outcome }: { outcome: 'load' | 'error' }): void => {
		vi.stubGlobal(
			'Image',
			class {
				naturalWidth = 30;
				naturalHeight = 15;
				decoding = '';
				onload: (() => void) | null = null;
				onerror: (() => void) | null = null;
				set src(_value: string) {
					queueMicrotask(() => {
						if (outcome === 'load') {
							this.onload?.();
						} else {
							this.onerror?.();
						}
					});
				}
			},
		);
	};

	it('resolves with the natural size', async () => {
		stubImage({ outcome: 'load' });

		await expect(loadBrowserImage({ url: 'x' })).resolves.toMatchObject({
			width: 30,
			height: 15,
		});
	});

	it('rejects when the image fails', async () => {
		stubImage({ outcome: 'error' });

		await expect(loadBrowserImage({ url: 'x' })).rejects.toThrow('Image failed to load');
	});
});
