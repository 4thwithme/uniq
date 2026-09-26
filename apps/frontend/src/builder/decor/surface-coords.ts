import type { SurfaceBand } from '@builder/decor/frame-faces';
import type { DesignLayer, LayerPosition, PrintOverlay } from '@uniq/shared';

export interface SurfaceSize {
	width: number;
	height: number;
}

export interface SurfaceHit {
	position: LayerPosition;
	band: SurfaceBand;
}

const wrapUnit = ({ value }: { value: number }): number => ((value % 1) + 1) % 1;

const clampUnit = ({ value }: { value: number }): number =>
	Math.min(1, Math.max(0, value));

export const circularDelta = ({ from, to }: { from: number; to: number }): number => {
	const delta = wrapUnit({ value: to - from });
	return delta > 0.5 ? delta - 1 : delta;
};

export const uvToSurfaceHit = ({
	uv,
	bands,
}: {
	uv: { x: number; y: number };
	bands: readonly SurfaceBand[];
}): SurfaceHit | null => {
	let best: { band: SurfaceBand; delta: number } | null = null;
	for (const band of bands) {
		const delta = circularDelta({ from: band.centerV, to: uv.y });
		if (best === null || Math.abs(delta) < Math.abs(best.delta)) {
			best = { band, delta };
		}
	}
	if (best === null) {
		return null;
	}
	return {
		band: best.band,
		position: {
			u: wrapUnit({ value: uv.x }),
			v: clampUnit({ value: 0.5 - 2 * best.delta }),
		},
	};
};

export const findLayerAt = ({
	layers,
	position,
	size,
}: {
	layers: readonly DesignLayer[];
	position: LayerPosition;
	size: SurfaceSize;
}): DesignLayer | null => {
	const bandHeight = size.height / 2;
	let best: { layer: DesignLayer; distance: number } | null = null;
	for (const layer of layers) {
		const dx = circularDelta({ from: layer.position.u, to: position.u }) * size.width;
		const dy = (position.v - layer.position.v) * bandHeight;
		const distance = Math.hypot(dx, dy);
		const radius = (bandHeight * layer.scale) / 2;
		if (distance <= radius && (best === null || distance <= best.distance)) {
			best = { layer, distance };
		}
	}
	return best?.layer ?? null;
};

export interface PrintGrab {
	index: number;
	du: number;
	dv: number;
}

export const findPrintAt = ({
	print,
	position,
	size,
	aspect,
}: {
	print: PrintOverlay;
	position: LayerPosition;
	size: SurfaceSize;
	aspect: number;
}): PrintGrab | null => {
	const bandHeight = size.height / 2;
	const halfHeight = (bandHeight * print.scale) / 2;
	const halfWidth = halfHeight * aspect;
	for (let index = 0; index < print.repeat; index += 1) {
		const u = wrapUnit({ value: print.offset + index / print.repeat });
		const du = circularDelta({ from: u, to: position.u });
		const dv = position.v - print.offsetY;
		if (
			Math.abs(du * size.width) <= halfWidth &&
			Math.abs(dv * bandHeight) <= halfHeight
		) {
			return { index, du, dv };
		}
	}
	return null;
};

export const moveLayerPosition = ({
	position,
	grab,
}: {
	position: LayerPosition;
	grab: { du: number; dv: number };
}): LayerPosition => ({
	u: Math.round(wrapUnit({ value: position.u - grab.du }) * 1000) / 1000,
	v: Math.round(clampUnit({ value: position.v - grab.dv }) * 1000) / 1000,
});

export const movePrintOffset = ({
	position,
	grab,
	repeat,
}: {
	position: LayerPosition;
	grab: PrintGrab;
	repeat: number;
}): { offset: number; offsetY: number } => {
	const next = moveLayerPosition({
		position: { u: position.u - grab.index / repeat, v: position.v },
		grab,
	});
	return { offset: next.u, offsetY: next.v };
};
