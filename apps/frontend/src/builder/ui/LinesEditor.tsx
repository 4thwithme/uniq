import { LINE_DENSITY_RANGE, LINE_PATTERN_IDS, LINE_THICKNESS_RANGE } from '@uniq/shared';

import {
	DEFAULT_LINES,
	getLinePatternPolylines,
	LINE_PATTERN_LABELS,
	toSvgPoints,
} from '@builder/decor/line-patterns';
import { setZoneLinesCommand } from '@builder/design/decor-commands';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';

import { ColorField } from '@components/ColorField/ColorField';
import { Slider } from '@components/Slider/Slider';
import { SwatchGrid } from '@components/SwatchGrid/SwatchGrid';

import type { SwatchOption } from '@components/SwatchGrid/SwatchGrid';
import type { LinePatternId, ZoneId } from '@uniq/shared';

type LineChoice = LinePatternId | 'none';

const PREVIEW = { width: 80, height: 60 } as const;
const PERCENT = 100;

function LinePreview({ patternId }: { patternId: LinePatternId }): React.JSX.Element {
	return (
		<svg viewBox={`0 0 ${String(PREVIEW.width)} ${String(PREVIEW.height)}`}>
			{getLinePatternPolylines({ patternId, ...PREVIEW, density: 16 }).map((polyline) => (
				<polyline
					key={toSvgPoints({ polyline })}
					points={toSvgPoints({ polyline })}
					fill="none"
					stroke="currentColor"
					strokeWidth={2.5}
				/>
			))}
		</svg>
	);
}

const LINE_OPTIONS: readonly SwatchOption<LineChoice>[] = [
	{ value: 'none', label: 'None', preview: null },
	...LINE_PATTERN_IDS.map((patternId) => ({
		value: patternId,
		label: LINE_PATTERN_LABELS[patternId],
		preview: <LinePreview patternId={patternId} />,
	})),
];

export function LinesEditor({
	zoneId = 'frame',
}: {
	zoneId?: ZoneId;
}): React.JSX.Element {
	const lines = useDesignStore((state) => state.document.overlays[zoneId].lines);
	const execute = useDesignStore((state) => state.execute);

	return (
		<div className={styles.section}>
			<SwatchGrid
				legend="Pattern"
				name={`${zoneId}-lines`}
				options={LINE_OPTIONS}
				value={lines?.patternId ?? 'none'}
				onChange={({ value }) => {
					execute({
						command: setZoneLinesCommand({
							zoneId,
							lines:
								value === 'none'
									? null
									: { ...DEFAULT_LINES, ...lines, patternId: value },
						}),
					});
				}}
			/>
			{lines === null ? null : (
				<>
					<ColorField
						label="Line color"
						value={lines.color}
						onChange={({ value }) => {
							execute({
								command: setZoneLinesCommand({
									zoneId,
									lines: { ...lines, color: value },
									mergeKey: 'lines-color',
								}),
							});
						}}
					/>
					<Slider
						label="Density"
						value={lines.density}
						min={LINE_DENSITY_RANGE.min}
						max={LINE_DENSITY_RANGE.max}
						onChange={({ value }) => {
							execute({
								command: setZoneLinesCommand({
									zoneId,
									lines: { ...lines, density: value },
									mergeKey: 'lines-density',
								}),
							});
						}}
					/>
					<Slider
						label="Thickness"
						value={Math.round(lines.thickness * PERCENT)}
						min={LINE_THICKNESS_RANGE.min * PERCENT}
						max={LINE_THICKNESS_RANGE.max * PERCENT}
						unit="%"
						onChange={({ value }) => {
							execute({
								command: setZoneLinesCommand({
									zoneId,
									lines: { ...lines, thickness: value / PERCENT },
									mergeKey: 'lines-thickness',
								}),
							});
						}}
					/>
				</>
			)}
		</div>
	);
}
