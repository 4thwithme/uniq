import type { GradientStop } from '@uniq/shared';

export interface WorldPoint {
	x: number;
	y: number;
}

export interface WorldExtent {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

export type WorldAt = (params: { u: number; v: number }) => WorldPoint;

const toRgb = ({ hex }: { hex: string }): [number, number, number] => [
	Number.parseInt(hex.slice(1, 3), 16),
	Number.parseInt(hex.slice(3, 5), 16),
	Number.parseInt(hex.slice(5, 7), 16),
];

const toHex = ({ rgb }: { rgb: readonly number[] }): string =>
	`#${rgb.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

export const colorAt = ({
	stops,
	t,
}: {
	stops: readonly GradientStop[];
	t: number;
}): string => {
	const sorted = [...stops].sort((a, b) => a.offset - b.offset);
	const first = sorted[0];
	const last = sorted.at(-1);
	if (first === undefined || last === undefined) {
		return '#000000';
	}
	if (t <= first.offset) {
		return first.color;
	}
	if (t >= last.offset) {
		return last.color;
	}
	const index = sorted.findIndex((stop) => stop.offset >= t);
	const after = sorted[index] ?? last;
	const before = sorted[index - 1] ?? first;
	const span = after.offset - before.offset;
	const mix = span === 0 ? 0 : (t - before.offset) / span;
	const from = toRgb({ hex: before.color });
	const to = toRgb({ hex: after.color });
	return toHex({
		rgb: from.map((value, channel) => value + ((to[channel] ?? value) - value) * mix),
	});
};

export const gradientT = ({
	point,
	angle,
	extent,
}: {
	point: WorldPoint;
	angle: number;
	extent: WorldExtent;
}): number => {
	const radians = (angle * Math.PI) / 180;
	const dx = Math.sin(radians);
	const dy = Math.cos(radians);
	const corners = [
		extent.minX * dx + extent.minY * dy,
		extent.maxX * dx + extent.minY * dy,
		extent.minX * dx + extent.maxY * dy,
		extent.maxX * dx + extent.maxY * dy,
	];
	const low = Math.min(...corners);
	const high = Math.max(...corners);
	const span = Math.max(high - low, Number.EPSILON);
	return Math.min(1, Math.max(0, (point.x * dx + point.y * dy - low) / span));
};

export const buildColumnTable = ({
	positions,
	uvs,
	bins,
}: {
	positions: ArrayLike<number>;
	uvs: ArrayLike<number>;
	bins: number;
}): WorldPoint[] => {
	const sums = Array.from({ length: bins }, () => ({ x: 0, y: 0, count: 0 }));
	const count = Math.floor(positions.length / 3);
	for (let index = 0; index < count; index += 1) {
		const u = (((uvs[index * 2] ?? 0) % 1) + 1) % 1;
		const sum = sums[Math.min(bins - 1, Math.floor(u * bins))];
		if (sum !== undefined) {
			sum.x += positions[index * 3] ?? 0;
			sum.y += positions[index * 3 + 1] ?? 0;
			sum.count += 1;
		}
	}
	const filled = sums.map((sum) =>
		sum.count === 0 ? null : { x: sum.x / sum.count, y: sum.y / sum.count },
	);
	return filled.map((point, bin) => {
		if (point !== null) {
			return point;
		}
		for (let step = 1; step < bins; step += 1) {
			const near = filled[(bin + step) % bins] ?? filled[(bin - step + bins) % bins];
			if (near !== null && near !== undefined) {
				return near;
			}
		}
		return { x: 0, y: 0 };
	});
};

export const columnWorldAt = ({ table }: { table: readonly WorldPoint[] }): WorldAt => {
	const bins = table.length;
	return ({ u }) => {
		const scaled = (((u % 1) + 1) % 1) * bins - 0.5;
		const index = Math.floor(scaled);
		const mix = scaled - index;
		const a = table[(index + bins) % bins] ?? { x: 0, y: 0 };
		const b = table[(index + 1) % bins] ?? a;
		return { x: a.x + (b.x - a.x) * mix, y: a.y + (b.y - a.y) * mix };
	};
};

export const planarWorldAt =
	({ extent }: { extent: WorldExtent }): WorldAt =>
	({ u, v }) => {
		const wrapped = ((v % 1) + 1) % 1;
		const isBack = wrapped > 0.25 && wrapped < 0.75;
		const across = isBack ? 0.5 - wrapped : wrapped > 0.5 ? wrapped - 1 : wrapped;
		return {
			x: extent.minX + (across * 2 + 0.5) * (extent.maxX - extent.minX),
			y: extent.minY + u * (extent.maxY - extent.minY),
		};
	};

export const getClockU = ({
	table,
	hour,
}: {
	table: readonly WorldPoint[];
	hour: number;
}): number => {
	const target = ((90 - hour * 30) * Math.PI) / 180;
	const targetAngle = Math.atan2(Math.sin(target), Math.cos(target));
	let best = { index: 0, delta: Number.POSITIVE_INFINITY };
	table.forEach((point, index) => {
		const raw = Math.abs(Math.atan2(point.y, point.x) - targetAngle);
		const delta = Math.min(raw, Math.PI * 2 - raw);
		if (delta < best.delta) {
			best = { index, delta };
		}
	});
	return (best.index + 0.5) / Math.max(table.length, 1);
};
