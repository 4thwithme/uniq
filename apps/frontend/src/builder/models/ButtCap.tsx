import { useThree } from '@react-three/fiber';
import { findButtCapColor } from '@uniq/shared';
import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

import { BADGE_FACE_SIZE, paintButtCapFace } from '@builder/buttcap/badge-painter';
import { markTextureDirty } from '@builder/decor/surface-painter';

import type { BadgeContext } from '@builder/buttcap/badge-painter';
import type { PathFactory } from '@builder/decor/surface-painter';
import type { ButtCapSpec } from '@uniq/shared';
import type { BufferGeometry } from 'three';

export const BUTT_CAP_HEIGHT = 0.003;
const RADIUS_SCALE = 1;
const CHAMFER = 0.97;

const createBrowserPath: PathFactory = ({ d }) => new Path2D(d);

interface ButtCapProps {
	buttCap: ButtCapSpec;
	handleRadius: number;
	bottomY: number;
	bodyGeometry?: BufferGeometry | undefined;
	createCanvas?: (() => HTMLCanvasElement) | undefined;
	createPath?: PathFactory | undefined;
}

export function ButtCap({
	buttCap,
	handleRadius,
	bottomY,
	bodyGeometry,
	createCanvas = (): HTMLCanvasElement => document.createElement('canvas'),
	createPath = createBrowserPath,
}: ButtCapProps): React.JSX.Element {
	const invalidate = useThree((state) => state.invalidate);
	const radius = handleRadius * RADIUS_SCALE;
	const capHex = findButtCapColor({ colorId: buttCap.colorId })?.hex ?? '#151515';
	const isGloss = buttCap.finish === 'gloss';
	const groupY = bottomY - BUTT_CAP_HEIGHT / 2;

	const face = useMemo(() => {
		const canvas = createCanvas();
		canvas.width = BADGE_FACE_SIZE;
		canvas.height = BADGE_FACE_SIZE;
		const context = canvas.getContext('2d') as BadgeContext | null;
		if (context === null) {
			return null;
		}
		const texture = new CanvasTexture(canvas);
		texture.colorSpace = SRGBColorSpace;
		return { context, texture };
	}, [createCanvas]);

	useEffect(
		() => (): void => {
			face?.texture.dispose();
		},
		[face],
	);

	useEffect(() => {
		if (face === null) {
			return;
		}
		paintButtCapFace({ context: face.context, buttCap, createPath });
		markTextureDirty({ texture: face.texture });
		invalidate();
	}, [face, buttCap, createPath, invalidate]);

	return (
		<group name="butt_cap" position={[0, groupY, 0]}>
			<mesh
				name="butt_cap_body"
				castShadow
				{...(bodyGeometry ? { geometry: bodyGeometry, position: [0, -groupY, 0] } : {})}
			>
				{bodyGeometry ? null : (
					<cylinderGeometry args={[radius, radius * CHAMFER, BUTT_CAP_HEIGHT, 8]} />
				)}
				<meshPhysicalMaterial
					color={capHex}
					roughness={isGloss ? 0.25 : 0.7}
					clearcoat={isGloss ? 0.8 : 0}
					clearcoatRoughness={0.2}
				/>
			</mesh>
			<mesh
				name="butt_cap_face"
				position={[0, -BUTT_CAP_HEIGHT / 2 - 0.0002, 0]}
				rotation={[Math.PI / 2, 0, 0]}
			>
				<circleGeometry args={[radius * CHAMFER, 8]} />
				<meshPhysicalMaterial
					key={face === null ? 'plain' : 'badge'}
					color={face === null ? capHex : '#ffffff'}
					map={face?.texture ?? null}
					roughness={isGloss ? 0.2 : 0.65}
					clearcoat={isGloss ? 1 : 0}
					clearcoatRoughness={0.1}
				/>
			</mesh>
		</group>
	);
}
