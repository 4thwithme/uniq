/* eslint-disable no-param-reassign */
import { findBadgeColor, findButtCapColor } from '@uniq/shared';

import {
	CAP_BADGE_OFFSET_RATIO,
	CAP_BADGE_SCALE,
	CAP_LOGO_WIDTH_RATIO,
	drawHeadIconLogo,
	getLogoColor,
	HEAD_ICON_LOGO,
} from '@builder/decor/brand-logo';
import { SHAPE_BOX, SHAPE_PATHS } from '@builder/decor/shape-paths';

import type { PathFactory } from '@builder/decor/surface-painter';
import type { ButtCapBadge, ButtCapSpec } from '@uniq/shared';

export type BadgeContext = Pick<
	CanvasRenderingContext2D,
	| 'save'
	| 'restore'
	| 'fillRect'
	| 'beginPath'
	| 'arc'
	| 'fill'
	| 'stroke'
	| 'translate'
	| 'scale'
	| 'fillText'
	| 'moveTo'
	| 'bezierCurveTo'
	| 'createRadialGradient'
> & {
	fillStyle: CanvasRenderingContext2D['fillStyle'];
	strokeStyle: CanvasRenderingContext2D['strokeStyle'];
	lineWidth: number;
	font: string;
	textAlign: CanvasTextAlign;
	textBaseline: CanvasTextBaseline;
	globalAlpha: number;
};

export const BADGE_FACE_SIZE = 256;

const FALLBACK = '#151515';

export const getBadgeText = ({ badge }: { badge: ButtCapBadge }): string | null => {
	if (badge.kind === 'text') {
		return badge.text;
	}
	if (badge.kind === 'preset' && badge.presetId === 'monogram') {
		return 'U';
	}
	return null;
};

export const paintButtCapFace = ({
	context,
	size = BADGE_FACE_SIZE,
	buttCap,
	createPath,
}: {
	context: BadgeContext;
	size?: number;
	buttCap: ButtCapSpec;
	createPath: PathFactory;
}): void => {
	const center = size / 2;
	const capHex = findButtCapColor({ colorId: buttCap.colorId })?.hex ?? FALLBACK;
	const { badge } = buttCap;

	context.save();
	context.globalAlpha = 1;
	context.fillStyle = capHex;
	context.fillRect(0, 0, size, size);

	context.globalAlpha = 0.25;
	context.strokeStyle = '#000000';
	context.lineWidth = size * 0.03;
	context.beginPath();
	context.arc(center, center, size * 0.42, 0, Math.PI * 2);
	context.stroke();

	const logoWidth = size * CAP_LOGO_WIDTH_RATIO;
	const logoHeight = (logoWidth * HEAD_ICON_LOGO.height) / HEAD_ICON_LOGO.width;
	context.globalAlpha = 1;
	drawHeadIconLogo({
		context,
		createPath,
		x: center - logoWidth / 2,
		y: center - logoHeight / 2,
		width: logoWidth,
		color: getLogoColor({ background: capHex }),
	});

	if (badge.kind !== 'none') {
		const badgeHex = findBadgeColor({ colorId: badge.colorId })?.hex ?? '#ffffff';
		const text = getBadgeText({ badge });
		const badgeY = center + size * CAP_BADGE_OFFSET_RATIO;
		context.globalAlpha = 1;
		context.fillStyle = badgeHex;
		context.save();
		context.translate(center, badgeY);
		if (text !== null) {
			const textRatio = text.length > 3 ? 0.2 : text.length > 2 ? 0.26 : 0.36;
			context.font = `800 ${String(Math.round(size * textRatio * CAP_BADGE_SCALE))}px Arial Black, Arial, sans-serif`;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(text, 0, size * 0.02 * CAP_BADGE_SCALE);
		} else if (badge.kind === 'preset' && badge.presetId === 'ball') {
			context.beginPath();
			context.arc(0, 0, size * 0.24 * CAP_BADGE_SCALE, 0, Math.PI * 2);
			context.fill();
			context.strokeStyle = capHex;
			context.lineWidth = size * 0.025 * CAP_BADGE_SCALE;
			for (const side of [-1, 1]) {
				context.beginPath();
				context.moveTo(
					side * size * 0.2 * CAP_BADGE_SCALE,
					-size * 0.13 * CAP_BADGE_SCALE,
				);
				context.bezierCurveTo(
					side * size * 0.07 * CAP_BADGE_SCALE,
					-size * 0.06 * CAP_BADGE_SCALE,
					side * size * 0.07 * CAP_BADGE_SCALE,
					size * 0.06 * CAP_BADGE_SCALE,
					side * size * 0.2 * CAP_BADGE_SCALE,
					size * 0.13 * CAP_BADGE_SCALE,
				);
				context.stroke();
			}
		} else if (badge.kind === 'preset') {
			const shapeSize = size * 0.5 * CAP_BADGE_SCALE;
			context.save();
			context.translate(-shapeSize / 2, -shapeSize / 2);
			context.scale(shapeSize / SHAPE_BOX, shapeSize / SHAPE_BOX);
			context.fill(
				createPath({ d: SHAPE_PATHS[badge.presetId === 'star' ? 'star' : 'bolt'] }),
			);
			context.restore();
		}
		context.restore();
	}

	if (buttCap.finish === 'gloss') {
		const highlight = context.createRadialGradient(
			center - size * 0.15,
			center - size * 0.15,
			0,
			center,
			center,
			size * 0.45,
		);
		highlight.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
		highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
		context.globalAlpha = 1;
		context.fillStyle = highlight;
		context.beginPath();
		context.arc(center, center, size * 0.45, 0, Math.PI * 2);
		context.fill();
	}
	context.restore();
};
