import {
	getGripHex,
	GRIP_CATALOG,
	GRIP_MATERIALS,
	OVERGRIP_CATALOG,
	OVERGRIP_COLORS,
	OVERGRIP_MATERIALS,
	withGripMaterial,
	withOvergripMaterial,
} from '@uniq/shared';

import { setGripCommand } from '@builder/design/design-commands';
import {
	GRIP_FINISH_LABELS,
	GRIP_TEXTURE_LABELS,
	OVERGRIP_TEXTURE_LABELS,
} from '@builder/grips/grip-labels';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';

import { ColorField } from '@components/ColorField/ColorField';
import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';
import { SwatchGrid } from '@components/SwatchGrid/SwatchGrid';

import type { SwatchOption } from '@components/SwatchGrid/SwatchGrid';
import type { GripColor, GripSpec } from '@uniq/shared';

const toColorOptions = ({
	colors,
}: {
	colors: readonly GripColor[];
}): SwatchOption<string>[] =>
	colors.map((color) => ({
		value: color.id,
		label: color.name,
		preview: <span className={styles.colorChip} style={{ background: color.hex }} />,
	}));

const useGrip = (): { grip: GripSpec; setGrip: (params: { grip: GripSpec }) => void } => {
	const grip = useDesignStore((state) => state.document.grip);
	const execute = useDesignStore((state) => state.execute);
	return {
		grip,
		setGrip: ({ grip: next }) => {
			execute({ command: setGripCommand({ grip: next }) });
		},
	};
};

const CUSTOM = 'custom';
const FALLBACK_HEX = '#161616';

export function GripEditor(): React.JSX.Element {
	const { grip, setGrip } = useGrip();
	const spec = GRIP_CATALOG[grip.material];
	const hex = getGripHex({ grip }) ?? FALLBACK_HEX;
	const colorOptions: SwatchOption<string>[] = [
		...toColorOptions({ colors: spec.colors }),
		{
			value: CUSTOM,
			label: 'Custom',
			preview: <span className={styles.colorChip} style={{ background: hex }} />,
		},
	];

	return (
		<div className={styles.section}>
			<SegmentedControl
				legend="Material"
				name="grip-material"
				options={GRIP_MATERIALS.map((material) => ({
					value: material,
					label: GRIP_CATALOG[material].name,
				}))}
				value={grip.material}
				onChange={({ value }) => {
					setGrip({ grip: withGripMaterial({ grip, material: value }) });
				}}
			/>
			<p className={styles.hint}>{spec.description}</p>
			<SwatchGrid
				legend="Color"
				name="grip-color"
				columns={4}
				options={colorOptions}
				value={grip.customHex === null ? grip.colorId : CUSTOM}
				onChange={({ value }) => {
					setGrip({
						grip:
							value === CUSTOM
								? { ...grip, customHex: hex }
								: { ...grip, colorId: value, customHex: null },
					});
				}}
			/>
			{grip.customHex === null ? null : (
				<ColorField
					label="Custom color"
					value={grip.customHex}
					onChange={({ value }) => {
						setGrip({ grip: { ...grip, customHex: value } });
					}}
				/>
			)}
			<SegmentedControl
				legend="Texture"
				name="grip-texture"
				options={spec.textures.map((texture) => ({
					value: texture,
					label: GRIP_TEXTURE_LABELS[texture],
				}))}
				value={grip.texture}
				onChange={({ value }) => {
					setGrip({ grip: { ...grip, texture: value } });
				}}
			/>
			{spec.finishes.length > 1 ? (
				<SegmentedControl
					legend="Finish"
					name="grip-finish"
					options={spec.finishes.map((finish) => ({
						value: finish,
						label: GRIP_FINISH_LABELS[finish],
					}))}
					value={grip.finish}
					onChange={({ value }) => {
						setGrip({ grip: { ...grip, finish: value } });
					}}
				/>
			) : (
				<p className={styles.hint}>Leather comes in its natural matte finish.</p>
			)}
			{grip.overgrip === null ? null : (
				<p className={styles.notice} role="status">
					An overgrip covers this grip. Remove it in Overgrip to see the base grip.
				</p>
			)}
		</div>
	);
}

const NONE = 'none';

export function OvergripEditor(): React.JSX.Element {
	const { grip, setGrip } = useGrip();
	const { overgrip } = grip;
	const options: SwatchOption<string>[] = [
		{ value: NONE, label: 'None', preview: null },
		...toColorOptions({ colors: OVERGRIP_COLORS }),
	];

	return (
		<div className={styles.section}>
			<p className={styles.hint}>
				A thin tape wrapped over the grip. It adds tack or sweat absorption and sets the
				handle color.
			</p>
			<SwatchGrid
				legend="Overgrip"
				name="overgrip-color"
				columns={4}
				options={options}
				value={overgrip?.colorId ?? NONE}
				onChange={({ value }) => {
					setGrip({
						grip: {
							...grip,
							overgrip:
								value === NONE
									? null
									: {
											material: overgrip?.material ?? 'tacky',
											texture: overgrip?.texture ?? 'smooth',
											colorId: value,
										},
						},
					});
				}}
			/>
			{overgrip === null ? null : (
				<>
					<SegmentedControl
						legend="Material"
						name="overgrip-material"
						options={OVERGRIP_MATERIALS.map((material) => ({
							value: material,
							label: OVERGRIP_CATALOG[material].name,
						}))}
						value={overgrip.material}
						onChange={({ value }) => {
							setGrip({
								grip: {
									...grip,
									overgrip: withOvergripMaterial({ overgrip, material: value }),
								},
							});
						}}
					/>
					<p className={styles.hint}>{OVERGRIP_CATALOG[overgrip.material].description}</p>
					<SegmentedControl
						legend="Texture"
						name="overgrip-texture"
						options={OVERGRIP_CATALOG[overgrip.material].textures.map((texture) => ({
							value: texture,
							label: OVERGRIP_TEXTURE_LABELS[texture],
						}))}
						value={overgrip.texture}
						onChange={({ value }) => {
							setGrip({ grip: { ...grip, overgrip: { ...overgrip, texture: value } } });
						}}
					/>
				</>
			)}
		</div>
	);
}
