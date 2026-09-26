import { useEffect, useState } from 'react';

import { getBrowserAssetStore } from '@builder/prints/asset-store';
import { withSvgSize } from '@builder/prints/print-files';
import { findPrintPreset, toSvgDataUrl } from '@builder/prints/print-presets';

import type { PrintImage } from '@builder/decor/surface-painter';
import type { AssetStore } from '@builder/prints/asset-store';
import type { PrintSource } from '@uniq/shared';

export type PrintImageStatus = 'none' | 'loading' | 'ready' | 'missing' | 'error';

export interface PrintImageState {
	status: PrintImageStatus;
	image: PrintImage | null;
}

export type ImageLoader = (params: { url: string }) => Promise<PrintImage>;

export const loadBrowserImage: ImageLoader = async ({ url }) =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.decoding = 'async';
		image.onload = (): void => {
			resolve({ image, width: image.naturalWidth, height: image.naturalHeight });
		};
		image.onerror = (): void => {
			reject(new Error('Image failed to load'));
		};
		image.src = url;
	});

export const resolvePrintUrl = async ({
	source,
	store,
}: {
	source: PrintSource;
	store: AssetStore;
}): Promise<{ url: string; revoke: boolean } | null> => {
	if (source.kind === 'preset') {
		const preset = findPrintPreset({ presetId: source.presetId });
		if (preset === null) {
			return null;
		}
		if (preset.imageUrl !== undefined) {
			return { url: preset.imageUrl, revoke: false };
		}
		return preset.svg === undefined
			? null
			: { url: toSvgDataUrl({ markup: preset.svg }), revoke: false };
	}
	const asset = await store.get({ id: source.assetId });
	if (asset === null) {
		return null;
	}
	if (asset.type === 'image/svg+xml') {
		const markup = withSvgSize({ markup: await asset.blob.text() });
		return { url: toSvgDataUrl({ markup }), revoke: false };
	}
	return { url: URL.createObjectURL(asset.blob), revoke: true };
};

const IDLE: PrintImageState = { status: 'none', image: null };

export const usePrintImage = ({
	source,
	store = getBrowserAssetStore(),
	loadImage = loadBrowserImage,
}: {
	source: PrintSource | null;
	store?: AssetStore;
	loadImage?: ImageLoader;
}): PrintImageState => {
	const key = source === null ? '' : JSON.stringify(source);
	const [state, setState] = useState<{ key: string; value: PrintImageState }>({
		key: '',
		value: IDLE,
	});

	useEffect(() => {
		if (source === null) {
			return undefined;
		}
		let isActive = true;
		const finish = ({ value }: { value: PrintImageState }): void => {
			if (isActive) {
				setState({ key, value });
			}
		};
		const run = async (): Promise<void> => {
			const resolved = await resolvePrintUrl({ source, store });
			if (resolved === null) {
				finish({ value: { status: 'missing', image: null } });
				return;
			}
			try {
				const image = await loadImage({ url: resolved.url });
				finish({ value: { status: 'ready', image } });
			} finally {
				if (resolved.revoke) {
					URL.revokeObjectURL(resolved.url);
				}
			}
		};
		run().catch(() => {
			finish({ value: { status: 'error', image: null } });
		});
		return (): void => {
			isActive = false;
		};
	}, [key, source, store, loadImage]);

	if (source === null) {
		return IDLE;
	}
	return state.key === key ? state.value : { status: 'loading', image: null };
};
