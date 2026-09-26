const TAU = Math.PI * 2;

export interface ProfilePoint {
	radial: number;
	depth: number;
	normalRadial: number;
	normalDepth: number;
	v: number;
}

export const fillPeriodicGaps = ({
	values,
	isValid,
}: {
	values: readonly number[];
	isValid: readonly boolean[];
}): number[] => {
	const count = values.length;
	const valid = values
		.map((_, index) => index)
		.filter((index) => isValid[index] === true);
	if (valid.length === 0) {
		return [...values];
	}
	return values.map((value, index) => {
		if (isValid[index] === true) {
			return value;
		}
		let before = index;
		let after = index;
		let back = 0;
		let ahead = 0;
		while (isValid[before] !== true) {
			before = (before - 1 + count) % count;
			back += 1;
		}
		while (isValid[after] !== true) {
			after = (after + 1) % count;
			ahead += 1;
		}
		const from = values[before] ?? value;
		const to = values[after] ?? value;
		return from + ((to - from) * back) / (back + ahead);
	});
};

export const smoothPeriodic = ({
	values,
	radius,
}: {
	values: readonly number[];
	radius: number;
}): number[] => {
	const count = values.length;
	return values.map((_, index) => {
		let sum = 0;
		for (let offset = -radius; offset <= radius; offset += 1) {
			sum += values[(index + offset + count) % count] ?? 0;
		}
		return sum / (radius * 2 + 1);
	});
};

export interface ProfileGroove {
	halfWidth: number;
	depth: number;
}

export const buildRoundedProfile = ({
	halfWidth,
	halfDepth,
	corner,
	samples,
	groove = null,
}: {
	halfWidth: number;
	halfDepth: number;
	corner: number;
	samples: number;
	groove?: ProfileGroove | null;
}): ProfilePoint[] => {
	const radius = Math.min(corner, halfWidth, halfDepth);
	const flatRadial = halfWidth - radius;
	const flatDepth = halfDepth - radius;
	const quarter = Math.PI / 2;
	const segments: { length: number; at: (t: number) => Omit<ProfilePoint, 'v'> }[] = [];
	const straight = ({
		from,
		to,
		normal,
	}: {
		from: readonly [number, number];
		to: readonly [number, number];
		normal: readonly [number, number];
	}): void => {
		segments.push({
			length: Math.hypot(to[0] - from[0], to[1] - from[1]),
			at: (t) => ({
				radial: from[0] + (to[0] - from[0]) * t,
				depth: from[1] + (to[1] - from[1]) * t,
				normalRadial: normal[0],
				normalDepth: normal[1],
			}),
		});
	};
	const arc = ({
		center,
		start,
	}: {
		center: readonly [number, number];
		start: number;
	}): void => {
		segments.push({
			length: radius * quarter,
			at: (t) => {
				const angle = start + quarter * t;
				return {
					radial: center[0] + Math.cos(angle) * radius,
					depth: center[1] + Math.sin(angle) * radius,
					normalRadial: Math.cos(angle),
					normalDepth: Math.sin(angle),
				};
			},
		});
	};

	straight({ from: [0, halfDepth], to: [-flatRadial, halfDepth], normal: [0, 1] });
	arc({ center: [-flatRadial, flatDepth], start: quarter });
	straight({
		from: [-halfWidth, flatDepth],
		to: [-halfWidth, -flatDepth],
		normal: [-1, 0],
	});
	arc({ center: [-flatRadial, -flatDepth], start: Math.PI });
	straight({
		from: [-flatRadial, -halfDepth],
		to: [flatRadial, -halfDepth],
		normal: [0, -1],
	});
	arc({ center: [flatRadial, -flatDepth], start: Math.PI + quarter });
	if (groove === null) {
		straight({
			from: [halfWidth, -flatDepth],
			to: [halfWidth, flatDepth],
			normal: [1, 0],
		});
	} else {
		const gap = Math.min(groove.halfWidth, flatDepth);
		const floor = halfWidth - groove.depth;
		straight({ from: [halfWidth, -flatDepth], to: [halfWidth, -gap], normal: [1, 0] });
		straight({ from: [halfWidth, -gap], to: [floor, -gap], normal: [0, 1] });
		straight({ from: [floor, -gap], to: [floor, gap], normal: [1, 0] });
		straight({ from: [floor, gap], to: [halfWidth, gap], normal: [0, -1] });
		straight({ from: [halfWidth, gap], to: [halfWidth, flatDepth], normal: [1, 0] });
	}
	arc({ center: [flatRadial, flatDepth], start: 0 });
	straight({ from: [flatRadial, halfDepth], to: [0, halfDepth], normal: [0, 1] });

	const total = segments.reduce((sum, segment) => sum + segment.length, 0);
	return Array.from({ length: samples + 1 }, (_, index) => {
		const v = index / samples;
		let distance = v * total;
		for (const segment of segments) {
			if (distance <= segment.length || segment === segments.at(-1)) {
				const t = segment.length === 0 ? 0 : Math.min(1, distance / segment.length);
				return { ...segment.at(t), v };
			}
			distance -= segment.length;
		}
		return { radial: 0, depth: halfDepth, normalRadial: 0, normalDepth: 1, v };
	});
};

export const getProfilePerimeter = ({
	halfWidth,
	halfDepth,
	corner,
	groove = null,
}: {
	halfWidth: number;
	halfDepth: number;
	corner: number;
	groove?: ProfileGroove | null;
}): number => {
	const radius = Math.min(corner, halfWidth, halfDepth);
	const walls = groove === null ? 0 : 2 * groove.depth;
	return 4 * (halfWidth - radius) + 4 * (halfDepth - radius) + TAU * radius + walls;
};

export interface SweepInput {
	centerRadius: readonly number[];
	halfWidth: readonly number[];
	halfDepth: number;
	corner: number;
	ringSamples: number;
	groove?: ProfileGroove | null;
}

export interface SweepResult {
	positions: number[];
	normals: number[];
	uvs: number[];
	indices: number[];
	loopLength: number;
	perimeter: number;
}

export const sweepLoop = ({
	centerRadius,
	halfWidth,
	halfDepth,
	corner,
	ringSamples,
	groove = null,
}: SweepInput): SweepResult => {
	const count = centerRadius.length;
	const point = ({ index }: { index: number }): readonly [number, number] => {
		const wrapped = ((index % count) + count) % count;
		const angle = (wrapped / count) * TAU;
		const radius = centerRadius[wrapped] ?? 0;
		return [Math.cos(angle) * radius, Math.sin(angle) * radius];
	};
	const arc = [0];
	for (let index = 0; index < count; index += 1) {
		const [ax, ay] = point({ index });
		const [bx, by] = point({ index: index + 1 });
		arc.push((arc[index] ?? 0) + Math.hypot(bx - ax, by - ay));
	}
	const loopLength = arc[count] ?? 1;
	const positions: number[] = [];
	const normals: number[] = [];
	const uvs: number[] = [];
	let perimeterSum = 0;

	for (let index = 0; index <= count; index += 1) {
		const [px, py] = point({ index });
		const [bx, by] = point({ index: index - 1 });
		const [ax, ay] = point({ index: index + 1 });
		const tx = ax - bx;
		const ty = ay - by;
		const length = Math.max(Math.hypot(tx, ty), Number.EPSILON);
		const nx = ty / length;
		const ny = -tx / length;
		const width = halfWidth[index % count] ?? 0;
		perimeterSum +=
			index < count
				? getProfilePerimeter({ halfWidth: width, halfDepth, corner, groove })
				: 0;
		const profile = buildRoundedProfile({
			halfWidth: width,
			halfDepth,
			corner,
			samples: ringSamples,
			groove,
		});
		const u = (arc[index] ?? 0) / loopLength;
		for (const sample of profile) {
			positions.push(px + nx * sample.radial, py + ny * sample.radial, sample.depth);
			normals.push(
				nx * sample.normalRadial,
				ny * sample.normalRadial,
				sample.normalDepth,
			);
			uvs.push(u, sample.v);
		}
	}

	const ring = ringSamples + 1;
	const indices: number[] = [];
	for (let index = 0; index < count; index += 1) {
		for (let step = 0; step < ringSamples; step += 1) {
			const a = index * ring + step;
			const b = (index + 1) * ring + step;
			indices.push(a, b, a + 1, a + 1, b, b + 1);
		}
	}

	return {
		positions,
		normals,
		uvs,
		indices,
		loopLength,
		perimeter: perimeterSum / count,
	};
};
