import {
	setZoneFillCommand,
	toGradientFill,
	toSolidFill,
} from '@builder/design/design-commands';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';
import { FinishPicker } from '@builder/ui/FinishPicker';
import { GradientEditor } from '@builder/ui/GradientEditor';

import { ColorField } from '@components/ColorField/ColorField';
import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';

import type { ZoneFill, ZoneId } from '@uniq/shared';

type FillKind = ZoneFill['kind'];

const FILL_OPTIONS: readonly { value: FillKind; label: string }[] = [
	{ value: 'solid', label: 'Solid' },
	{ value: 'gradient', label: 'Gradient' },
];

export function PaintPanel({ zoneId }: { zoneId: ZoneId }): React.JSX.Element {
	const fill = useDesignStore((state) => state.document.zones[zoneId].fill);
	const execute = useDesignStore((state) => state.execute);

	return (
		<div className={styles.section}>
			<SegmentedControl
				legend="Fill"
				name={`fill-${zoneId}`}
				options={FILL_OPTIONS}
				value={fill.kind}
				onChange={({ value }) => {
					execute({
						command: setZoneFillCommand({
							zoneId,
							fill: value === 'solid' ? toSolidFill({ fill }) : toGradientFill({ fill }),
						}),
					});
				}}
			/>
			{fill.kind === 'solid' ? (
				<ColorField
					label="Color"
					value={fill.color}
					onChange={({ value }) => {
						execute({
							command: setZoneFillCommand({
								zoneId,
								fill: { kind: 'solid', color: value },
								mergeKey: `solid-color:${zoneId}`,
							}),
						});
					}}
				/>
			) : (
				<GradientEditor zoneId={zoneId} fill={fill} />
			)}
			<FinishPicker zoneId={zoneId} />
		</div>
	);
}
