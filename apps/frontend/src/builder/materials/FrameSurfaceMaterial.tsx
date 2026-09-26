import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

import { FRAME_BANDS, getFrameSurfaceSize } from '@builder/decor/frame-faces';
import { markTextureDirty, paintSurface } from '@builder/decor/surface-painter';
import { FINISH_PARAMS } from '@builder/materials/finish-params';

import type {
	PathFactory,
	PrintImage,
	StickerImages,
	SurfaceContext,
	WorldGradient,
} from '@builder/decor/surface-painter';
import type { DesignLayer, LogoSpec, ZoneOverlays, ZonePaint } from '@uniq/shared';

const WHITE = '#ffffff';

const createBrowserPath: PathFactory = ({ d }) => new Path2D(d);

interface FrameSurfaceMaterialProps {
	paint: ZonePaint;
	overlays: ZoneOverlays;
	layers: readonly DesignLayer[];
	printImage: PrintImage | null;
	size?: { width: number; height: number } | undefined;
	stickerImages?: StickerImages | undefined;
	logo?: LogoSpec | null | undefined;
	logoPlacements?: readonly number[] | undefined;
	coverRange?: readonly [number, number] | null | undefined;
	world?: WorldGradient | null | undefined;
	createCanvas?: (() => HTMLCanvasElement) | undefined;
	createPath?: PathFactory | undefined;
}

export function FrameSurfaceMaterial({
	paint,
	overlays,
	layers,
	printImage,
	size,
	stickerImages,
	logo = null,
	logoPlacements,
	coverRange = null,
	world = null,
	createCanvas = (): HTMLCanvasElement => document.createElement('canvas'),
	createPath = createBrowserPath,
}: FrameSurfaceMaterialProps): React.JSX.Element {
	const invalidate = useThree((state) => state.invalidate);
	const params = FINISH_PARAMS[paint.finish];

	const surface = useMemo(() => {
		const canvas = createCanvas();
		const { width, height } = size ?? getFrameSurfaceSize({});
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d') as SurfaceContext | null;
		if (context === null) {
			return null;
		}
		const texture = new CanvasTexture(canvas);
		texture.colorSpace = SRGBColorSpace;
		texture.wrapS = RepeatWrapping;
		texture.wrapT = RepeatWrapping;
		texture.anisotropy = 8;
		return { context, texture, width, height };
	}, [createCanvas, size]);

	useEffect(
		() => (): void => {
			surface?.texture.dispose();
		},
		[surface],
	);

	useEffect(() => {
		if (surface === null) {
			return;
		}
		try {
			paintSurface({
				context: surface.context,
				width: surface.width,
				height: surface.height,
				paint,
				overlays,
				layers,
				printImage,
				bands: FRAME_BANDS,
				createPath,
				stickerImages,
				logo,
				logoPlacements,
				coverRange,
				world,
			});
			markTextureDirty({ texture: surface.texture });
		} catch {
			paintSurface({
				context: surface.context,
				width: surface.width,
				height: surface.height,
				paint,
				overlays: { ...overlays, print: null },
				layers,
				printImage: null,
				bands: FRAME_BANDS,
				createPath,
				stickerImages,
				logo,
				logoPlacements,
				coverRange,
				world,
			});
			markTextureDirty({ texture: surface.texture });
		}
		invalidate();
	}, [
		surface,
		paint,
		overlays,
		layers,
		printImage,
		createPath,
		stickerImages,
		logo,
		logoPlacements,
		coverRange,
		world,
		invalidate,
	]);

	return (
		<meshPhysicalMaterial
			key={surface === null ? 'plain' : 'surface'}
			color={surface === null && paint.fill.kind === 'solid' ? paint.fill.color : WHITE}
			map={surface?.texture ?? null}
			roughness={params.roughness}
			metalness={params.metalness}
			clearcoat={params.clearcoat}
			clearcoatRoughness={params.clearcoatRoughness}
			iridescence={params.iridescence}
			sheen={params.sheen}
		/>
	);
}
