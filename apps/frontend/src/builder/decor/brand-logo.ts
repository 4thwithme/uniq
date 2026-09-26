import type { SurfaceBand } from '@builder/decor/frame-faces';

export const HEAD_LOGO = {
	width: 119,
	height: 16,
	d: 'M6.592,4.998 L20.512,4.998 L20.51,0.003 L27.104,0.003 L27.102,14.789 L20.512,14.789 L20.512,8.935 L6.592,8.935 L6.592,14.789 L0.01,14.789 L0,0.003 L6.592,0 L6.592,4.998Z M117.672,3.162c-1.125-2.29-3.506-3.154-5.736-3.154H89.607L89.6,14.252L79.238,0.008L67.912,0.016L57.551,14.245l0.006-2.828l-20.445,0.001V9.086h20.445V5.712L37.111,5.711v-2.33l20.441,0.001l0.002-3.375H30.521v14.781 l34.135,0.001l1.752-2.396h14.354l1.748,2.396l29.439,0.001c2.23,0,4.611-0.865,5.734-3.154C118.967,9.028,119.055,5.646,117.672,3.162z M68.824,9.043l3.848-5.273h1.811l3.84,5.272L68.824,9.043z M112.023,9.3c-0.361,0.686-1.102,0.875-1.742,0.873H96.225V4.655h14.045c0.643-0.001,1.385,0.187,1.746,0.874C112.609,6.707,112.619,8.167,112.023,9.3z',
} as const;

export const LOGO_CLOCK_HOURS: readonly number[] = [8];

export const COVER_CLOCK_HOURS: readonly [number, number] = [1, 3];

export const LOGO_PLACEMENTS_U: readonly number[] = [0.583];

export const LOGO_BANDS: readonly SurfaceBand[] = [
	{ centerV: 0.25, flipX: false, flipY: false },
];

export const LOGO_HEIGHT_RATIO = 0.34;

export const LOGO_MARGIN_RATIO = 0.06;

const LIGHT_LOGO = '#ffffff';
const DARK_LOGO = '#111111';

export const LOGO_FIXED_COLORS = { black: DARK_LOGO, white: LIGHT_LOGO } as const;

export const CAP_LOGO_WIDTH_RATIO = 0.5;

export const CAP_BADGE_OFFSET_RATIO = 0.34;

export const CAP_BADGE_SCALE = 0.55;

// The real HEAD icon mark (the arc-and-dot swoosh only, no wordmark),
// traced from the official logo. Kept separate from HEAD_LOGO (the frame's
// thin wordmark strip) so tuning one never shifts the other.
const HEAD_ICON_ARC_D =
	'm221.282 415.603c10.935-107.249 65.254-310.905 170.4-310.905 58.895 0 107.202 82.52 130.2 151.543l47.974-27.765c-24.98-92.48-93.04-222.47-178.36-222.47-118.17 0-208.38 217.79-228.942 447.007z';
const HEAD_ICON_DOT_D =
	'M390.51 147.114c-20.197 0-36.59 16.402-36.59 36.619 0 20.245 16.393 36.636 36.59 36.636 20.193 0 36.573-16.391 36.573-36.636 0-20.217-16.38-36.619-36.572-36.619';

export const HEAD_ICON_LOGO = {
	minX: 162.056,
	minY: 6.006,
	width: 409,
	height: 448,
	d: `${HEAD_ICON_ARC_D} ${HEAD_ICON_DOT_D}`,
} as const;

// The dot's own diameter, in the icon's native coordinate units.
export const HEAD_ICON_DOT_SIZE = 75;

interface LogoDrawContext {
	save: () => void;
	restore: () => void;
	translate: (x: number, y: number) => void;
	scale: (x: number, y: number) => void;
	fill: (path: Path2D) => void;
	fillStyle: CanvasRenderingContext2D['fillStyle'];
}

export const drawHeadIconLogo = ({
	context,
	createPath = ({ d }: { d: string }): Path2D => new Path2D(d),
	x,
	y,
	width,
	color,
	dotOffsetY = 0,
}: {
	context: LogoDrawContext;
	createPath?: (params: { d: string }) => Path2D;
	x: number;
	y: number;
	width: number;
	color: string;
	dotOffsetY?: number;
}): void => {
	const scale = width / HEAD_ICON_LOGO.width;
	context.save();
	// eslint-disable-next-line no-param-reassign
	context.fillStyle = color;
	context.translate(x - HEAD_ICON_LOGO.minX * scale, y - HEAD_ICON_LOGO.minY * scale);
	context.scale(scale, scale);
	context.fill(createPath({ d: HEAD_ICON_ARC_D }));
	context.save();
	context.translate(0, dotOffsetY);
	context.fill(createPath({ d: HEAD_ICON_DOT_D }));
	context.restore();
	context.restore();
};

const channel = ({ value }: { value: number }): number => {
	const unit = value / 255;
	return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
};

export const getLuminance = ({ hex }: { hex: string }): number => {
	const red = channel({ value: Number.parseInt(hex.slice(1, 3), 16) });
	const green = channel({ value: Number.parseInt(hex.slice(3, 5), 16) });
	const blue = channel({ value: Number.parseInt(hex.slice(5, 7), 16) });
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

export const getLogoColor = ({ background }: { background: string }): string =>
	getLuminance({ hex: background }) > 0.35 ? DARK_LOGO : LIGHT_LOGO;
