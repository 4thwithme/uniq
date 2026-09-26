export const LOGO_COLORS = ['auto', 'black', 'white'] as const;
export type LogoColor = (typeof LOGO_COLORS)[number];

export const LOGO_SIZE_RANGE = { min: 0.7, max: 1.3 } as const;

export interface LogoSpec {
	color: LogoColor;
	size: number;
}

export const DEFAULT_LOGO: LogoSpec = { color: 'auto', size: 1.3 };

export const isLogoSpec = (value: unknown): value is LogoSpec => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	const record = value as Record<string, unknown>;
	const size = record['size'];
	return (
		LOGO_COLORS.some((color) => color === record['color']) &&
		typeof size === 'number' &&
		size >= LOGO_SIZE_RANGE.min &&
		size <= LOGO_SIZE_RANGE.max
	);
};
