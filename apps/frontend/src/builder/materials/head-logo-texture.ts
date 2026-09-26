import { CanvasTexture, SRGBColorSpace } from 'three';

import {
	drawHeadIconLogo,
	HEAD_ICON_DOT_SIZE,
	HEAD_ICON_LOGO,
} from '@builder/decor/brand-logo';

export const HEAD_LOGO_TEXTURE_SCALE = 6;

export const createHeadLogoTexture = ({
	color = '#0a0a0a',
	createCanvas = (): HTMLCanvasElement => document.createElement('canvas'),
}: {
	color?: string;
	createCanvas?: () => HTMLCanvasElement;
} = {}): CanvasTexture | null => {
	const width = HEAD_ICON_LOGO.width * HEAD_LOGO_TEXTURE_SCALE;
	const canvas = createCanvas();
	canvas.width = width;
	canvas.height = HEAD_ICON_LOGO.height * HEAD_LOGO_TEXTURE_SCALE;
	const context = canvas.getContext('2d');
	if (context === null) {
		return null;
	}
	drawHeadIconLogo({ context, x: 0, y: 0, width, color, dotOffsetY: HEAD_ICON_DOT_SIZE });
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.needsUpdate = true;
	return texture;
};
