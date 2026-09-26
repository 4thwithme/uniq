import { findTrimColor } from '@uniq/shared';

import type { TrimSpec } from '@uniq/shared';

const FALLBACK_HEX = '#141414';

export function TrimMaterial({ trim }: { trim: TrimSpec }): React.JSX.Element {
	const isGloss = trim.finish === 'gloss';

	return (
		<meshPhysicalMaterial
			color={findTrimColor({ colorId: trim.colorId })?.hex ?? FALLBACK_HEX}
			roughness={isGloss ? 0.3 : 0.8}
			clearcoat={isGloss ? 0.5 : 0}
			clearcoatRoughness={0.3}
		/>
	);
}
