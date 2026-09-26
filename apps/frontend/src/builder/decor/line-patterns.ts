import type { LineOverlay, LinePatternId } from '@uniq/shared';

export type Point = readonly [number, number];
export type Polyline = readonly Point[];

export const LINE_PATTERN_LABELS: Readonly<Record<LinePatternId, string>> = {
	diagonal: 'Diagonal',
	chevron: 'Chevron',
	grid: 'Grid',
	pinstripe: 'Pinstripe',
	zigzag: 'Zigzag',
};

export const DEFAULT_LINES: Omit<LineOverlay, 'patternId'> = {
	color: '#111214',
	density: 12,
	thickness: 0.2,
};

export const getLineSpacing = ({
	height,
	density,
}: {
	height: number;
	density: number;
}): number => (height * 4) / density;

const range = ({
	from,
	to,
	step,
}: {
	from: number;
	to: number;
	step: number;
}): number[] => {
	const values: number[] = [];
	for (let value = from; value <= to; value += step) {
		values.push(value);
	}
	return values;
};

export const getLinePatternPolylines = ({
	patternId,
	width,
	height,
	density,
}: {
	patternId: LinePatternId;
	width: number;
	height: number;
	density: number;
}): Polyline[] => {
	const spacing = getLineSpacing({ height, density });

	switch (patternId) {
		case 'diagonal':
			return range({ from: -height, to: width, step: spacing }).map((x) => [
				[x, height],
				[x + height, 0],
			]);
		case 'chevron':
			return range({ from: -height, to: width, step: spacing }).map((x) => [
				[x, 0],
				[x + height / 2, height / 2],
				[x, height],
			]);
		case 'grid':
			return [
				...range({ from: 0, to: width, step: spacing }).map((x): Polyline => [
					[x, 0],
					[x, height],
				]),
				...range({ from: spacing / 2, to: height, step: spacing }).map((y): Polyline => [
					[0, y],
					[width, y],
				]),
			];
		case 'pinstripe':
			return range({ from: spacing / 2, to: height, step: spacing }).map((y) => [
				[0, y],
				[width, y],
			]);
		case 'zigzag':
			return range({ from: spacing / 2, to: height, step: spacing }).map((y) =>
				range({ from: 0, to: width + spacing, step: spacing / 2 }).map(
					(x, index): Point => [x, y + (index % 2 === 0 ? -spacing / 4 : spacing / 4)],
				),
			);
	}
};

export const toSvgPoints = ({ polyline }: { polyline: Polyline }): string =>
	polyline.map(([x, y]) => `${String(x)},${String(y)}`).join(' ');
