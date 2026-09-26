import { MAX_LAYERS } from '@uniq/shared';

import type { DesignCommand } from '@builder/design/design-commands';
import type {
	DesignDocument,
	DesignLayer,
	LineOverlay,
	PrintOverlay,
	ShapeKind,
	ShapeLayer,
	StickerId,
	StickerLayer,
	ZoneId,
} from '@uniq/shared';

export const withLinkedZonesCommand = ({
	command,
	source,
	targets,
}: {
	command: DesignCommand;
	source: ZoneId;
	targets: readonly ZoneId[];
}): DesignCommand => ({
	label: command.label,
	mergeKey: command.mergeKey,
	apply: ({ document }) => {
		const next = command.apply({ document });
		if (next === document) {
			return document;
		}
		const zones = { ...next.zones };
		for (const target of targets) {
			zones[target] = structuredClone(next.zones[source]);
		}
		return { ...next, zones };
	},
});

const updateOverlays = ({
	document,
	zoneId,
	patch,
}: {
	document: DesignDocument;
	zoneId: ZoneId;
	patch: Partial<DesignDocument['overlays'][ZoneId]>;
}): DesignDocument => ({
	...document,
	overlays: {
		...document.overlays,
		[zoneId]: { ...document.overlays[zoneId], ...patch },
	},
});

export const setZoneLinesCommand = ({
	zoneId,
	lines,
	mergeKey = null,
}: {
	zoneId: ZoneId;
	lines: LineOverlay | null;
	mergeKey?: string | null;
}): DesignCommand => ({
	label: lines === null ? `Remove lines ${zoneId}` : `Lines ${zoneId}`,
	mergeKey,
	apply: ({ document }) => updateOverlays({ document, zoneId, patch: { lines } }),
});

export const setZonePrintCommand = ({
	zoneId,
	print,
	mergeKey = null,
}: {
	zoneId: ZoneId;
	print: PrintOverlay | null;
	mergeKey?: string | null;
}): DesignCommand => ({
	label: print === null ? `Remove print ${zoneId}` : `Print ${zoneId}`,
	mergeKey,
	apply: ({ document }) => updateOverlays({ document, zoneId, patch: { print } }),
});

export const createShapeLayer = ({
	id,
	shape,
	zone,
	color,
	u,
}: {
	id: string;
	shape: ShapeKind;
	zone: ZoneId;
	color: string;
	u: number;
}): ShapeLayer => ({
	id,
	kind: 'shape',
	zone,
	shape,
	color,
	position: { u, v: 0.5 },
	rotation: 0,
	scale: 0.7,
});

export const createStickerLayer = ({
	id,
	stickerId,
	zone,
	u,
}: {
	id: string;
	stickerId: StickerId;
	zone: ZoneId;
	u: number;
}): StickerLayer => ({
	id,
	kind: 'sticker',
	zone,
	stickerId,
	position: { u, v: 0.5 },
	rotation: 0,
	scale: 0.8,
});

export const addLayerCommand = ({ layer }: { layer: DesignLayer }): DesignCommand => ({
	label: `Add ${layer.kind === 'shape' ? layer.shape : layer.stickerId}`,
	mergeKey: null,
	apply: ({ document }) =>
		document.layers.length >= MAX_LAYERS ||
		document.layers.some((existing) => existing.id === layer.id)
			? document
			: { ...document, layers: [...document.layers, layer] },
});

export type ShapeLayerPatch = Partial<
	Pick<ShapeLayer, 'zone' | 'shape' | 'color' | 'position' | 'rotation' | 'scale'>
>;

const patchLayer = ({
	layer,
	patch,
}: {
	layer: DesignLayer;
	patch: ShapeLayerPatch;
}): DesignLayer => {
	if (layer.kind === 'shape') {
		return { ...layer, ...patch };
	}
	const {
		zone = layer.zone,
		position = layer.position,
		rotation = layer.rotation,
		scale = layer.scale,
	} = patch;
	return { ...layer, zone, position, rotation, scale };
};

export const updateLayerCommand = ({
	layerId,
	patch,
	mergeKey = null,
}: {
	layerId: string;
	patch: ShapeLayerPatch;
	mergeKey?: string | null;
}): DesignCommand => ({
	label: 'Edit layer',
	mergeKey,
	apply: ({ document }) =>
		document.layers.some((layer) => layer.id === layerId)
			? {
					...document,
					layers: document.layers.map((layer) =>
						layer.id === layerId ? patchLayer({ layer, patch }) : layer,
					),
				}
			: document,
});

export const removeLayerCommand = ({ layerId }: { layerId: string }): DesignCommand => ({
	label: 'Remove layer',
	mergeKey: null,
	apply: ({ document }) =>
		document.layers.some((layer) => layer.id === layerId)
			? { ...document, layers: document.layers.filter((layer) => layer.id !== layerId) }
			: document,
});
