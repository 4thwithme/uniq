import { useEffect, useRef, useState } from 'react';

import { loadBrowserImage } from '@builder/prints/usePrintImage';
import { getStickerUrl } from '@builder/stickers/sticker-catalog';

import type { PrintImage, StickerImages } from '@builder/decor/surface-painter';
import type { ImageLoader } from '@builder/prints/usePrintImage';
import type { StickerId } from '@uniq/shared';

const NO_IMAGES: StickerImages = new Map();

export const useStickerImages = ({
	stickerIds,
	loadImage = loadBrowserImage,
}: {
	stickerIds: readonly StickerId[];
	loadImage?: ImageLoader;
}): StickerImages => {
	const key = [...new Set(stickerIds)].sort().join('|');
	const [images, setImages] = useState<StickerImages>(NO_IMAGES);
	const failed = useRef(new Set<StickerId>());

	useEffect(() => {
		const wanted = key === '' ? [] : (key.split('|') as StickerId[]);
		const missing = wanted.filter(
			(stickerId) => !images.has(stickerId) && !failed.current.has(stickerId),
		);
		if (missing.length === 0) {
			return undefined;
		}
		let isActive = true;
		void Promise.all(
			missing.map(async (stickerId) => {
				try {
					const image = await loadImage({ url: getStickerUrl({ stickerId }) });
					return [stickerId, image] as const;
				} catch {
					failed.current.add(stickerId);
					return null;
				}
			}),
		).then((loaded) => {
			if (!isActive) {
				return;
			}
			const found = loaded.filter(
				(entry): entry is readonly [StickerId, PrintImage] => entry !== null,
			);
			if (found.length > 0) {
				setImages((current) => new Map([...current, ...found]));
			}
		});
		return (): void => {
			isActive = false;
		};
	}, [key, images, loadImage]);

	return images;
};
