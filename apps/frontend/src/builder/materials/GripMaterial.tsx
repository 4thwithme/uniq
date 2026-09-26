import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

import { markTextureDirty } from '@builder/decor/surface-painter';
import {
	getGripLook,
	getGripMaterialParams,
	GRIP_SURFACE_SIZE,
	paintGripSurface,
} from '@builder/grips/grip-surface';

import type { GripContext } from '@builder/grips/grip-surface';
import type { GripSpec } from '@uniq/shared';

const WHITE = '#ffffff';

interface GripMaterialProps {
	grip: GripSpec;
	createCanvas?: (() => HTMLCanvasElement) | undefined;
}

export function GripMaterial({
	grip,
	createCanvas = (): HTMLCanvasElement => document.createElement('canvas'),
}: GripMaterialProps): React.JSX.Element {
	const invalidate = useThree((state) => state.invalidate);
	const look = useMemo(() => getGripLook({ grip }), [grip]);
	const params = getGripMaterialParams({ look });

	const surface = useMemo(() => {
		const canvas = createCanvas();
		canvas.width = GRIP_SURFACE_SIZE.width;
		canvas.height = GRIP_SURFACE_SIZE.height;
		const context = canvas.getContext('2d') as GripContext | null;
		if (context === null) {
			return null;
		}
		const texture = new CanvasTexture(canvas);
		texture.colorSpace = SRGBColorSpace;
		texture.wrapS = RepeatWrapping;
		texture.wrapT = RepeatWrapping;
		texture.anisotropy = 4;
		return { context, texture };
	}, [createCanvas]);

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
		paintGripSurface({
			context: surface.context,
			width: GRIP_SURFACE_SIZE.width,
			height: GRIP_SURFACE_SIZE.height,
			look,
		});
		markTextureDirty({ texture: surface.texture });
		invalidate();
	}, [surface, look, invalidate]);

	return (
		<meshPhysicalMaterial
			key={surface === null ? 'plain' : 'surface'}
			color={surface === null ? look.hex : WHITE}
			map={surface?.texture ?? null}
			bumpMap={surface?.texture ?? null}
			bumpScale={params.bumpScale}
			roughness={params.roughness}
			metalness={0}
			clearcoat={params.clearcoat}
			clearcoatRoughness={params.clearcoatRoughness}
			sheen={params.sheen}
		/>
	);
}
