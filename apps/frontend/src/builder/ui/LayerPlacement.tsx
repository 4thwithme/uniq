import { SHAPE_SCALE_RANGE } from '@uniq/shared';

import { updateLayerCommand } from '@builder/design/decor-commands';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';

import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';
import { Slider } from '@components/Slider/Slider';

import type { ShapeLayerPatch } from '@builder/design/decor-commands';
import type { DesignLayer, ZoneId } from '@uniq/shared';

const PERCENT = 100;

const SECTION_OPTIONS: readonly { value: ZoneId; label: string }[] = [
	{ value: 'frame', label: 'Head' },
	{ value: 'throat', label: 'Shaft' },
];

export const SHAFT_START_U = 0.15;

export function LayerPlacement({ layer }: { layer: DesignLayer }): React.JSX.Element {
	const execute = useDesignStore((state) => state.execute);
	const update = ({ patch, key }: { patch: ShapeLayerPatch; key: string }): void => {
		execute({
			command: updateLayerCommand({
				layerId: layer.id,
				patch,
				mergeKey: key === 'zone' ? null : `layer-${key}:${layer.id}`,
			}),
		});
	};

	return (
		<>
			<SegmentedControl
				legend="Section"
				name={`section-${layer.id}`}
				options={SECTION_OPTIONS}
				value={layer.zone}
				onChange={({ value }) => {
					update({
						patch: {
							zone: value,
							position: {
								u: value === 'throat' ? SHAFT_START_U : layer.position.u,
								v: 0.5,
							},
						},
						key: 'zone',
					});
				}}
			/>
			<Slider
				label="Position X"
				value={Math.round(layer.position.u * PERCENT)}
				min={0}
				max={PERCENT}
				unit="%"
				onChange={({ value }) => {
					update({
						patch: { position: { ...layer.position, u: value / PERCENT } },
						key: 'u',
					});
				}}
			/>
			<Slider
				label="Position Y"
				value={Math.round(layer.position.v * PERCENT)}
				min={0}
				max={PERCENT}
				unit="%"
				onChange={({ value }) => {
					update({
						patch: { position: { ...layer.position, v: value / PERCENT } },
						key: 'v',
					});
				}}
			/>
			<p className={styles.hint}>
				Or drag it on the racket. The HEAD logo always stays on top.
			</p>
			<Slider
				label="Size"
				value={Math.round(layer.scale * PERCENT)}
				min={SHAPE_SCALE_RANGE.min * PERCENT}
				max={SHAPE_SCALE_RANGE.max * PERCENT}
				unit="%"
				onChange={({ value }) => {
					update({ patch: { scale: value / PERCENT }, key: 'scale' });
				}}
			/>
			<Slider
				label="Rotation"
				value={layer.rotation}
				min={-180}
				max={180}
				unit="°"
				onChange={({ value }) => {
					update({ patch: { rotation: value }, key: 'rotation' });
				}}
			/>
		</>
	);
}
