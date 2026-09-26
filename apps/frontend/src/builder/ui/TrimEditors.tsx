import { GRIP_FINISHES, TRIM_COLORS } from '@uniq/shared';

import {
	setFinishingTapeCommand,
	setGrommetsCommand,
} from '@builder/design/design-commands';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';

import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';
import { SwatchGrid } from '@components/SwatchGrid/SwatchGrid';

import type { SwatchOption } from '@components/SwatchGrid/SwatchGrid';
import type { TrimSpec } from '@uniq/shared';

const NONE = 'none';

const FINISH_LABELS = { matte: 'Matte', gloss: 'Gloss' } as const;

const COLOR_OPTIONS: SwatchOption<string>[] = TRIM_COLORS.map((color) => ({
	value: color.id,
	label: color.name,
	preview: <span className={styles.colorChip} style={{ background: color.hex }} />,
}));

function TrimFinish({
	name,
	trim,
	onChange,
}: {
	name: string;
	trim: TrimSpec;
	onChange: (params: { trim: TrimSpec }) => void;
}): React.JSX.Element {
	return (
		<SegmentedControl
			legend="Finish"
			name={name}
			options={GRIP_FINISHES.map((finish) => ({
				value: finish,
				label: FINISH_LABELS[finish],
			}))}
			value={trim.finish}
			onChange={({ value }) => {
				onChange({ trim: { ...trim, finish: value } });
			}}
		/>
	);
}

export function GrommetsEditor(): React.JSX.Element {
	const grommets = useDesignStore((state) => state.document.grommets);
	const execute = useDesignStore((state) => state.execute);
	const setGrommets = ({ trim }: { trim: TrimSpec }): void => {
		execute({ command: setGrommetsCommand({ grommets: trim }) });
	};

	return (
		<div className={styles.section}>
			<p className={styles.hint}>
				The small plastic eyelets in the frame holes. They guide the strings and protect
				them from the frame edge.
			</p>
			<SwatchGrid
				legend="Color"
				name="grommets-color"
				columns={4}
				options={COLOR_OPTIONS}
				value={grommets.colorId}
				onChange={({ value }) => {
					setGrommets({ trim: { ...grommets, colorId: value } });
				}}
			/>
			<TrimFinish name="grommets-finish" trim={grommets} onChange={setGrommets} />
		</div>
	);
}

export function FinishingTapeEditor(): React.JSX.Element {
	const tape = useDesignStore((state) => state.document.finishingTape);
	const execute = useDesignStore((state) => state.execute);
	const setTape = ({ trim }: { trim: TrimSpec | null }): void => {
		execute({ command: setFinishingTapeCommand({ finishingTape: trim }) });
	};

	return (
		<div className={styles.section}>
			<p className={styles.hint}>
				A short band of tape wound around the top of the grip. It holds the grip end in
				place so it does not unwind.
			</p>
			<SwatchGrid
				legend="Tape"
				name="tape-color"
				columns={4}
				options={[{ value: NONE, label: 'None', preview: null }, ...COLOR_OPTIONS]}
				value={tape?.colorId ?? NONE}
				onChange={({ value }) => {
					setTape({
						trim:
							value === NONE ? null : { finish: tape?.finish ?? 'matte', colorId: value },
					});
				}}
			/>
			{tape === null ? null : (
				<TrimFinish name="tape-finish" trim={tape} onChange={setTape} />
			)}
		</div>
	);
}
