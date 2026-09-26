import { create } from 'zustand';

import { createDefaultDesign } from '@builder/design/default-design';

import type { DesignCommand } from '@builder/design/design-commands';
import type { DesignDocument, ZoneId } from '@uniq/shared';

export const HISTORY_LIMIT = 100;
export const MERGE_WINDOW_MS = 800;

interface HistoryEntry {
	document: DesignDocument;
	label: string;
}

interface LastCommit {
	mergeKey: string;
	at: number;
}

export type BuilderStep = 'frame' | 'handle' | 'buttCap';
export type FrameOption = 'color' | 'print' | 'objects' | 'logo' | 'grommets';
export type HandleOption = 'grip' | 'overgrip' | 'tape';

export interface BuilderTool {
	step: BuilderStep;
	frameOption: FrameOption;
	handleOption: HandleOption;
}

export interface DesignState {
	document: DesignDocument;
	selectedZone: ZoneId;
	tool: BuilderTool;
	selectedLayerId: string | null;
	past: HistoryEntry[];
	future: HistoryEntry[];
	lastCommit: LastCommit | null;
	execute: (params: { command: DesignCommand; now?: number }) => void;
	undo: () => void;
	redo: () => void;
	selectZone: (params: { zoneId: ZoneId }) => void;
	selectTool: (params: { tool: Partial<BuilderTool> }) => void;
	selectLayer: (params: { layerId: string | null }) => void;
	loadDocument: (params: { document: DesignDocument }) => void;
	reset: () => void;
}

const createInitialState = (): Pick<
	DesignState,
	| 'document'
	| 'selectedZone'
	| 'tool'
	| 'selectedLayerId'
	| 'past'
	| 'future'
	| 'lastCommit'
> => ({
	document: createDefaultDesign(),
	selectedZone: 'frame',
	tool: {
		step: 'frame',
		frameOption: 'color',
		handleOption: 'grip',
	},
	selectedLayerId: null,
	past: [],
	future: [],
	lastCommit: null,
});

export const useDesignStore = create<DesignState>()((set, get) => ({
	...createInitialState(),

	execute: ({ command, now = Date.now() }): void => {
		const { document, past, lastCommit } = get();
		const nextDocument = command.apply({ document });

		if (nextDocument === document) {
			return;
		}

		const shouldMerge =
			command.mergeKey !== null &&
			lastCommit !== null &&
			lastCommit.mergeKey === command.mergeKey &&
			now - lastCommit.at <= MERGE_WINDOW_MS &&
			past.length > 0;

		set({
			document: nextDocument,
			past: shouldMerge
				? past
				: [...past, { document, label: command.label }].slice(-HISTORY_LIMIT),
			future: [],
			lastCommit:
				command.mergeKey === null ? null : { mergeKey: command.mergeKey, at: now },
		});
	},

	undo: (): void => {
		const { document, past, future } = get();
		const previous = past.at(-1);

		if (!previous) {
			return;
		}

		set({
			document: previous.document,
			past: past.slice(0, -1),
			future: [{ document, label: previous.label }, ...future],
			lastCommit: null,
		});
	},

	redo: (): void => {
		const { document, past, future } = get();
		const [next, ...rest] = future;

		if (!next) {
			return;
		}

		set({
			document: next.document,
			past: [...past, { document, label: next.label }],
			future: rest,
			lastCommit: null,
		});
	},

	selectZone: ({ zoneId }): void => {
		set({ selectedZone: zoneId });
	},

	selectTool: ({ tool }): void => {
		const next = { ...get().tool, ...tool };
		set({ tool: next });
	},

	selectLayer: ({ layerId }): void => {
		set({ selectedLayerId: layerId });
	},

	loadDocument: ({ document }): void => {
		set({ document, past: [], future: [], lastCommit: null });
	},

	reset: (): void => {
		set(createInitialState());
	},
}));
