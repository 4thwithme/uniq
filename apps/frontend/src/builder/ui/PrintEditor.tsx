import { PRINT_REPEAT_RANGE, PRINT_SCALE_RANGE } from '@uniq/shared';
import { useState } from 'react';

import { setZonePrintCommand } from '@builder/design/decor-commands';
import { getBrowserAssetStore } from '@builder/prints/asset-store';
import { checkPrintFile, PRINT_ACCEPT } from '@builder/prints/print-files';
import { PRINT_PRESETS, toSvgDataUrl } from '@builder/prints/print-presets';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';

import { FileDrop } from '@components/FileDrop/FileDrop';
import { Slider } from '@components/Slider/Slider';
import { SwatchGrid } from '@components/SwatchGrid/SwatchGrid';

import type { AssetStore } from '@builder/prints/asset-store';
import type { PrintPreset } from '@builder/prints/print-presets';
import type { PrintImageStatus } from '@builder/prints/usePrintImage';
import type { SwatchOption } from '@components/SwatchGrid/SwatchGrid';
import type { PrintOverlay, PrintSource, ZoneId } from '@uniq/shared';

const PERCENT = 100;
const UPLOAD_CHOICE = 'upload';
const NONE_CHOICE = 'none';

const DEFAULT_PRINT: Omit<PrintOverlay, 'source'> = {
	scale: 1,
	repeat: 4,
	offset: 0,
	offsetY: 0.5,
};

const previewUrl = ({ preset }: { preset: PrintPreset }): string =>
	preset.imageUrl ?? toSvgDataUrl({ markup: preset.svg ?? '' });

const PRESET_OPTIONS: readonly SwatchOption<string>[] = PRINT_PRESETS.map((preset) => ({
	value: preset.id,
	label: preset.name,
	preview: <img src={previewUrl({ preset })} alt="" />,
}));

const toChoice = ({ print }: { print: PrintOverlay | null }): string => {
	if (print === null) {
		return NONE_CHOICE;
	}
	return print.source.kind === 'preset' ? print.source.presetId : UPLOAD_CHOICE;
};

interface PrintEditorProps {
	status: PrintImageStatus;
	zoneId?: ZoneId | undefined;
	store?: AssetStore | undefined;
	createId?: (() => string) | undefined;
}

export function PrintEditor({
	status,
	zoneId = 'frame',
	store = getBrowserAssetStore(),
	createId = (): string => crypto.randomUUID(),
}: PrintEditorProps): React.JSX.Element {
	const print = useDesignStore((state) => state.document.overlays[zoneId].print);
	const execute = useDesignStore((state) => state.execute);
	const [error, setError] = useState<string | null>(null);

	const setPrint = ({
		next,
		mergeKey = null,
	}: {
		next: PrintOverlay | null;
		mergeKey?: string | null;
	}): void => {
		execute({ command: setZonePrintCommand({ zoneId, print: next, mergeKey }) });
	};

	const applySource = ({ source }: { source: PrintSource }): void => {
		setPrint({ next: { ...DEFAULT_PRINT, ...print, source } });
	};

	const options: readonly SwatchOption<string>[] = [
		{ value: NONE_CHOICE, label: 'None', preview: null },
		...PRESET_OPTIONS,
		...(print?.source.kind === 'upload'
			? [{ value: UPLOAD_CHOICE, label: print.source.name, preview: <span>Upload</span> }]
			: []),
	];

	const onFile = async ({ file }: { file: File }): Promise<void> => {
		const check = checkPrintFile({ name: file.name, type: file.type, size: file.size });
		if (!check.ok) {
			setError(check.message);
			return;
		}
		try {
			const id = createId();
			await store.put({ asset: { id, name: file.name, type: file.type, blob: file } });
			setError(null);
			applySource({ source: { kind: 'upload', assetId: id, name: file.name } });
		} catch {
			setError('Could not save the file in this browser.');
		}
	};

	return (
		<div className={styles.section}>
			<SwatchGrid
				legend="Print"
				name={`${zoneId}-print`}
				options={options}
				columns={1}
				value={toChoice({ print })}
				onChange={({ value }) => {
					if (value === NONE_CHOICE) {
						setPrint({ next: null });
					} else if (value !== UPLOAD_CHOICE) {
						applySource({ source: { kind: 'preset', presetId: value } });
					}
				}}
			/>
			<FileDrop
				label="Upload your own print"
				hint="PNG, WebP, SVG, AVIF or GIF with a transparent background · max 10 MB"
				accept={PRINT_ACCEPT}
				error={error}
				onFile={({ file }) => {
					void onFile({ file });
				}}
			/>
			{status === 'missing' ? (
				<p className={styles.notice} role="status">
					The uploaded file isn’t on this device anymore. Upload it again.
				</p>
			) : null}
			{status === 'error' ? (
				<p className={styles.notice} role="status">
					This file couldn’t be drawn. Try exporting it again as PNG.
				</p>
			) : null}
			{print === null ? null : (
				<>
					<Slider
						label="Size"
						value={Math.round(print.scale * PERCENT)}
						min={PRINT_SCALE_RANGE.min * PERCENT}
						max={PRINT_SCALE_RANGE.max * PERCENT}
						unit="%"
						onChange={({ value }) => {
							setPrint({
								next: { ...print, scale: value / PERCENT },
								mergeKey: 'print-scale',
							});
						}}
					/>
					<Slider
						label="Repeat"
						value={print.repeat}
						min={PRINT_REPEAT_RANGE.min}
						max={PRINT_REPEAT_RANGE.max}
						unit="×"
						onChange={({ value }) => {
							setPrint({ next: { ...print, repeat: value }, mergeKey: 'print-repeat' });
						}}
					/>
					<Slider
						label="Position X"
						value={Math.round(print.offset * PERCENT)}
						min={0}
						max={PERCENT}
						unit="%"
						onChange={({ value }) => {
							setPrint({
								next: { ...print, offset: value / PERCENT },
								mergeKey: 'print-offset',
							});
						}}
					/>
					<Slider
						label="Position Y"
						value={Math.round(print.offsetY * PERCENT)}
						min={0}
						max={PERCENT}
						unit="%"
						onChange={({ value }) => {
							setPrint({
								next: { ...print, offsetY: value / PERCENT },
								mergeKey: 'print-offset-y',
							});
						}}
					/>
					<p className={styles.hint}>Or drag the print on the racket.</p>
				</>
			)}
		</div>
	);
}
