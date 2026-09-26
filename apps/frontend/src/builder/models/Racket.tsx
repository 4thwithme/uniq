import { Decal, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { DEFAULT_LOGO } from '@uniq/shared';
import { useEffect, useMemo } from 'react';
import { Box3, Mesh, Vector3 } from 'three';

import { useSurfaceDrag } from '@builder/controls/useSurfaceDrag';
import {
	COVER_CLOCK_HOURS,
	HEAD_ICON_LOGO,
	LOGO_CLOCK_HOURS,
} from '@builder/decor/brand-logo';
import {
	FRAME_BANDS,
	getShaftSurfaceSize,
	getTubeSurfaceSize,
	TUBE_SURFACE_WIDTH,
} from '@builder/decor/frame-faces';
import {
	buildColumnTable,
	columnWorldAt,
	getClockU,
	planarWorldAt,
} from '@builder/decor/world-gradient';
import {
	createFinishingTapeGeometry,
	createGripWrapGeometry,
	getGripThickness,
} from '@builder/grips/grip-wrap';
import { FrameSurfaceMaterial } from '@builder/materials/FrameSurfaceMaterial';
import { GripMaterial } from '@builder/materials/GripMaterial';
import { createHeadLogoTexture } from '@builder/materials/head-logo-texture';
import { TrimMaterial } from '@builder/materials/TrimMaterial';
import { BUTT_CAP_HEIGHT, ButtCap } from '@builder/models/ButtCap';
import {
	getGeometryBottomY,
	getRacketGeometries,
	getTubeMetrics,
	RACKET_MODEL_URL,
} from '@builder/models/racket-model';

import type { PrintImage, StickerImages } from '@builder/decor/surface-painter';
import type {
	ButtCapSpec,
	DesignLayer,
	DesignOverlays,
	DesignZones,
	GripSpec,
	LogoSpec,
	TrimSpec,
} from '@uniq/shared';

interface RacketProps {
	zones: DesignZones;
	grip: GripSpec;
	buttCap: ButtCapSpec;
	grommets: TrimSpec;
	finishingTape: TrimSpec | null;
	overlays?: DesignOverlays | undefined;
	layers?: readonly DesignLayer[] | undefined;
	printImage?: PrintImage | null | undefined;
	stickerImages?: StickerImages | undefined;
	logo?: LogoSpec | undefined;
}

const NO_OVERLAYS = { lines: null, print: null } as const;
const NO_LAYERS: readonly DesignLayer[] = [];
const WORLD_COLUMNS = 512;

const aspectOf = ({ image }: { image: PrintImage | null }): number | null =>
	image === null || image.height === 0 ? null : image.width / image.height;

const STRING_COLOR = '#e8e4d8';
const BUTT_CAP_FACE_RADIUS = 0.0145;
const STRINGS_LOGO_WIDTH = 0.102;
const STRINGS_LOGO_HEIGHT =
	STRINGS_LOGO_WIDTH * (HEAD_ICON_LOGO.height / HEAD_ICON_LOGO.width);
const STRINGS_LOGO_DEPTH = 0.03;
const STRINGS_LOGO_TOP_RATIO = 0.25;

export function Racket({
	zones,
	grip,
	buttCap,
	grommets,
	finishingTape,
	overlays,
	layers = NO_LAYERS,
	printImage = null,
	stickerImages,
	logo = DEFAULT_LOGO,
}: RacketProps): React.JSX.Element {
	const invalidate = useThree((state) => state.invalidate);
	const { nodes } = useGLTF(RACKET_MODEL_URL);
	const geometries = useMemo(() => getRacketGeometries({ nodes }), [nodes]);
	const metrics = useMemo(() => getTubeMetrics({ nodes }), [nodes]);
	const frameSurface = useMemo(() => getTubeSurfaceSize({ metrics }), [metrics]);

	const gripThickness = getGripThickness({ grip });
	const gripGeometry = useMemo(
		() =>
			createGripWrapGeometry({ geometry: geometries.handle, thickness: gripThickness }),
		[geometries, gripThickness],
	);

	const hasTape = finishingTape !== null;
	const tapeGeometry = useMemo(
		() =>
			hasTape
				? createFinishingTapeGeometry({ geometry: geometries.handle, gripThickness })
				: null,
		[hasTape, geometries, gripThickness],
	);

	useEffect(() => {
		invalidate();
	}, [geometries, invalidate]);

	useEffect(
		() => (): void => {
			tapeGeometry?.dispose();
		},
		[tapeGeometry],
	);

	useEffect(
		() => (): void => {
			gripGeometry.dispose();
		},
		[gripGeometry],
	);
	const capBottomY = useMemo(
		() => getGeometryBottomY({ geometry: geometries.buttCap }),
		[geometries],
	);

	const stringsLogoTexture = useMemo(() => createHeadLogoTexture(), []);
	useEffect(
		() => (): void => {
			stringsLogoTexture?.dispose();
		},
		[stringsLogoTexture],
	);
	const stringsLogoPosition = useMemo(() => {
		const box = new Box3().setFromObject(new Mesh(geometries.strings));
		const center = box.getCenter(new Vector3());
		center.y = box.max.y - (box.max.y - box.min.y) * STRINGS_LOGO_TOP_RATIO;
		return center;
	}, [geometries]);

	const frameLayers = useMemo(
		() => layers.filter((layer) => layer.zone === 'frame'),
		[layers],
	);
	const throatLayers = useMemo(
		() => layers.filter((layer) => layer.zone === 'throat'),
		[layers],
	);
	const worlds = useMemo(() => {
		const frameBox = new Box3().setFromObject(new Mesh(geometries.frame));
		const throatBox = new Box3().setFromObject(new Mesh(geometries.throat));
		const extent = {
			minX: Math.min(frameBox.min.x, throatBox.min.x),
			maxX: Math.max(frameBox.max.x, throatBox.max.x),
			minY: Math.min(frameBox.min.y, throatBox.min.y),
			maxY: Math.max(frameBox.max.y, throatBox.max.y),
		};
		const table = buildColumnTable({
			positions: geometries.frame.getAttribute('position').array,
			uvs: geometries.frame.getAttribute('uv').array,
			bins: WORLD_COLUMNS,
		});
		return {
			logoPlacements: LOGO_CLOCK_HOURS.map((hour) => getClockU({ table, hour })),
			coverRange: [
				getClockU({ table, hour: COVER_CLOCK_HOURS[0] }),
				getClockU({ table, hour: COVER_CLOCK_HOURS[1] }),
			] as [number, number],
			frame: { worldAt: columnWorldAt({ table }), extent },
			throat: {
				worldAt: planarWorldAt({
					extent: {
						minX: throatBox.min.x,
						maxX: throatBox.max.x,
						minY: throatBox.min.y,
						maxY: throatBox.max.y,
					},
				}),
				extent,
			},
		};
	}, [geometries]);
	const throatSize = useMemo(() => {
		const box = new Box3().setFromObject(new Mesh(geometries.throat));
		return getShaftSurfaceSize({
			length: box.max.y - box.min.y,
			width: box.max.x - box.min.x,
			pixels: TUBE_SURFACE_WIDTH / metrics.loopLength,
		});
	}, [geometries, metrics]);
	const frameDrag = useSurfaceDrag({
		zoneId: 'frame',
		printZoneId: 'frame',
		size: frameSurface,
		bands: FRAME_BANDS,
		printAspect: aspectOf({ image: printImage }),
	});
	const throatDrag = useSurfaceDrag({
		zoneId: 'throat',
		printZoneId: 'frame',
		size: throatSize,
		bands: FRAME_BANDS,
		printAspect: aspectOf({ image: printImage }),
	});

	return (
		<group name="racket">
			<mesh name="zone_frame" geometry={geometries.frame} castShadow {...frameDrag}>
				<FrameSurfaceMaterial
					paint={zones.frame}
					overlays={overlays?.frame ?? NO_OVERLAYS}
					layers={frameLayers}
					printImage={printImage}
					stickerImages={stickerImages}
					size={frameSurface}
					world={worlds.frame}
					logo={logo}
					logoPlacements={worlds.logoPlacements}
					coverRange={worlds.coverRange}
				/>
			</mesh>
			<mesh name="zone_throat" geometry={geometries.throat} castShadow {...throatDrag}>
				<FrameSurfaceMaterial
					paint={zones.frame}
					overlays={overlays?.frame ?? NO_OVERLAYS}
					layers={throatLayers}
					printImage={printImage}
					stickerImages={stickerImages}
					world={worlds.throat}
					size={throatSize}
				/>
			</mesh>
			<mesh name="zone_handle" geometry={gripGeometry} castShadow>
				<GripMaterial grip={grip} />
			</mesh>
			<mesh name="zone_strings" geometry={geometries.strings} castShadow>
				<meshPhysicalMaterial color={STRING_COLOR} roughness={0.55} sheen={0.3} />
				{stringsLogoTexture === null ? null : (
					<Decal
						position={[
							stringsLogoPosition.x,
							stringsLogoPosition.y,
							stringsLogoPosition.z,
						]}
						rotation={[0, 0, 0]}
						scale={[STRINGS_LOGO_WIDTH, STRINGS_LOGO_HEIGHT, STRINGS_LOGO_DEPTH]}
						map={stringsLogoTexture}
						depthTest
					/>
				)}
			</mesh>
			{tapeGeometry === null || finishingTape === null ? null : (
				<mesh name="finishing_tape" geometry={tapeGeometry} castShadow>
					<TrimMaterial trim={finishingTape} />
				</mesh>
			)}
			<mesh name="grommets" geometry={geometries.grommets}>
				<TrimMaterial trim={grommets} />
			</mesh>
			<ButtCap
				buttCap={buttCap}
				handleRadius={BUTT_CAP_FACE_RADIUS}
				bottomY={capBottomY + BUTT_CAP_HEIGHT}
				bodyGeometry={geometries.buttCap}
			/>
		</group>
	);
}

useGLTF.preload(RACKET_MODEL_URL);
