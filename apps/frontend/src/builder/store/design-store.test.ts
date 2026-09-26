import { createDefaultDesign } from '@builder/design/default-design';
import {
	setZoneFillCommand,
	setZoneFinishCommand,
} from '@builder/design/design-commands';
import {
	HISTORY_LIMIT,
	MERGE_WINDOW_MS,
	useDesignStore,
} from '@builder/store/design-store';

import type { DesignCommand } from '@builder/design/design-commands';

const paint = ({
	color,
	mergeKey,
}: {
	color: string;
	mergeKey?: string;
}): DesignCommand =>
	setZoneFillCommand({
		zoneId: 'frame',
		fill: { kind: 'solid', color },
		...(mergeKey === undefined ? {} : { mergeKey }),
	});

const frameColor = (): string => {
	const { fill } = useDesignStore.getState().document.zones.frame;
	return fill.kind === 'solid' ? fill.color : 'gradient';
};

describe('useDesignStore', () => {
	it('executes commands and supports undo / redo', () => {
		const { execute, undo, redo } = useDesignStore.getState();

		execute({ command: paint({ color: '#111111' }) });
		execute({ command: paint({ color: '#222222' }) });

		expect(frameColor()).toBe('#222222');
		expect(useDesignStore.getState().past).toHaveLength(2);

		undo();
		expect(frameColor()).toBe('#111111');
		undo();
		expect(frameColor()).toBe('#c6ff3d');
		undo();
		expect(frameColor()).toBe('#c6ff3d');

		redo();
		redo();
		expect(frameColor()).toBe('#222222');
		redo();
		expect(frameColor()).toBe('#222222');
		expect(useDesignStore.getState().future).toHaveLength(0);
	});

	it('clears the redo stack on a new command', () => {
		const { execute, undo } = useDesignStore.getState();

		execute({ command: paint({ color: '#111111' }) });
		undo();
		execute({ command: paint({ color: '#333333' }) });

		expect(useDesignStore.getState().future).toHaveLength(0);
	});

	it('merges commands with the same merge key inside the window', () => {
		const { execute, undo } = useDesignStore.getState();

		execute({ command: paint({ color: '#111111', mergeKey: 'scrub' }), now: 1000 });
		execute({
			command: paint({ color: '#222222', mergeKey: 'scrub' }),
			now: 1000 + MERGE_WINDOW_MS,
		});
		execute({
			command: paint({ color: '#333333', mergeKey: 'scrub' }),
			now: 1000 + MERGE_WINDOW_MS * 3,
		});
		execute({
			command: paint({ color: '#444444', mergeKey: 'other' }),
			now: 1000 + MERGE_WINDOW_MS * 3,
		});

		expect(useDesignStore.getState().past).toHaveLength(3);

		undo();
		undo();
		expect(frameColor()).toBe('#222222');
	});

	it('does not merge after an undo', () => {
		const { execute, undo } = useDesignStore.getState();

		execute({ command: paint({ color: '#111111', mergeKey: 'scrub' }), now: 0 });
		execute({ command: paint({ color: '#222222', mergeKey: 'scrub' }), now: 10 });
		undo();
		execute({ command: paint({ color: '#333333', mergeKey: 'scrub' }), now: 20 });

		expect(useDesignStore.getState().past).toHaveLength(1);
	});

	it('ignores commands that do not change the document', () => {
		const command: DesignCommand = {
			label: 'noop',
			mergeKey: null,
			apply: ({ document }) => document,
		};

		useDesignStore.getState().execute({ command });

		expect(useDesignStore.getState().past).toHaveLength(0);
	});

	it('caps the history', () => {
		const { execute } = useDesignStore.getState();

		for (let index = 0; index < HISTORY_LIMIT + 5; index += 1) {
			execute({
				command: setZoneFinishCommand({
					zoneId: 'frame',
					finish: index % 2 === 0 ? 'matte' : 'gloss',
				}),
			});
		}

		expect(useDesignStore.getState().past).toHaveLength(HISTORY_LIMIT);
	});

	it('uses Date.now when no time is passed', () => {
		vi.spyOn(Date, 'now').mockReturnValue(5000);

		useDesignStore
			.getState()
			.execute({ command: paint({ color: '#111111', mergeKey: 'scrub' }) });

		expect(useDesignStore.getState().lastCommit).toEqual({ mergeKey: 'scrub', at: 5000 });
	});

	it('selects a zone, loads a document and resets', () => {
		const { selectZone, loadDocument, execute, reset } = useDesignStore.getState();
		const document = {
			...createDefaultDesign(),
			meta: { name: 'Loaded', themeId: null },
		};

		selectZone({ zoneId: 'throat' });
		execute({ command: paint({ color: '#111111' }) });
		loadDocument({ document });

		expect(useDesignStore.getState()).toMatchObject({
			selectedZone: 'throat',
			document,
			past: [],
			future: [],
		});

		reset();
		expect(useDesignStore.getState().selectedZone).toBe('frame');
		expect(useDesignStore.getState().document.meta.name).toBe('Untitled design');
	});
});
