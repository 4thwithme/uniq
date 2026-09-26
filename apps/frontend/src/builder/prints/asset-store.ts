export interface PrintAsset {
	id: string;
	name: string;
	type: string;
	blob: Blob;
}

export interface AssetStore {
	put: (params: { asset: PrintAsset }) => Promise<void>;
	get: (params: { id: string }) => Promise<PrintAsset | null>;
}

const DB_NAME = 'uniq-assets';
const STORE_NAME = 'prints';

const toPromise = async <T>({ request }: { request: IDBRequest<T> }): Promise<T> =>
	new Promise((resolve, reject) => {
		request.addEventListener('success', () => {
			resolve(request.result);
		});
		request.addEventListener('error', () => {
			reject(request.error ?? new Error('IndexedDB request failed'));
		});
	});

export const createIndexedDbAssetStore = ({
	factory,
}: {
	factory: IDBFactory;
}): AssetStore => {
	let database: Promise<IDBDatabase> | null = null;

	const open = async (): Promise<IDBDatabase> => {
		database ??= new Promise((resolve, reject) => {
			const request = factory.open(DB_NAME, 1);
			request.addEventListener('upgradeneeded', () => {
				request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
			});
			request.addEventListener('success', () => {
				resolve(request.result);
			});
			request.addEventListener('error', () => {
				reject(request.error ?? new Error('IndexedDB open failed'));
			});
		});
		return database;
	};

	return {
		put: async ({ asset }) => {
			const db = await open();
			await toPromise({
				request: db
					.transaction(STORE_NAME, 'readwrite')
					.objectStore(STORE_NAME)
					.put(asset),
			});
		},
		get: async ({ id }) => {
			const db = await open();
			const result: unknown = await toPromise({
				request: db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id),
			});
			return (result as PrintAsset | undefined) ?? null;
		},
	};
};

export const createMemoryAssetStore = (): AssetStore => {
	const assets = new Map<string, PrintAsset>();
	return {
		put: async ({ asset }) => {
			assets.set(asset.id, asset);
			return Promise.resolve();
		},
		get: async ({ id }) => Promise.resolve(assets.get(id) ?? null),
	};
};

let browserStore: AssetStore | null = null;

export const getBrowserAssetStore = (): AssetStore => {
	browserStore ??=
		typeof indexedDB === 'undefined'
			? createMemoryAssetStore()
			: createIndexedDbAssetStore({ factory: indexedDB });
	return browserStore;
};
