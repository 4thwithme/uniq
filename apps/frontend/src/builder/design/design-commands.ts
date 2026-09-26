import { MAX_GRADIENT_STOPS, MIN_GRADIENT_STOPS } from '@uniq/shared';

import type {
	DesignDocument,
	Finish,
	GradientFill,
	ZoneFill,
	ZoneId,
} from '@uniq/shared';

export interface DesignCommand {
	label: string;
	mergeKey: string | null;
	apply: (params: { document: DesignDocument }) => DesignDocument;
}

const updateZone = ({
	document,
	zoneId,
	update,
}: {
	document: DesignDocument;
	zoneId: ZoneId;
	update: (paint: DesignDocument['zones'][ZoneId]) => DesignDocument['zones'][ZoneId];
}): DesignDocument => ({
	...document,
	zones: { ...document.zones, [zoneId]: update(document.zones[zoneId]) },
	meta: { ...document.meta, themeId: null },
});

const DEFAULT_GRADIENT_ANGLE = 0;
const clamp01 = ({ value }: { value: number }): number => Math.min(1, Math.max(0, value));

export const toGradientFill = ({ fill }: { fill: ZoneFill }): GradientFill => {
	if (fill.kind === 'gradient') {
		return fill;
	}

	return {
		kind: 'gradient',
		angle: DEFAULT_GRADIENT_ANGLE,
		stops: [
			{ offset: 0, color: fill.color },
			{ offset: 1, color: '#ffffff' },
		],
	};
};

export const toSolidFill = ({ fill }: { fill: ZoneFill }): ZoneFill => {
	if (fill.kind === 'solid') {
		return fill;
	}

	const [firstStop] = fill.stops;

	return { kind: 'solid', color: firstStop?.color ?? '#ffffff' };
};

export const setZoneFillCommand = ({
	zoneId,
	fill,
	mergeKey = null,
}: {
	zoneId: ZoneId;
	fill: ZoneFill;
	mergeKey?: string | null;
}): DesignCommand => ({
	label: `Paint ${zoneId}`,
	mergeKey,
	apply: ({ document }) =>
		updateZone({ document, zoneId, update: (paint) => ({ ...paint, fill }) }),
});

export const setZoneFinishCommand = ({
	zoneId,
	finish,
}: {
	zoneId: ZoneId;
	finish: Finish;
}): DesignCommand => ({
	label: `Finish ${zoneId}`,
	mergeKey: null,
	apply: ({ document }) =>
		updateZone({ document, zoneId, update: (paint) => ({ ...paint, finish }) }),
});

export const setGradientStopCommand = ({
	zoneId,
	index,
	color,
	offset,
}: {
	zoneId: ZoneId;
	index: number;
	color?: string;
	offset?: number;
}): DesignCommand => ({
	label: `Gradient stop ${zoneId}`,
	mergeKey: `gradient-stop:${zoneId}:${String(index)}`,
	apply: ({ document }) =>
		updateZone({
			document,
			zoneId,
			update: (paint) => {
				const gradient = toGradientFill({ fill: paint.fill });
				const stops = gradient.stops.map((stop, stopIndex) =>
					stopIndex === index
						? {
								color: color ?? stop.color,
								offset: offset === undefined ? stop.offset : clamp01({ value: offset }),
							}
						: stop,
				);

				return { ...paint, fill: { ...gradient, stops } };
			},
		}),
});

export const addGradientStopCommand = ({
	zoneId,
}: {
	zoneId: ZoneId;
}): DesignCommand => ({
	label: `Add gradient stop ${zoneId}`,
	mergeKey: null,
	apply: ({ document }) =>
		updateZone({
			document,
			zoneId,
			update: (paint) => {
				const gradient = toGradientFill({ fill: paint.fill });

				if (gradient.stops.length >= MAX_GRADIENT_STOPS) {
					return paint;
				}

				const lastStop = gradient.stops[gradient.stops.length - 1];
				const stops = [
					...gradient.stops.slice(0, -1),
					{ offset: 0.5, color: lastStop?.color ?? '#ffffff' },
					...gradient.stops.slice(-1),
				].toSorted((left, right) => left.offset - right.offset);

				return { ...paint, fill: { ...gradient, stops } };
			},
		}),
});

export const removeGradientStopCommand = ({
	zoneId,
	index,
}: {
	zoneId: ZoneId;
	index: number;
}): DesignCommand => ({
	label: `Remove gradient stop ${zoneId}`,
	mergeKey: null,
	apply: ({ document }) =>
		updateZone({
			document,
			zoneId,
			update: (paint) => {
				const gradient = toGradientFill({ fill: paint.fill });

				if (gradient.stops.length <= MIN_GRADIENT_STOPS) {
					return paint;
				}

				const stops = gradient.stops.filter((_stop, stopIndex) => stopIndex !== index);

				return { ...paint, fill: { ...gradient, stops } };
			},
		}),
});

export const setGradientAngleCommand = ({
	zoneId,
	angle,
}: {
	zoneId: ZoneId;
	angle: number;
}): DesignCommand => ({
	label: `Gradient angle ${zoneId}`,
	mergeKey: `gradient-angle:${zoneId}`,
	apply: ({ document }) =>
		updateZone({
			document,
			zoneId,
			update: (paint) => ({
				...paint,
				fill: {
					...toGradientFill({ fill: paint.fill }),
					angle: ((angle % 360) + 360) % 360,
				},
			}),
		}),
});

export const setGripCommand = ({
	grip,
}: {
	grip: DesignDocument['grip'];
}): DesignCommand => ({
	label: 'Grip',
	mergeKey: null,
	apply: ({ document }) =>
		JSON.stringify(document.grip) === JSON.stringify(grip)
			? document
			: { ...document, grip, meta: { ...document.meta, themeId: null } },
});

export const setButtCapCommand = ({
	buttCap,
	mergeKey = null,
}: {
	buttCap: DesignDocument['buttCap'];
	mergeKey?: string | null;
}): DesignCommand => ({
	label: 'Grip Cap',
	mergeKey,
	apply: ({ document }) =>
		JSON.stringify(document.buttCap) === JSON.stringify(buttCap)
			? document
			: { ...document, buttCap },
});

export const setGrommetsCommand = ({
	grommets,
}: {
	grommets: DesignDocument['grommets'];
}): DesignCommand => ({
	label: 'Grommets',
	mergeKey: null,
	apply: ({ document }) =>
		JSON.stringify(document.grommets) === JSON.stringify(grommets)
			? document
			: { ...document, grommets, meta: { ...document.meta, themeId: null } },
});

export const setFinishingTapeCommand = ({
	finishingTape,
}: {
	finishingTape: DesignDocument['finishingTape'];
}): DesignCommand => ({
	label: 'Finishing tape',
	mergeKey: null,
	apply: ({ document }) =>
		JSON.stringify(document.finishingTape) === JSON.stringify(finishingTape)
			? document
			: { ...document, finishingTape, meta: { ...document.meta, themeId: null } },
});

export const setLogoCommand = ({
	logo,
	mergeKey = null,
}: {
	logo: DesignDocument['logo'];
	mergeKey?: string | null;
}): DesignCommand => ({
	label: 'HEAD logo',
	mergeKey,
	apply: ({ document }) =>
		JSON.stringify(document.logo) === JSON.stringify(logo)
			? document
			: { ...document, logo },
});
