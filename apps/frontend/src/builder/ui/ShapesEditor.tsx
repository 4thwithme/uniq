import { MAX_LAYERS } from '@uniq/shared';
import { useState } from 'react';

import {
	getNextShapeU,
	getShapeDefinition,
	SHAPE_CATEGORIES,
	SHAPE_DEFINITIONS,
} from '@builder/decor/shape-paths';
import {
	addLayerCommand,
	createShapeLayer,
	removeLayerCommand,
	updateLayerCommand,
} from '@builder/design/decor-commands';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';
import { LayerPlacement } from '@builder/ui/LayerPlacement';

import { Button } from '@components/Button/Button';
import { ColorField } from '@components/ColorField/ColorField';
import { IconButton } from '@components/IconButton/IconButton';
import { CloseIcon } from '@components/icons/Icons';
import { Select } from '@components/Select/Select';

import type { ShapeCategory } from '@builder/decor/shape-library';
import type { ShapeKind, ShapeLayer } from '@uniq/shared';

const shapeLabel = ({ shape }: { shape: ShapeKind }): string =>
	getShapeDefinition({ shape }).label;

export function ShapePreview({ shape }: { shape: ShapeKind }): React.JSX.Element {
	const { d, box } = getShapeDefinition({ shape });
	return (
		<svg viewBox={`0 0 ${String(box)} ${String(box)}`} aria-hidden="true">
			<path d={d} fill="currentColor" />
		</svg>
	);
}

interface ShapesEditorProps {
	createId?: (() => string) | undefined;
}

export function ShapesEditor({
	createId = (): string => crypto.randomUUID(),
}: ShapesEditorProps): React.JSX.Element {
	const layers = useDesignStore((state) => state.document.layers);
	const selectedLayerId = useDesignStore((state) => state.selectedLayerId);
	const selectLayer = useDesignStore((state) => state.selectLayer);
	const execute = useDesignStore((state) => state.execute);
	const zoneLayers = layers.filter(
		(layer): layer is ShapeLayer => layer.kind === 'shape',
	);
	const selected = zoneLayers.find((layer) => layer.id === selectedLayerId) ?? null;
	const isFull = layers.length >= MAX_LAYERS;
	const [category, setCategory] = useState<ShapeCategory>('basic');

	return (
		<div className={styles.section}>
			<div className={styles.section}>
				<Select
					label="Collection"
					options={SHAPE_CATEGORIES.map((item) => ({
						value: item.id,
						label: item.label,
					}))}
					value={category}
					onChange={({ value }) => {
						setCategory(value);
					}}
				/>
				<p className={styles.fieldLabel}>Add a shape</p>
				{category === 'basic' ? null : (
					<p className={styles.hint}>
						Icons by Lorc, Delapouite, Faithtoken and Carl Olsen from{' '}
						<a href="https://game-icons.net" target="_blank" rel="noreferrer">
							game-icons.net
						</a>
						, licensed{' '}
						<a
							href="https://creativecommons.org/licenses/by/3.0/"
							target="_blank"
							rel="noreferrer"
						>
							CC BY 3.0
						</a>
						.
					</p>
				)}
				<div className={styles.shapePalette}>
					{SHAPE_DEFINITIONS.filter((item) => item.category === category).map(
						({ id: shape }) => (
							<Button
								key={shape}
								className={styles.shapeButton}
								disabled={isFull}
								aria-label={`Add ${shapeLabel({ shape })}`}
								title={shapeLabel({ shape })}
								onClick={() => {
									const layer = createShapeLayer({
										id: createId(),
										shape,
										zone: 'frame',
										color: '#ffffff',
										u: getNextShapeU({
											count: useDesignStore.getState().document.layers.length,
										}),
									});
									execute({ command: addLayerCommand({ layer }) });
									selectLayer({ layerId: layer.id });
								}}
							>
								<ShapePreview shape={shape} />
							</Button>
						),
					)}
				</div>
				{isFull ? (
					<p className={styles.notice} role="status">
						{`Up to ${String(MAX_LAYERS)} shapes.`}
					</p>
				) : null}
			</div>
			{zoneLayers.length === 0 ? (
				<p className={styles.empty}>
					No shapes yet. Pick one above to place it on the frame.
				</p>
			) : (
				<ul className={styles.layerList} aria-label="Shapes on the frame">
					{zoneLayers.map((layer, index) => (
						<li key={layer.id} className={styles.layerRow}>
							<button
								type="button"
								className={styles.layerButton}
								aria-pressed={layer.id === selected?.id}
								onClick={() => {
									selectLayer({ layerId: layer.id });
								}}
							>
								<span className={styles.layerSwatch} style={{ color: layer.color }}>
									<ShapePreview shape={layer.shape} />
								</span>
								{`${shapeLabel({ shape: layer.shape })} ${String(index + 1)}`}
							</button>
							<IconButton
								label={`Remove ${shapeLabel({ shape: layer.shape })} ${String(index + 1)}`}
								size="sm"
								onClick={() => {
									execute({ command: removeLayerCommand({ layerId: layer.id }) });
								}}
							>
								<CloseIcon />
							</IconButton>
						</li>
					))}
				</ul>
			)}
			{selected === null ? null : (
				<div className={styles.stop}>
					<p className={styles.stopTitle}>{shapeLabel({ shape: selected.shape })}</p>
					<ColorField
						label="Shape color"
						value={selected.color}
						onChange={({ value }) => {
							execute({
								command: updateLayerCommand({
									layerId: selected.id,
									patch: { color: value },
									mergeKey: `shape-color:${selected.id}`,
								}),
							});
						}}
					/>
					<LayerPlacement layer={selected} />
				</div>
			)}
		</div>
	);
}
