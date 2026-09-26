/* eslint-disable no-param-reassign */
import {
	getLogoColor,
	HEAD_LOGO,
	LOGO_FIXED_COLORS,
	LOGO_BANDS,
	LOGO_HEIGHT_RATIO,
	LOGO_MARGIN_RATIO,
	LOGO_PLACEMENTS_U,
} from '@builder/decor/brand-logo';
import { getGradientEndpointsForRect } from '@builder/decor/gradient-endpoints';
import { getLinePatternPolylines, getLineSpacing } from '@builder/decor/line-patterns';
import { getShapeDefinition } from '@builder/decor/shape-paths';
import { colorAt, gradientT } from '@builder/decor/world-gradient';

import type { SurfaceBand } from '@builder/decor/frame-faces';
import type { WorldAt, WorldExtent } from '@builder/decor/world-gradient';
import type {
	DesignLayer,
	GradientFill,
	StickerId,
	LogoSpec,
	ZoneOverlays,
	ZonePaint,
} from '@uniq/shared';

export type SurfaceContext = Pick<
	CanvasRenderingContext2D,
	| 'save'
	| 'restore'
	| 'fillRect'
	| 'beginPath'
	| 'moveTo'
	| 'lineTo'
	| 'stroke'
	| 'translate'
	| 'rotate'
	| 'scale'
	| 'fill'
	| 'drawImage'
	| 'createLinearGradient'
	| 'rect'
	| 'clip'
> & {
	fillStyle: CanvasRenderingContext2D['fillStyle'];
	strokeStyle: CanvasRenderingContext2D['strokeStyle'];
	lineWidth: number;
	lineJoin: CanvasLineJoin;
	lineCap: CanvasLineCap;
};

export interface PrintImage {
	image: CanvasImageSource;
	width: number;
	height: number;
}

export type PathFactory = (params: { d: string }) => Path2D;

export type StickerImages = ReadonlyMap<StickerId, PrintImage>;

const NO_STICKERS: StickerImages = new Map();

const COVER_COLOR = '#0a0a0a';

const OFFSETS = [-1, 0, 1] as const;

const drawWrapped = ({
	x,
	y,
	width,
	height,
	draw,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	draw: (params: { x: number; y: number }) => void;
}): void => {
	for (const dx of OFFSETS) {
		for (const dy of OFFSETS) {
			draw({ x: x + dx * width, y: y + dy * height });
		}
	}
};

const withTransform = ({
	context,
	x,
	y,
	band,
	rotation,
	draw,
}: {
	context: SurfaceContext;
	x: number;
	y: number;
	band: SurfaceBand;
	rotation: number;
	draw: () => void;
}): void => {
	context.save();
	context.translate(x, y);
	context.scale(band.flipX ? -1 : 1, band.flipY ? -1 : 1);
	context.rotate((rotation * Math.PI) / 180);
	draw();
	context.restore();
};

export interface WorldGradient {
	worldAt: WorldAt;
	extent: WorldExtent;
}

const STRIP_WIDTH = 4;
const STRIP_SAMPLES = 9;

const paintWorldGradient = ({
	context,
	width,
	height,
	fill,
	world,
}: {
	context: SurfaceContext;
	width: number;
	height: number;
	fill: GradientFill;
	world: WorldGradient;
}): void => {
	for (let x = 0; x < width; x += STRIP_WIDTH) {
		const u = (x + STRIP_WIDTH / 2) / width;
		const gradient = context.createLinearGradient(0, 0, 0, height);
		for (let sample = 0; sample < STRIP_SAMPLES; sample += 1) {
			const offset = sample / (STRIP_SAMPLES - 1);
			const point = world.worldAt({ u, v: 1 - offset });
			const t = gradientT({ point, angle: fill.angle, extent: world.extent });
			gradient.addColorStop(offset, colorAt({ stops: fill.stops, t }));
		}
		context.fillStyle = gradient;
		context.fillRect(x, 0, STRIP_WIDTH, height);
	}
};

const paintBase = ({
	context,
	width,
	height,
	paint,
	world,
}: {
	context: SurfaceContext;
	width: number;
	height: number;
	paint: ZonePaint;
	world?: WorldGradient | null | undefined;
}): void => {
	if (paint.fill.kind === 'gradient' && world !== null && world !== undefined) {
		paintWorldGradient({ context, width, height, fill: paint.fill, world });
		return;
	}
	if (paint.fill.kind === 'solid') {
		context.fillStyle = paint.fill.color;
	} else {
		const gradient = context.createLinearGradient(
			...getGradientEndpointsForRect({ angle: paint.fill.angle, width, height }),
		);
		for (const stop of paint.fill.stops) {
			gradient.addColorStop(stop.offset, stop.color);
		}
		context.fillStyle = gradient;
	}
	context.fillRect(0, 0, width, height);
};

const paintLines = ({
	context,
	width,
	height,
	overlays,
}: {
	context: SurfaceContext;
	width: number;
	height: number;
	overlays: ZoneOverlays;
}): void => {
	const { lines } = overlays;
	if (lines === null) {
		return;
	}
	context.strokeStyle = lines.color;
	context.lineWidth =
		getLineSpacing({ height, density: lines.density }) * lines.thickness;
	context.lineJoin = 'miter';
	context.lineCap = 'butt';
	for (const polyline of getLinePatternPolylines({
		patternId: lines.patternId,
		width,
		height,
		density: lines.density,
	})) {
		context.beginPath();
		polyline.forEach(([x, y], index) => {
			if (index === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		});
		context.stroke();
	}
};

const paintPrint = ({
	context,
	width,
	height,
	overlays,
	printImage,
	bands,
}: {
	context: SurfaceContext;
	width: number;
	height: number;
	overlays: ZoneOverlays;
	printImage: PrintImage | null;
	bands: readonly SurfaceBand[];
}): void => {
	const { print } = overlays;
	if (print === null || printImage === null || printImage.height === 0) {
		return;
	}
	const bandHeight = height / 2;
	const drawWidth = (width / print.repeat) * print.scale;
	const drawHeight = (drawWidth * printImage.height) / printImage.width;
	if (drawWidth <= 0 || drawHeight <= 0) {
		return;
	}
	const rows = Math.max(1, Math.ceil(bandHeight / drawHeight));

	for (const band of bands) {
		for (let column = 0; column < print.repeat; column += 1) {
			const u = (print.offset + column / print.repeat) % 1;
			for (let row = 0; row < rows; row += 1) {
				const rowOffset = (row - (rows - 1) / 2) * drawHeight;
				drawWrapped({
					x: u * width,
					y: (1 - band.centerV) * height + (print.offsetY - 0.5) * bandHeight + rowOffset,
					width,
					height,
					draw: ({ x, y }) => {
						withTransform({
							context,
							x,
							y,
							band,
							rotation: 0,
							draw: () => {
								context.drawImage(
									printImage.image,
									-drawWidth / 2,
									-drawHeight / 2,
									drawWidth,
									drawHeight,
								);
							},
						});
					},
				});
			}
		}
	}
};

const paintLayers = ({
	context,
	width,
	height,
	layers,
	bands,
	createPath,
	stickerImages,
}: {
	context: SurfaceContext;
	width: number;
	height: number;
	layers: readonly DesignLayer[];
	bands: readonly SurfaceBand[];
	createPath: PathFactory;
	stickerImages: StickerImages;
}): void => {
	const bandHeight = height / 2;

	for (const layer of layers) {
		const size = bandHeight * layer.scale;
		const sticker = layer.kind === 'sticker' ? stickerImages.get(layer.stickerId) : null;
		if (layer.kind === 'sticker' && (sticker === undefined || sticker === null)) {
			continue;
		}
		const definition =
			layer.kind === 'shape' ? getShapeDefinition({ shape: layer.shape }) : null;
		const path = definition === null ? null : createPath({ d: definition.d });
		for (const band of bands) {
			drawWrapped({
				x: layer.position.u * width,
				y: (1 - band.centerV) * height + (layer.position.v - 0.5) * bandHeight,
				width,
				height,
				draw: ({ x, y }) => {
					withTransform({
						context,
						x,
						y,
						band,
						rotation: layer.rotation,
						draw: () => {
							if (layer.kind === 'shape' && definition !== null && path !== null) {
								context.scale(size / definition.box, size / definition.box);
								context.translate(-definition.box / 2, -definition.box / 2);
								context.fillStyle = layer.color;
								context.fill(path);
							} else if (
								sticker !== undefined &&
								sticker !== null &&
								sticker.height > 0
							) {
								const drawWidth = (size * sticker.width) / sticker.height;
								context.drawImage(
									sticker.image,
									-drawWidth / 2,
									-size / 2,
									drawWidth,
									size,
								);
							}
						},
					});
				},
			});
		}
	}
};

export const markTextureDirty = ({
	texture,
}: {
	texture: { needsUpdate: boolean };
}): void => {
	texture.needsUpdate = true;
};

const baseColor = ({ paint }: { paint: ZonePaint }): string =>
	paint.fill.kind === 'solid'
		? paint.fill.color
		: (paint.fill.stops[0]?.color ?? '#000000');

const paintLogo = ({
	context,
	width,
	height,
	paint,
	createPath,
	world,
	logo,
	placements,
}: {
	context: SurfaceContext;
	width: number;
	height: number;
	paint: ZonePaint;
	createPath: PathFactory;
	world: WorldGradient | null;
	logo: LogoSpec;
	placements: readonly number[];
}): void => {
	const bandHeight = height / 2;
	const logoHeight = bandHeight * LOGO_HEIGHT_RATIO * logo.size;
	const scale = logoHeight / HEAD_LOGO.height;
	const logoWidth = HEAD_LOGO.width * scale;
	const margin = bandHeight * LOGO_MARGIN_RATIO;
	const path = createPath({ d: HEAD_LOGO.d });
	const color =
		logo.color === 'auto'
			? getLogoColor({ background: baseColor({ paint }) })
			: LOGO_FIXED_COLORS[logo.color];

	for (const band of LOGO_BANDS) {
		for (const u of placements) {
			drawWrapped({
				x: u * width,
				y: (1 - band.centerV) * height,
				width,
				height,
				draw: ({ x, y }) => {
					context.save();
					context.beginPath();
					context.rect(
						x - logoWidth / 2 - margin,
						y - logoHeight / 2 - margin,
						logoWidth + margin * 2,
						logoHeight + margin * 2,
					);
					context.clip();
					paintBase({ context, width, height, paint, world });
					context.restore();
					withTransform({
						context,
						x,
						y,
						band,
						rotation: 0,
						draw: () => {
							context.scale(scale, scale);
							context.translate(-HEAD_LOGO.width / 2, -HEAD_LOGO.height / 2);
							context.fillStyle = color;
							context.fill(path);
						},
					});
				},
			});
		}
	}
};

const paintCover = ({
	context,
	width,
	height,
	range,
}: {
	context: SurfaceContext;
	width: number;
	height: number;
	range: readonly [number, number];
}): void => {
	const lo = Math.min(range[0], range[1]);
	const hi = Math.max(range[0], range[1]);
	const direct = hi - lo;
	const wrapped = 1 - direct;
	context.save();
	context.fillStyle = COVER_COLOR;
	if (direct <= wrapped) {
		context.fillRect(lo * width, 0, direct * width, height);
	} else {
		context.fillRect(hi * width, 0, (1 - hi) * width, height);
		context.fillRect(0, 0, lo * width, height);
	}
	context.restore();
};

export const paintSurface = ({
	context,
	width,
	height,
	paint,
	overlays,
	layers,
	printImage,
	bands,
	createPath,
	stickerImages = NO_STICKERS,
	logo = null,
	logoPlacements = LOGO_PLACEMENTS_U,
	coverRange = null,
	world = null,
}: {
	context: SurfaceContext;
	width: number;
	height: number;
	paint: ZonePaint;
	overlays: ZoneOverlays;
	layers: readonly DesignLayer[];
	printImage: PrintImage | null;
	bands: readonly SurfaceBand[];
	createPath: PathFactory;
	stickerImages?: StickerImages | undefined;
	logo?: LogoSpec | null | undefined;
	logoPlacements?: readonly number[] | undefined;
	coverRange?: readonly [number, number] | null | undefined;
	world?: WorldGradient | null | undefined;
}): void => {
	paintBase({ context, width, height, paint, world });
	paintLines({ context, width, height, overlays });
	paintPrint({ context, width, height, overlays, printImage, bands });
	paintLayers({ context, width, height, layers, bands, createPath, stickerImages });
	if (coverRange !== null) {
		paintCover({ context, width, height, range: coverRange });
	}
	if (logo !== null) {
		paintLogo({
			context,
			width,
			height,
			paint,
			createPath,
			world,
			logo,
			placements: logoPlacements,
		});
	}
};
