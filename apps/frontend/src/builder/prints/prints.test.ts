import 'fake-indexeddb/auto';

import {
	createIndexedDbAssetStore,
	createMemoryAssetStore,
	getBrowserAssetStore,
} from '@builder/prints/asset-store';
import {
	checkPrintFile,
	MAX_PRINT_BYTES,
	readSvgSize,
	withSvgSize,
} from '@builder/prints/print-files';
import {
	findPrintPreset,
	PRINT_PRESETS,
	toSvgDataUrl,
} from '@builder/prints/print-presets';

const asset = { id: 'a1', name: 'logo.png', type: 'image/png', blob: new Blob(['x']) };

describe('checkPrintFile', () => {
	it.each([
		['logo.png', 'image/png'],
		['logo.webp', 'image/webp'],
		['logo.svg', 'image/svg+xml'],
		['logo.avif', 'image/avif'],
		['logo.GIF', 'image/gif'],
	])('accepts %s', (name, type) => {
		expect(checkPrintFile({ name, type, size: 100 })).toEqual({ ok: true });
	});

	it.each([
		['logo.ai', 'application/postscript', /Illustrator/u],
		['logo.eps', '', /Illustrator/u],
		['logo.pdf', 'application/pdf', /Illustrator/u],
		['photo.jpg', 'image/jpeg', /JPG/u],
		['photo', 'image/jpeg', /JPG/u],
		['logo.bmp', 'image/bmp', /PNG, WebP/u],
		['logo.png', 'image/webp', /PNG, WebP/u],
		['noextension', 'image/png', /PNG, WebP/u],
	])('rejects %s', (name, type, message) => {
		const result = checkPrintFile({ name, type, size: 100 });
		expect(result.ok).toBe(false);
		expect(result.ok ? '' : result.message).toMatch(message);
	});

	it('rejects files over the size limit', () => {
		const result = checkPrintFile({
			name: 'a.png',
			type: 'image/png',
			size: MAX_PRINT_BYTES + 1,
		});
		expect(result).toEqual({ ok: false, message: 'File is larger than 10 MB.' });
	});
});

describe('svg sizing', () => {
	it('reads the viewBox size', () => {
		expect(readSvgSize({ markup: '<svg viewBox="0 0 120 40"></svg>' })).toEqual({
			width: 120,
			height: 40,
		});
		expect(readSvgSize({ markup: '<svg></svg>' })).toBeNull();
		expect(readSvgSize({ markup: '<svg viewBox="0 0 0 40"></svg>' })).toBeNull();
	});

	it('adds width and height only when missing', () => {
		expect(withSvgSize({ markup: '<svg viewBox="0 0 120 40"></svg>' })).toBe(
			'<svg width="120" height="40" viewBox="0 0 120 40"></svg>',
		);
		const sized = '<svg width="10" viewBox="0 0 120 40"></svg>';
		expect(withSvgSize({ markup: sized })).toBe(sized);
		expect(withSvgSize({ markup: '<svg></svg>' })).toBe('<svg></svg>');
	});
});

describe('print presets', () => {
	it('has sized svgs or image urls and can be found by id', () => {
		PRINT_PRESETS.forEach((preset) => {
			if (preset.imageUrl === undefined) {
				expect(preset.svg).toContain(`width="${String(preset.width)}"`);
				expect(preset.svg).toContain(`height="${String(preset.height)}"`);
			} else {
				expect(preset.imageUrl).toMatch(/^\/.*prints\/.+\.webp$/);
			}
			expect(findPrintPreset({ presetId: preset.id })).toBe(preset);
		});
		expect(findPrintPreset({ presetId: 'nope' })).toBeNull();
		expect(toSvgDataUrl({ markup: '<svg/>' })).toBe(
			'data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E',
		);
	});
});

describe('asset stores', () => {
	it('stores and reads assets in IndexedDB', async () => {
		const store = createIndexedDbAssetStore({ factory: indexedDB });
		await store.put({ asset });

		expect(await store.get({ id: 'a1' })).toMatchObject({ id: 'a1', name: 'logo.png' });
		expect(await store.get({ id: 'missing' })).toBeNull();
	});

	it('rejects when IndexedDB cannot open', async () => {
		const request = new EventTarget() as IDBOpenDBRequest & {
			error: DOMException | null;
		};
		Object.assign(request, { error: null });
		const factory = { open: () => request } as unknown as IDBFactory;
		const store = createIndexedDbAssetStore({ factory });
		const result = store.get({ id: 'a1' });
		request.dispatchEvent(new Event('error'));

		await expect(result).rejects.toThrow('IndexedDB open failed');
	});

	it('rejects a failed request', async () => {
		const autoFire = ({
			type,
			result,
		}: {
			type: string;
			result?: unknown;
		}): EventTarget => {
			const target = new EventTarget();
			Object.assign(target, { error: null, result });
			const add = target.addEventListener.bind(target);
			Object.assign(target, {
				addEventListener: (name: string, listener: EventListener): void => {
					add(name, listener);
					if (name === type) {
						queueMicrotask(() => target.dispatchEvent(new Event(type)));
					}
				},
			});
			return target;
		};
		const db = {
			transaction: () => ({
				objectStore: () => ({ put: () => autoFire({ type: 'error' }) }),
			}),
		};
		const factory = {
			open: () => autoFire({ type: 'success', result: db }),
		} as unknown as IDBFactory;
		const store = createIndexedDbAssetStore({ factory });

		await expect(store.put({ asset })).rejects.toThrow('IndexedDB request failed');
	});

	it('keeps assets in memory', async () => {
		const store = createMemoryAssetStore();
		await store.put({ asset });

		expect(await store.get({ id: 'a1' })).toBe(asset);
		expect(await store.get({ id: 'b' })).toBeNull();
	});

	it('returns one browser store', () => {
		expect(getBrowserAssetStore()).toBe(getBrowserAssetStore());
	});
});
