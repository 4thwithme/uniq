import { useThree } from '@react-three/fiber';
import { useRef } from 'react';

import {
	findLayerAt,
	findPrintAt,
	moveLayerPosition,
	movePrintOffset,
	uvToSurfaceHit,
} from '@builder/decor/surface-coords';
import { setZonePrintCommand, updateLayerCommand } from '@builder/design/decor-commands';
import { useDesignStore } from '@builder/store/design-store';

import type { SurfaceBand } from '@builder/decor/frame-faces';
import type { PrintGrab, SurfaceHit, SurfaceSize } from '@builder/decor/surface-coords';
import type { ThreeEvent } from '@react-three/fiber';
import type { ZoneId } from '@uniq/shared';

type Drag =
	| { kind: 'layer'; layerId: string; grab: { du: number; dv: number } }
	| { kind: 'print'; zoneId: ZoneId; grab: PrintGrab };

interface CaptureTarget {
	setPointerCapture?: (pointerId: number) => void;
	releasePointerCapture?: (pointerId: number) => void;
}

export interface SurfaceDragHandlers {
	onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
	onPointerMove: (event: ThreeEvent<PointerEvent>) => void;
	onPointerUp: (event: ThreeEvent<PointerEvent>) => void;
}

export const useSurfaceDrag = ({
	zoneId,
	printZoneId,
	size,
	bands,
	printAspect,
}: {
	zoneId: ZoneId;
	printZoneId: ZoneId;
	size: SurfaceSize;
	bands: readonly SurfaceBand[];
	printAspect: number | null;
}): SurfaceDragHandlers => {
	const get = useThree((state) => state.get);
	const drag = useRef<Drag | null>(null);

	const setControlsEnabled = ({ enabled }: { enabled: boolean }): void => {
		const controls = get().controls as { enabled: boolean } | null;
		if (controls !== null) {
			controls.enabled = enabled;
		}
	};

	const hitAt = ({ event }: { event: ThreeEvent<PointerEvent> }): SurfaceHit | null =>
		event.uv === undefined ? null : uvToSurfaceHit({ uv: event.uv, bands });

	return {
		// eslint-disable-next-line custom-rules/require-object-params
		onPointerDown: (event) => {
			const hit = hitAt({ event });
			if (hit === null) {
				return;
			}
			const { document, selectLayer } = useDesignStore.getState();
			const layer = findLayerAt({
				layers: document.layers.filter((item) => item.zone === zoneId),
				position: hit.position,
				size,
			});
			const print = document.overlays[printZoneId].print;
			// A print now tiles the whole zone, so on touch every press would
			// otherwise grab it instead of orbiting the camera; touch users
			// still reposition it with the Position X/Y sliders.
			const printGrab =
				layer === null &&
				print !== null &&
				printAspect !== null &&
				event.pointerType !== 'touch'
					? findPrintAt({ print, position: hit.position, size, aspect: printAspect })
					: null;

			if (layer !== null) {
				drag.current = {
					kind: 'layer',
					layerId: layer.id,
					grab: {
						du: hit.position.u - layer.position.u,
						dv: hit.position.v - layer.position.v,
					},
				};
				selectLayer({ layerId: layer.id });
			} else if (printGrab !== null) {
				drag.current = { kind: 'print', zoneId: printZoneId, grab: printGrab };
			} else {
				return;
			}
			event.stopPropagation();
			setControlsEnabled({ enabled: false });
			(event.target as CaptureTarget | null)?.setPointerCapture?.(event.pointerId);
		},
		// eslint-disable-next-line custom-rules/require-object-params
		onPointerMove: (event) => {
			const active = drag.current;
			const hit = active === null ? null : hitAt({ event });
			if (active === null || hit === null) {
				return;
			}
			event.stopPropagation();
			const { document, execute } = useDesignStore.getState();
			if (active.kind === 'layer') {
				execute({
					command: updateLayerCommand({
						layerId: active.layerId,
						patch: {
							position: moveLayerPosition({ position: hit.position, grab: active.grab }),
						},
						mergeKey: `drag-shape:${active.layerId}`,
					}),
				});
				return;
			}
			const print = document.overlays[active.zoneId].print;
			if (print !== null) {
				execute({
					command: setZonePrintCommand({
						zoneId: active.zoneId,
						print: {
							...print,
							...movePrintOffset({
								position: hit.position,
								grab: active.grab,
								repeat: print.repeat,
							}),
						},
						mergeKey: `drag-print:${active.zoneId}`,
					}),
				});
			}
		},
		// eslint-disable-next-line custom-rules/require-object-params
		onPointerUp: (event) => {
			if (drag.current === null) {
				return;
			}
			drag.current = null;
			event.stopPropagation();
			setControlsEnabled({ enabled: true });
			(event.target as CaptureTarget | null)?.releasePointerCapture?.(event.pointerId);
		},
	};
};
