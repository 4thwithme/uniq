import { useEffect, useMemo } from 'react';

import { FINISH_PARAMS } from '@builder/materials/finish-params';
import { createGradientTexture } from '@builder/materials/gradient-texture';
import { ZONE_TEXTURE_ROTATION } from '@builder/materials/zone-texture-rotation';

import type { ZoneId, ZonePaint } from '@uniq/shared';

const WHITE = '#ffffff';

interface ZoneMaterialProps {
	zoneId: ZoneId;
	paint: ZonePaint;
}

export function ZoneMaterial({ zoneId, paint }: ZoneMaterialProps): React.JSX.Element {
	const { fill, finish } = paint;
	const params = FINISH_PARAMS[finish];

	const texture = useMemo(() => {
		if (fill.kind !== 'gradient') {
			return null;
		}

		const gradientTexture = createGradientTexture({ fill });

		if (gradientTexture) {
			gradientTexture.center.set(0.5, 0.5);
			gradientTexture.rotation = ZONE_TEXTURE_ROTATION[zoneId];
		}

		return gradientTexture;
	}, [fill, zoneId]);

	useEffect(
		() => (): void => {
			texture?.dispose();
		},
		[texture],
	);

	return (
		<meshPhysicalMaterial
			key={texture === null ? 'solid' : 'gradient'}
			color={fill.kind === 'solid' ? fill.color : WHITE}
			map={texture}
			roughness={params.roughness}
			metalness={params.metalness}
			clearcoat={params.clearcoat}
			clearcoatRoughness={params.clearcoatRoughness}
			iridescence={params.iridescence}
			sheen={params.sheen}
		/>
	);
}
