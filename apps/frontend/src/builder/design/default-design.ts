import {
	DEFAULT_BUTT_CAP,
	DEFAULT_FINISHING_TAPE,
	DEFAULT_GRIP,
	DEFAULT_GROMMETS,
	DEFAULT_LOGO,
	DESIGN_SCHEMA_VERSION,
} from '@uniq/shared';

import type { DesignDocument } from '@uniq/shared';

export const DEFAULT_RACKET_MODEL_ID = 'classic-100';

export const createDefaultDesign = (): DesignDocument => ({
	schemaVersion: DESIGN_SCHEMA_VERSION,
	racketModelId: DEFAULT_RACKET_MODEL_ID,
	zones: {
		frame: { finish: 'gloss', fill: { kind: 'solid', color: '#030303' } },
		throat: { finish: 'gloss', fill: { kind: 'solid', color: '#030303' } },
	},
	grip: structuredClone(DEFAULT_GRIP),
	buttCap: structuredClone(DEFAULT_BUTT_CAP),
	grommets: { ...DEFAULT_GROMMETS },
	finishingTape: { ...DEFAULT_FINISHING_TAPE },
	logo: { ...DEFAULT_LOGO },
	overlays: {
		frame: {
			lines: null,
			print: {
				source: { kind: 'preset', presetId: 'low-poly' },
				scale: 1,
				repeat: 1,
				offset: 0.57,
				offsetY: 1,
			},
		},
		throat: { lines: null, print: null },
	},
	layers: [],
	meta: { name: 'Untitled design', themeId: null },
});
