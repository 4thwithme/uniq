import {
	BADGE_COLORS,
	BADGE_PRESET_IDS,
	BUTT_CAP_COLORS,
	findBadgeColor,
	findButtCapColor,
	GRIP_FINISHES,
	normalizeBadgeText,
} from '@uniq/shared';

import { getBadgeText } from '@builder/buttcap/badge-painter';
import { BADGE_PRESET_LABELS } from '@builder/buttcap/butt-cap-labels';
import {
	CAP_BADGE_OFFSET_RATIO,
	CAP_BADGE_SCALE,
	CAP_LOGO_WIDTH_RATIO,
	getLogoColor,
	HEAD_ICON_LOGO,
} from '@builder/decor/brand-logo';
import { SHAPE_BOX, SHAPE_PATHS } from '@builder/decor/shape-paths';
import { setButtCapCommand } from '@builder/design/design-commands';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';

import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';
import { SwatchGrid } from '@components/SwatchGrid/SwatchGrid';
import { TextField } from '@components/TextField/TextField';

import type { SwatchOption } from '@components/SwatchGrid/SwatchGrid';
import type { BadgePresetId, ButtCapBadge, ButtCapSpec, GripColor } from '@uniq/shared';

type BadgeKind = ButtCapBadge['kind'];

const BADGE_KIND_OPTIONS: readonly { value: BadgeKind; label: string }[] = [
	{ value: 'none', label: 'None' },
	{ value: 'preset', label: 'Icon' },
	{ value: 'text', label: 'Letters' },
];

const colorOptions = ({
	colors,
}: {
	colors: readonly GripColor[];
}): SwatchOption<string>[] =>
	colors.map((color) => ({
		value: color.id,
		label: color.name,
		preview: <span className={styles.colorChip} style={{ background: color.hex }} />,
	}));

function BadgeGlyph({
	presetId,
	fill,
	background,
}: {
	presetId: BadgePresetId;
	fill: string;
	background: string;
}): React.JSX.Element {
	if (presetId === 'monogram') {
		return (
			<text
				x="50"
				y="52"
				textAnchor="middle"
				dominantBaseline="middle"
				fontSize="40"
				fontWeight="900"
				fill={fill}
			>
				U
			</text>
		);
	}
	if (presetId === 'ball') {
		return (
			<g>
				<circle cx="50" cy="50" r="24" fill={fill} />
				<path
					d="M30 37c10 6 10 20 0 26M70 37c-10 6-10 20 0 26"
					stroke={background}
					strokeWidth="3"
					fill="none"
				/>
			</g>
		);
	}
	return (
		<path
			d={SHAPE_PATHS[presetId]}
			fill={fill}
			transform={`translate(25 25) scale(${String(50 / SHAPE_BOX)})`}
		/>
	);
}

export function ButtCapPreview({ buttCap }: { buttCap: ButtCapSpec }): React.JSX.Element {
	const capHex = findButtCapColor({ colorId: buttCap.colorId })?.hex ?? '#151515';
	const { badge } = buttCap;
	const badgeHex =
		badge.kind === 'none'
			? capHex
			: (findBadgeColor({ colorId: badge.colorId })?.hex ?? '#ffffff');
	const text = getBadgeText({ badge });
	const logoColor = getLogoColor({ background: capHex });
	const logoWidth = 100 * CAP_LOGO_WIDTH_RATIO;
	const logoHeight = (logoWidth * HEAD_ICON_LOGO.height) / HEAD_ICON_LOGO.width;

	return (
		<svg
			className={styles.capPreview}
			viewBox="0 0 100 100"
			role="img"
			aria-label="Grip Cap preview"
		>
			<polygon points="50,2 84,16 98,50 84,84 50,98 16,84 2,50 16,16" fill={capHex} />
			<circle
				cx="50"
				cy="50"
				r="40"
				fill="none"
				stroke="#000000"
				strokeOpacity="0.25"
				strokeWidth="3"
			/>
			<svg
				x={50 - logoWidth / 2}
				y={50 - logoHeight / 2}
				width={logoWidth}
				height={logoHeight}
				viewBox={`${String(HEAD_ICON_LOGO.minX)} ${String(HEAD_ICON_LOGO.minY)} ${String(HEAD_ICON_LOGO.width)} ${String(HEAD_ICON_LOGO.height)}`}
			>
				<path d={HEAD_ICON_LOGO.d} fill={logoColor} />
			</svg>
			{badge.kind === 'none' ? null : (
				<g
					transform={`translate(50 ${String(50 + 100 * CAP_BADGE_OFFSET_RATIO)}) scale(${String(CAP_BADGE_SCALE)}) translate(-50 -50)`}
				>
					{text !== null && badge.kind === 'text' ? (
						<text
							x="50"
							y="52"
							textAnchor="middle"
							dominantBaseline="middle"
							fontSize={text.length > 3 ? 20 : text.length > 2 ? 26 : 36}
							fontWeight="900"
							fill={badgeHex}
						>
							{text}
						</text>
					) : badge.kind === 'preset' ? (
						<BadgeGlyph presetId={badge.presetId} fill={badgeHex} background={capHex} />
					) : null}
				</g>
			)}
		</svg>
	);
}

export function ButtCapEditor(): React.JSX.Element {
	const buttCap = useDesignStore((state) => state.document.buttCap);
	const execute = useDesignStore((state) => state.execute);
	const { badge } = buttCap;
	const badgeColorId = badge.kind === 'none' ? 'white' : badge.colorId;

	const setButtCap = ({
		next,
		mergeKey = null,
	}: {
		next: ButtCapSpec;
		mergeKey?: string | null;
	}): void => {
		execute({ command: setButtCapCommand({ buttCap: next, mergeKey }) });
	};

	const setBadgeKind = ({ kind }: { kind: BadgeKind }): void => {
		if (kind === 'none') {
			setButtCap({ next: { ...buttCap, badge: { kind: 'none' } } });
		} else if (kind === 'preset') {
			setButtCap({
				next: {
					...buttCap,
					badge: { kind: 'preset', presetId: 'monogram', colorId: badgeColorId },
				},
			});
		} else {
			setButtCap({
				next: {
					...buttCap,
					badge: { kind: 'text', text: 'UQ', colorId: badgeColorId },
				},
			});
		}
	};

	return (
		<div className={styles.section}>
			<ButtCapPreview buttCap={buttCap} />
			<p className={styles.hint}>
				The plastic cap at the end of the handle. The badge sits under a clear domed
				finish.
			</p>
			<SwatchGrid
				legend="Cap color"
				name="butt-cap-color"
				columns={4}
				options={colorOptions({ colors: BUTT_CAP_COLORS })}
				value={buttCap.colorId}
				onChange={({ value }) => {
					setButtCap({ next: { ...buttCap, colorId: value } });
				}}
			/>
			<SegmentedControl
				legend="Finish"
				name="butt-cap-finish"
				options={GRIP_FINISHES.map((finish) => ({
					value: finish,
					label: finish === 'gloss' ? 'Gloss' : 'Matte',
				}))}
				value={buttCap.finish}
				onChange={({ value }) => {
					setButtCap({ next: { ...buttCap, finish: value } });
				}}
			/>
			<SegmentedControl
				legend="Badge"
				name="butt-cap-badge"
				options={BADGE_KIND_OPTIONS}
				value={badge.kind}
				onChange={({ value }) => {
					setBadgeKind({ kind: value });
				}}
			/>
			{badge.kind === 'preset' ? (
				<SwatchGrid
					legend="Icon"
					name="butt-cap-icon"
					columns={4}
					options={BADGE_PRESET_IDS.map((presetId) => ({
						value: presetId,
						label: BADGE_PRESET_LABELS[presetId],
						preview: (
							<svg viewBox="0 0 100 100" aria-hidden="true">
								<BadgeGlyph
									presetId={presetId}
									fill="currentColor"
									background="var(--color-surface-sunken)"
								/>
							</svg>
						),
					}))}
					value={badge.presetId}
					onChange={({ value }) => {
						setButtCap({ next: { ...buttCap, badge: { ...badge, presetId: value } } });
					}}
				/>
			) : null}
			{badge.kind === 'text' ? (
				<TextField
					label="Letters"
					value={badge.text}
					hint="1–4 letters or numbers, e.g. your initials"
					onChange={({ value }) => {
						const text = normalizeBadgeText({ text: value });
						if (text !== '') {
							setButtCap({
								next: { ...buttCap, badge: { ...badge, text } },
								mergeKey: 'butt-cap-text',
							});
						}
					}}
				/>
			) : null}
			{badge.kind === 'none' ? null : (
				<SwatchGrid
					legend="Badge color"
					name="butt-cap-badge-color"
					columns={4}
					options={colorOptions({ colors: BADGE_COLORS })}
					value={badge.colorId}
					onChange={({ value }) => {
						setButtCap({ next: { ...buttCap, badge: { ...badge, colorId: value } } });
					}}
				/>
			)}
		</div>
	);
}
