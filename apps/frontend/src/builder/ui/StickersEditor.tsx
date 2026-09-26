import { MAX_LAYERS } from '@uniq/shared';
import { useState } from 'react';

import { getNextShapeU } from '@builder/decor/shape-paths';
import {
	addLayerCommand,
	createStickerLayer,
	removeLayerCommand,
} from '@builder/design/decor-commands';
import {
	findSticker,
	getStickerUrl,
	STICKER_CATEGORIES,
	STICKERS,
} from '@builder/stickers/sticker-catalog';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';
import { LayerPlacement } from '@builder/ui/LayerPlacement';

import { Button } from '@components/Button/Button';
import { IconButton } from '@components/IconButton/IconButton';
import { CloseIcon } from '@components/icons/Icons';
import { Select } from '@components/Select/Select';

import type { StickerCategory } from '@builder/stickers/sticker-catalog';
import type { StickerId, StickerLayer } from '@uniq/shared';

const stickerLabel = ({ stickerId }: { stickerId: StickerId }): string =>
	findSticker({ stickerId })?.label ?? stickerId;

function StickerThumb({ stickerId }: { stickerId: StickerId }): React.JSX.Element {
	return (
		<img
			className={styles.stickerThumb}
			src={getStickerUrl({ stickerId })}
			alt=""
			width={48}
			height={48}
			loading="lazy"
			decoding="async"
		/>
	);
}

interface StickersEditorProps {
	createId?: (() => string) | undefined;
}

export function StickersEditor({
	createId = (): string => crypto.randomUUID(),
}: StickersEditorProps): React.JSX.Element {
	const layers = useDesignStore((state) => state.document.layers);
	const selectedLayerId = useDesignStore((state) => state.selectedLayerId);
	const selectLayer = useDesignStore((state) => state.selectLayer);
	const execute = useDesignStore((state) => state.execute);
	const [category, setCategory] = useState<StickerCategory>('flowers');
	const stickers = layers.filter(
		(layer): layer is StickerLayer => layer.kind === 'sticker',
	);
	const selected = stickers.find((layer) => layer.id === selectedLayerId) ?? null;
	const isFull = layers.length >= MAX_LAYERS;

	return (
		<div className={styles.section}>
			<Select
				label="Collection"
				options={STICKER_CATEGORIES.map((item) => ({
					value: item.id,
					label: item.label,
				}))}
				value={category}
				onChange={({ value }) => {
					setCategory(value);
				}}
			/>
			<p className={styles.fieldLabel}>Add a sticker</p>
			<p className={styles.hint}>
				{category === 'cities' ? (
					'City lettering drawn for UNIQ.'
				) : (
					<>
						Full-color art from{' '}
						<a
							href="https://github.com/microsoft/fluentui-emoji"
							target="_blank"
							rel="noreferrer"
						>
							Microsoft Fluent Emoji
						</a>{' '}
						(MIT).
					</>
				)}
			</p>
			<div className={styles.stickerPalette}>
				{STICKERS.filter((sticker) => sticker.category === category).map((sticker) => (
					<Button
						key={sticker.id}
						className={styles.stickerButton}
						disabled={isFull}
						aria-label={`Add ${sticker.label}`}
						title={sticker.label}
						onClick={() => {
							const layer = createStickerLayer({
								id: createId(),
								stickerId: sticker.id,
								zone: 'frame',
								u: getNextShapeU({
									count: useDesignStore.getState().document.layers.length,
								}),
							});
							execute({ command: addLayerCommand({ layer }) });
							selectLayer({ layerId: layer.id });
						}}
					>
						<StickerThumb stickerId={sticker.id} />
					</Button>
				))}
			</div>
			{isFull ? (
				<p className={styles.notice} role="status">
					{`Up to ${String(MAX_LAYERS)} shapes and stickers.`}
				</p>
			) : null}
			{stickers.length === 0 ? (
				<p className={styles.empty}>
					No stickers yet. Pick one above to place it on the frame.
				</p>
			) : (
				<ul className={styles.layerList} aria-label="Stickers on the frame">
					{stickers.map((layer, index) => (
						<li key={layer.id} className={styles.layerRow}>
							<button
								type="button"
								className={styles.layerButton}
								aria-pressed={layer.id === selected?.id}
								onClick={() => {
									selectLayer({ layerId: layer.id });
								}}
							>
								<span className={styles.layerSwatch}>
									<StickerThumb stickerId={layer.stickerId} />
								</span>
								{`${stickerLabel({ stickerId: layer.stickerId })} ${String(index + 1)}`}
							</button>
							<IconButton
								label={`Remove ${stickerLabel({ stickerId: layer.stickerId })} ${String(index + 1)}`}
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
					<p className={styles.stopTitle}>
						{stickerLabel({ stickerId: selected.stickerId })}
					</p>
					<LayerPlacement layer={selected} />
				</div>
			)}
		</div>
	);
}
