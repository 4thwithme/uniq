/* eslint-disable no-param-reassign */
import { findOvergripColor, getGripHex } from '@uniq/shared';

import type {
	GripFinish,
	GripMaterial,
	GripSpec,
	GripTexture,
	OvergripMaterial,
	OvergripTexture,
} from '@uniq/shared';

export type GripContext = Pick<
	CanvasRenderingContext2D,
	| 'save'
	| 'restore'
	| 'fillRect'
	| 'beginPath'
	| 'moveTo'
	| 'lineTo'
	| 'stroke'
	| 'arc'
	| 'fill'
> & {
	fillStyle: CanvasRenderingContext2D['fillStyle'];
	strokeStyle: CanvasRenderingContext2D['strokeStyle'];
	lineWidth: number;
	globalAlpha: number;
};

export const GRIP_SURFACE_SIZE = { width: 256, height: 512 } as const;

export type GripLookMaterial = GripMaterial | `overgrip-${OvergripMaterial}`;

export interface GripLook {
	hex: string;
	material: GripLookMaterial;
	texture: GripTexture | OvergripTexture;
	finish: GripFinish;
	turns: number;
}

const BASE_TURNS = 8;
const OVERGRIP_TURNS = 10;
const FALLBACK_HEX = '#161616';

export const getGripLook = ({ grip }: { grip: GripSpec }): GripLook => {
	if (grip.overgrip !== null) {
		return {
			hex: findOvergripColor({ colorId: grip.overgrip.colorId })?.hex ?? FALLBACK_HEX,
			material: `overgrip-${grip.overgrip.material}`,
			texture: grip.overgrip.texture,
			finish: grip.overgrip.material === 'tacky' ? 'gloss' : 'matte',
			turns: OVERGRIP_TURNS,
		};
	}
	return {
		hex: getGripHex({ grip }) ?? FALLBACK_HEX,
		material: grip.material,
		texture: grip.texture,
		finish: grip.finish,
		turns: BASE_TURNS,
	};
};

export interface GripMaterialParams {
	roughness: number;
	clearcoat: number;
	clearcoatRoughness: number;
	sheen: number;
	bumpScale: number;
}

export const getGripMaterialParams = ({
	look,
}: {
	look: GripLook;
}): GripMaterialParams => {
	if (look.material === 'leather') {
		return {
			roughness: 0.62,
			clearcoat: 0,
			clearcoatRoughness: 1,
			sheen: 0.4,
			bumpScale: 1.2,
		};
	}
	if (look.material === 'overgrip-dry') {
		return {
			roughness: 0.97,
			clearcoat: 0,
			clearcoatRoughness: 1,
			sheen: 0.7,
			bumpScale: 1,
		};
	}
	if (look.finish === 'gloss') {
		return {
			roughness: 0.38,
			clearcoat: 0.25,
			clearcoatRoughness: 0.5,
			sheen: 0,
			bumpScale: 0.8,
		};
	}
	return {
		roughness: 0.85,
		clearcoat: 0,
		clearcoatRoughness: 1,
		sheen: 0.15,
		bumpScale: 0.8,
	};
};

export const createSeededRandom = ({ seed }: { seed: number }): (() => number) => {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let value = state;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
};

const strokeWrapLines = ({
	context,
	width,
	height,
	pitch,
	offset,
}: {
	context: GripContext;
	width: number;
	height: number;
	pitch: number;
	offset: number;
}): void => {
	for (let y = -pitch + offset; y <= height + pitch; y += pitch) {
		context.beginPath();
		context.moveTo(0, y);
		context.lineTo(width, y + pitch);
		context.stroke();
	}
};

export const paintGripSurface = ({
	context,
	width,
	height,
	look,
	random = createSeededRandom({ seed: 7 }),
}: {
	context: GripContext;
	width: number;
	height: number;
	look: GripLook;
	random?: () => number;
}): void => {
	const pitch = height / look.turns;

	context.save();
	context.globalAlpha = 1;
	context.fillStyle = look.hex;
	context.fillRect(0, 0, width, height);

	if (look.material === 'leather') {
		for (let index = 0; index < 1400; index += 1) {
			context.globalAlpha = 0.05 + random() * 0.08;
			context.fillStyle = random() > 0.5 ? '#000000' : '#ffffff';
			context.fillRect(
				random() * width,
				random() * height,
				1 + random() * 2,
				1 + random() * 2,
			);
		}
	}

	if (look.material === 'overgrip-dry') {
		for (let index = 0; index < 2600; index += 1) {
			context.globalAlpha = 0.04 + random() * 0.06;
			context.fillStyle = random() > 0.5 ? '#000000' : '#ffffff';
			context.fillRect(random() * width, random() * height, 1 + random() * 3, 1);
		}
	}

	if (look.texture === 'ribbed') {
		context.globalAlpha = 0.5;
		context.strokeStyle = '#ffffff';
		context.lineWidth = pitch / 5;
		strokeWrapLines({ context, width, height, pitch, offset: pitch / 2 });
		context.globalAlpha = 0.3;
		context.strokeStyle = '#000000';
		context.lineWidth = 2;
		strokeWrapLines({ context, width, height, pitch, offset: pitch / 2 + pitch / 10 });
	}

	if (look.texture === 'grooved') {
		context.globalAlpha = 0.22;
		context.strokeStyle = '#000000';
		context.lineWidth = 1.5;
		for (let groove = 1; groove < 4; groove += 1) {
			strokeWrapLines({ context, width, height, pitch, offset: (pitch * groove) / 4 });
		}
	}

	if (look.texture === 'perforated') {
		context.globalAlpha = 0.45;
		context.fillStyle = '#000000';
		const step = pitch / 3;
		for (let row = -pitch; row <= height + pitch; row += pitch) {
			for (let x = step / 2; x < width; x += step) {
				for (const lane of [1, 2]) {
					const y = row + (x / width) * pitch + (pitch * lane) / 3;
					context.beginPath();
					context.arc(x, y, 1.6, 0, Math.PI * 2);
					context.fill();
				}
			}
		}
	}

	context.globalAlpha = 0.45;
	context.strokeStyle = '#000000';
	context.lineWidth = 3;
	strokeWrapLines({ context, width, height, pitch, offset: 0 });

	context.globalAlpha = 0.16;
	context.strokeStyle = '#ffffff';
	context.lineWidth = 1.5;
	strokeWrapLines({ context, width, height, pitch, offset: 3 });

	context.restore();
};
