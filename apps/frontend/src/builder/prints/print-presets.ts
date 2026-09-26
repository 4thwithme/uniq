export interface PrintPreset {
	id: string;
	name: string;
	width: number;
	height: number;
	svg?: string;
	imageUrl?: string;
}

const image = ({
	file,
	width,
	height,
}: {
	file: string;
	width: number;
	height: number;
}): Pick<PrintPreset, 'imageUrl' | 'width' | 'height'> => ({
	imageUrl: `${import.meta.env.BASE_URL}prints/${file}`,
	width,
	height,
});

export const PRINT_PRESETS: readonly PrintPreset[] = [
	{
		id: 'feather-splash',
		name: 'Feather splash',
		...image({ file: 'feather-splash.webp', width: 1000, height: 1000 }),
	},
	{
		id: 'minimalist-leaf',
		name: 'Minimalist leaf',
		...image({ file: 'minimalist-leaf.webp', width: 900, height: 1400 }),
	},
	{
		id: 'low-poly',
		name: 'Low poly',
		...image({ file: 'low-poly.webp', width: 1400, height: 980 }),
	},
	{
		id: 'flowing-waves',
		name: 'Flowing waves',
		...image({ file: 'flowing-waves.webp', width: 1400, height: 764 }),
	},
	{
		id: 'blue-silk',
		name: 'Blue silk',
		...image({ file: 'blue-silk.webp', width: 900, height: 1060 }),
	},
	{
		id: 'blue-swirl',
		name: 'Blue swirl',
		...image({ file: 'blue-swirl.webp', width: 1000, height: 1387 }),
	},
	{
		id: 'ribbon-lines',
		name: 'Ribbon lines',
		...image({ file: 'ribbon-lines.webp', width: 849, height: 1400 }),
	},
	{
		id: 'geo-triangles',
		name: 'Geo triangles',
		...image({ file: 'geo-triangles.webp', width: 1000, height: 1000 }),
	},
	{
		id: 'triangle-mesh',
		name: 'Triangle mesh',
		...image({ file: 'triangle-mesh.webp', width: 850, height: 685 }),
	},
	{
		id: 'gold-sparkle',
		name: 'Gold sparkle',
		...image({ file: 'gold-sparkle.webp', width: 850, height: 850 }),
	},
	{
		id: 'ice-peaks',
		name: 'Ice peaks',
		...image({ file: 'ice-peaks.webp', width: 1400, height: 933 }),
	},
	{
		id: 'orange-swirl',
		name: 'Orange swirl',
		...image({ file: 'orange-swirl.webp', width: 899, height: 1096 }),
	},
	{
		id: 'doodle-mosaic',
		name: 'Doodle mosaic',
		...image({ file: 'doodle-mosaic.webp', width: 800, height: 800 }),
	},
	{
		id: 'butterfly-garden',
		name: 'Butterfly garden',
		...image({ file: 'butterfly-garden.webp', width: 799, height: 933 }),
	},
	{
		id: 'gold-swirl-lines',
		name: 'Gold swirl lines',
		...image({ file: 'gold-swirl-lines.webp', width: 1200, height: 832 }),
	},
	{
		id: 'hex-tech',
		name: 'Hex tech',
		...image({ file: 'hex-tech.webp', width: 1000, height: 1114 }),
	},
	{
		id: 'sunset-low-poly',
		name: 'Sunset low poly',
		...image({ file: 'sunset-low-poly.webp', width: 1000, height: 866 }),
	},
	{
		id: 'navy-triangles',
		name: 'Navy triangles',
		...image({ file: 'navy-triangles.webp', width: 1398, height: 622 }),
	},
	{
		id: 'flower-doodle',
		name: 'Flower doodle',
		...image({ file: 'flower-doodle.webp', width: 1400, height: 530 }),
	},
];

export const findPrintPreset = ({ presetId }: { presetId: string }): PrintPreset | null =>
	PRINT_PRESETS.find((preset) => preset.id === presetId) ?? null;

export const toSvgDataUrl = ({ markup }: { markup: string }): string =>
	`data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
