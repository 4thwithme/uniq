import { LIBRARY_SHAPE_BOX, LIBRARY_SHAPES } from '@builder/decor/shape-library';

import type { ShapeCategory } from '@builder/decor/shape-library';
import type { ShapeKind } from '@uniq/shared';

export const SHAPE_BOX = 100;

interface BasicShape {
	d: string;
	label: string;
	category: ShapeCategory;
}

const BASIC_SHAPES = {
	circle: { d: 'M50 5a45 45 0 1 0 0.01 0Z', label: 'Circle', category: 'basic' },
	square: { d: 'M10 10H90V90H10Z', label: 'Square', category: 'basic' },
	triangle: { d: 'M50 6L94 88H6Z', label: 'Triangle', category: 'basic' },
	diamond: { d: 'M50 4L92 50L50 96L8 50Z', label: 'Diamond', category: 'basic' },
	hexagon: { d: 'M27 8H73L96 50L73 92H27L4 50Z', label: 'Hexagon', category: 'basic' },
	star: {
		d: 'M50 4L61 37H96L68 58L78 92L50 71L22 92L32 58L4 37H39Z',
		label: 'Star',
		category: 'basic',
	},
	bolt: { d: 'M58 2L14 58H46L38 98L86 38H54L64 2Z', label: 'Bolt', category: 'basic' },
	heart: {
		d: 'M50 90L14 54A21 21 0 0 1 50 22A21 21 0 0 1 86 54Z',
		label: 'Heart',
		category: 'basic',
	},
	crescent: {
		d: 'M70 10A42 42 0 1 0 70 90A48 48 0 0 1 70 10Z',
		label: 'Crescent',
		category: 'basic',
	},
	ring: {
		d: 'M50 6a44 44 0 1 0 0.01 0ZM50 26a24 24 0 1 1 -0.01 0Z',
		label: 'Ring',
		category: 'basic',
	},
	cross: {
		d: 'M38 6H62V38H94V62H62V94H38V62H6V38H38Z',
		label: 'Cross',
		category: 'basic',
	},
	arrow: { d: 'M6 38H56V14L94 50L56 86V62H6Z', label: 'Arrow', category: 'basic' },
	chevron: {
		d: 'M8 20L50 50L8 80V62L32 50L8 38ZM50 20L92 50L50 80V62L74 50L50 38Z',
		label: 'Chevrons',
		category: 'basic',
	},
	shield: {
		d: 'M50 4L90 18V48C90 72 72 88 50 96C28 88 10 72 10 48V18Z',
		label: 'Shield',
		category: 'basic',
	},
	teardrop: {
		d: 'M50 4C50 4 84 44 84 64A34 34 0 0 1 16 64C16 44 50 4 50 4Z',
		label: 'Drop',
		category: 'basic',
	},
	spark: {
		d: 'M50 2L60 40L98 50L60 60L50 98L40 60L2 50L40 40Z',
		label: 'Spark',
		category: 'basic',
	},
	'wave-line': {
		d: 'M4 40C20 20 34 20 50 40S80 60 96 40V60C80 80 66 80 50 60S20 40 4 60Z',
		label: 'Wave line',
		category: 'lines',
	},
	'zigzag-line': {
		d: 'M4 42L22 24L40 42L58 24L76 42L96 22V46L76 66L58 48L40 66L22 48L4 66Z',
		label: 'Zigzag line',
		category: 'lines',
	},
	swoosh: {
		d: 'M4 70C30 70 60 50 96 14C80 50 50 84 4 86Z',
		label: 'Swoosh',
		category: 'lines',
	},
} as const satisfies Record<string, BasicShape>;

export interface ShapeDefinition {
	id: ShapeKind;
	label: string;
	category: ShapeCategory;
	d: string;
	box: number;
}

export const SHAPE_DEFINITIONS: readonly ShapeDefinition[] = [
	...Object.entries(BASIC_SHAPES).map(([id, shape]) => ({
		id: id as ShapeKind,
		label: shape.label,
		category: shape.category,
		d: shape.d,
		box: SHAPE_BOX,
	})),
	...LIBRARY_SHAPES.map((shape) => ({
		id: shape.id,
		label: shape.label,
		category: shape.category,
		d: shape.d,
		box: LIBRARY_SHAPE_BOX,
	})),
];

const BY_ID = new Map(SHAPE_DEFINITIONS.map((shape) => [shape.id, shape]));

export const getShapeDefinition = ({ shape }: { shape: ShapeKind }): ShapeDefinition =>
	BY_ID.get(shape) ?? {
		id: shape,
		label: BASIC_SHAPES.circle.label,
		category: 'basic',
		d: BASIC_SHAPES.circle.d,
		box: SHAPE_BOX,
	};

export const SHAPE_PATHS = {
	star: BASIC_SHAPES.star.d,
	bolt: BASIC_SHAPES.bolt.d,
} as const;

export const SHAPE_CATEGORIES: readonly { id: ShapeCategory; label: string }[] = [
	{ id: 'basic', label: 'Shapes' },
	{ id: 'lines', label: 'Lines & curves' },
	{ id: 'symbols', label: 'Symbols' },
	{ id: 'creatures', label: 'Creatures' },
];

export const getNextShapeU = ({ count }: { count: number }): number =>
	Math.round(((0.35 + count * 0.09) % 1) * 100) / 100;
