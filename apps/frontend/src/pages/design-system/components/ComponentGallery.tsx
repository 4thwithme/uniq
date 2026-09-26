import { useState } from 'react';

import { ThemeColumns } from '@pages/design-system/components/ThemeColumns';
import styles from '@pages/design-system/DesignSystemPage.module.scss';

import { Badge } from '@components/Badge/Badge';
import { Button } from '@components/Button/Button';
import { ColorField } from '@components/ColorField/ColorField';
import { FileDrop } from '@components/FileDrop/FileDrop';
import { IconButton } from '@components/IconButton/IconButton';
import { CloseIcon, PlusIcon, RedoIcon, UndoIcon } from '@components/icons/Icons';
import { Kbd } from '@components/Kbd/Kbd';
import { Panel } from '@components/Panel/Panel';
import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';
import { Select } from '@components/Select/Select';
import { Slider } from '@components/Slider/Slider';
import { StepNav } from '@components/StepNav/StepNav';
import { SwatchGrid } from '@components/SwatchGrid/SwatchGrid';
import { Switch } from '@components/Switch/Switch';
import { TextField } from '@components/TextField/TextField';

import type { SegmentedOption } from '@components/SegmentedControl/SegmentedControl';
import type { ColorTheme } from '@store/theme-store';
import type { ReactNode } from 'react';

type Finish = 'gloss' | 'matte' | 'metallic' | 'pearl';

const FINISH_OPTIONS: readonly SegmentedOption<Finish>[] = [
	{ value: 'gloss', label: 'Gloss' },
	{ value: 'matte', label: 'Matte' },
	{ value: 'metallic', label: 'Metal' },
	{ value: 'pearl', label: 'Pearl' },
];

function Specimen({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}): React.JSX.Element {
	return (
		<div className={styles.specimen}>
			<h4 className={styles.groupTitle}>{title}</h4>
			<div className={styles.specimenBody}>{children}</div>
		</div>
	);
}

interface GalleryState {
	finish: Finish;
	angle: number;
	color: string;
	name: string;
	isMirrored: boolean;
	isPressed: boolean;
	step: 'theme' | 'frame' | 'handle';
	option: 'color' | 'print';
	swatch: 'dots' | 'stripes' | 'blocks';
}

const SWATCHES = [
	{
		value: 'dots',
		label: 'Dots',
		preview: (
			<svg viewBox="0 0 40 30" aria-hidden="true">
				<circle cx="10" cy="15" r="5" fill="currentColor" />
				<circle cx="30" cy="15" r="5" fill="currentColor" />
			</svg>
		),
	},
	{
		value: 'stripes',
		label: 'Stripes',
		preview: (
			<svg viewBox="0 0 40 30" aria-hidden="true">
				<path d="M0 8H40M0 22H40" stroke="currentColor" strokeWidth="4" />
			</svg>
		),
	},
	{
		value: 'blocks',
		label: 'Blocks',
		preview: (
			<svg viewBox="0 0 40 30" aria-hidden="true">
				<rect x="6" y="6" width="12" height="18" fill="currentColor" />
				<rect x="22" y="6" width="12" height="18" fill="currentColor" />
			</svg>
		),
	},
] as const;

function GalleryColumn({
	theme,
	state,
	setState,
}: {
	theme: ColorTheme;
	state: GalleryState;
	setState: (params: { patch: Partial<GalleryState> }) => void;
}): React.JSX.Element {
	return (
		<div className={styles.gallery}>
			<Specimen title="Button">
				<div className={styles.row}>
					<Button variant="primary">Export PNG</Button>
					<Button>Duplicate</Button>
					<Button variant="ghost">Reset</Button>
					<Button variant="danger">Delete layer</Button>
				</div>
				<div className={styles.row}>
					<Button variant="primary" size="sm">
						Apply
					</Button>
					<Button size="sm">Cancel</Button>
					<Button
						size="sm"
						aria-pressed={state.isPressed}
						onClick={() => {
							setState({ patch: { isPressed: !state.isPressed } });
						}}
					>
						Snap
					</Button>
					<Button size="sm" disabled>
						Disabled
					</Button>
				</div>
			</Specimen>
			<Specimen title="Icon button">
				<div className={styles.row}>
					<IconButton label="Undo">
						<UndoIcon />
					</IconButton>
					<IconButton label="Redo" disabled>
						<RedoIcon />
					</IconButton>
					<IconButton label="Add stop" variant="secondary">
						<PlusIcon />
					</IconButton>
					<IconButton label="Remove stop" size="sm">
						<CloseIcon />
					</IconButton>
				</div>
			</Specimen>
			<Specimen title="Segmented control">
				<SegmentedControl
					legend="Finish"
					name={`finish-${theme}`}
					options={FINISH_OPTIONS}
					value={state.finish}
					onChange={({ value }) => {
						setState({ patch: { finish: value } });
					}}
				/>
			</Specimen>
			<Specimen title="Select">
				<Select
					label="Finish"
					options={FINISH_OPTIONS}
					value={state.finish}
					onChange={({ value }) => {
						setState({ patch: { finish: value } });
					}}
				/>
			</Specimen>
			<Specimen title="Slider">
				<Slider
					label="Angle"
					value={state.angle}
					min={0}
					max={360}
					unit="°"
					onChange={({ value }) => {
						setState({ patch: { angle: value } });
					}}
				/>
			</Specimen>
			<Specimen title="Color field">
				<ColorField
					label="Zone color"
					value={state.color}
					onChange={({ value }) => {
						setState({ patch: { color: value } });
					}}
				/>
			</Specimen>
			<Specimen title="Text field">
				<TextField
					label="Design name"
					value={state.name}
					placeholder="Untitled racket"
					hint="Shown on exports"
					onChange={({ value }) => {
						setState({ patch: { name: value } });
					}}
				/>
				<TextField
					label="Sticker text"
					value="WAY TOO LONG FOR THE THROAT"
					error="Max 18 characters on the throat"
					onChange={() => undefined}
				/>
			</Specimen>
			<Specimen title="Switch">
				<Switch
					label="Mirror left and right"
					checked={state.isMirrored}
					onChange={({ checked }) => {
						setState({ patch: { isMirrored: checked } });
					}}
				/>
				<Switch label="Locked" checked={false} isDisabled onChange={() => undefined} />
			</Specimen>
			<Specimen title="Badge and key">
				<div className={styles.row}>
					<Badge>Draft</Badge>
					<Badge tone="accent">Selected</Badge>
					<Badge tone="success">Saved</Badge>
					<Badge tone="warning">Unsaved</Badge>
					<Badge tone="danger">Failed</Badge>
				</div>
				<p className={styles.keys}>
					Undo <Kbd>⌘</Kbd>
					<Kbd>Z</Kbd> · Redo <Kbd>⌘</Kbd>
					<Kbd>⇧</Kbd>
					<Kbd>Z</Kbd>
				</p>
			</Specimen>
			<Specimen title="Step nav">
				<StepNav
					label={`Example steps ${theme}`}
					steps={[
						{ id: 'theme', label: 'Theme', description: 'Start from a preset' },
						{
							id: 'frame',
							label: 'Frame',
							description: 'Color and print',
							options: [
								{ id: 'color', label: 'Color', meta: state.color },
								{ id: 'print', label: 'Print', meta: '—' },
							],
						},
						{ id: 'handle', label: 'Handle' },
					]}
					activeStep={state.step}
					activeOption={state.option}
					onSelect={({ step, option }) => {
						setState({ patch: option === undefined ? { step } : { step, option } });
					}}
				/>
			</Specimen>
			<Specimen title="Swatch grid">
				<SwatchGrid
					legend="Pattern"
					name={`swatch-${theme}`}
					options={SWATCHES}
					value={state.swatch}
					onChange={({ value }) => {
						setState({ patch: { swatch: value } });
					}}
				/>
			</Specimen>
			<Specimen title="File drop">
				<FileDrop
					label="Upload your own print"
					hint="PNG, WebP or SVG · max 10 MB"
					accept="image/png"
					onFile={() => undefined}
				/>
				<FileDrop
					label="Upload your own print"
					hint="PNG, WebP or SVG · max 10 MB"
					accept="image/png"
					error="JPG has no transparent background. Use PNG, WebP or SVG."
					onFile={() => undefined}
				/>
			</Specimen>
			<Specimen title="Panel">
				<Panel
					title="Paint · Frame"
					elevation="float"
					actions={
						<IconButton label="Close panel" size="sm">
							<CloseIcon />
						</IconButton>
					}
				>
					<ColorField
						label="Color"
						value={state.color}
						onChange={({ value }) => {
							setState({ patch: { color: value } });
						}}
					/>
					<SegmentedControl
						legend="Finish"
						name={`panel-finish-${theme}`}
						options={FINISH_OPTIONS}
						value={state.finish}
						onChange={({ value }) => {
							setState({ patch: { finish: value } });
						}}
					/>
				</Panel>
			</Specimen>
		</div>
	);
}

export function ComponentGallery(): React.JSX.Element {
	const [gallery, setGallery] = useState<GalleryState>({
		finish: 'gloss',
		angle: 45,
		color: '#1f7a3d',
		name: '',
		isMirrored: true,
		isPressed: false,
		step: 'frame',
		option: 'color',
		swatch: 'stripes',
	});

	const patchGallery = ({ patch }: { patch: Partial<GalleryState> }): void => {
		setGallery((previous) => ({ ...previous, ...patch }));
	};

	return (
		<ThemeColumns>
			{({ theme }) => (
				<GalleryColumn theme={theme} state={gallery} setState={patchGallery} />
			)}
		</ThemeColumns>
	);
}
