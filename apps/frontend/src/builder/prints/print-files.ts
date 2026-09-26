export const MAX_PRINT_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_PRINT_TYPES: Readonly<Record<string, string>> = {
	'image/png': 'png',
	'image/webp': 'webp',
	'image/svg+xml': 'svg',
	'image/avif': 'avif',
	'image/gif': 'gif',
};

export const PRINT_ACCEPT =
	'.png,.webp,.svg,.avif,.gif,image/png,image/webp,image/svg+xml,image/avif,image/gif';

export type PrintFileCheck = { ok: true } | { ok: false; message: string };

const extensionOf = ({ name }: { name: string }): string =>
	name.includes('.') ? (name.split('.').pop() ?? '').toLowerCase() : '';

export const checkPrintFile = ({
	name,
	type,
	size,
}: {
	name: string;
	type: string;
	size: number;
}): PrintFileCheck => {
	const extension = extensionOf({ name });

	if (extension === 'ai' || extension === 'eps' || extension === 'pdf') {
		return {
			ok: false,
			message:
				'Illustrator and PDF files can’t be read here. Export as SVG or PNG and upload that.',
		};
	}
	if (['jpg', 'jpeg'].includes(extension) || type === 'image/jpeg') {
		return {
			ok: false,
			message: 'JPG has no transparent background. Use PNG, WebP or SVG.',
		};
	}
	const expected = ACCEPTED_PRINT_TYPES[type];
	if (expected === undefined || extension !== expected) {
		return { ok: false, message: 'Use a PNG, WebP, SVG, AVIF or GIF file.' };
	}
	if (size > MAX_PRINT_BYTES) {
		return { ok: false, message: 'File is larger than 10 MB.' };
	}
	return { ok: true };
};

export const readSvgSize = ({
	markup,
}: {
	markup: string;
}): { width: number; height: number } | null => {
	const viewBox =
		/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/iu.exec(
			markup,
		);
	const width = Number(viewBox?.[1]);
	const height = Number(viewBox?.[2]);
	return width > 0 && height > 0 ? { width, height } : null;
};

export const withSvgSize = ({ markup }: { markup: string }): string => {
	const size = readSvgSize({ markup });
	if (size === null || /<svg[^>]*\swidth\s*=/iu.test(markup)) {
		return markup;
	}
	return markup.replace(
		/<svg/iu,
		`<svg width="${String(size.width)}" height="${String(size.height)}"`,
	);
};
