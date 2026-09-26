import { useState } from 'react';

import { describeButtCap } from '@builder/buttcap/butt-cap-labels';
import { LINE_PATTERN_LABELS } from '@builder/decor/line-patterns';
import { describeGrip, describeOvergrip, describeTrim } from '@builder/grips/grip-labels';
import { findPrintPreset } from '@builder/prints/print-presets';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';
import { LOGO_COLOR_LABELS } from '@builder/ui/logo-labels';

import { Button } from '@components/Button/Button';
import { StepNav } from '@components/StepNav/StepNav';

import type {
	BuilderStep,
	BuilderTool,
	FrameOption,
	HandleOption,
} from '@builder/store/design-store';
import type { StepNavStep } from '@components/StepNav/StepNav';
import type { DesignDocument, PrintOverlay } from '@uniq/shared';

const printName = ({ print }: { print: PrintOverlay | null }): string => {
	if (print === null) {
		return '—';
	}
	if (print.source.kind === 'upload') {
		return print.source.name;
	}
	return findPrintPreset({ presetId: print.source.presetId })?.name ?? '—';
};

const describeObjects = ({ document }: { document: DesignDocument }): string => {
	const { lines } = document.overlays.frame;
	const shapes = document.layers.filter((layer) => layer.kind === 'shape').length;
	const stickers = document.layers.filter((layer) => layer.kind === 'sticker').length;

	const parts = [
		lines === null ? null : LINE_PATTERN_LABELS[lines.patternId],
		shapes === 0 ? null : `${String(shapes)} shape${shapes === 1 ? '' : 's'}`,
		stickers === 0 ? null : `${String(stickers)} sticker${stickers === 1 ? '' : 's'}`,
	].filter((part): part is string => part !== null);

	return parts.length === 0 ? '—' : parts.join(' · ');
};

const buildSteps = ({
	document,
}: {
	document: DesignDocument;
}): readonly StepNavStep<BuilderStep, FrameOption | HandleOption>[] => {
	const frame = document.zones.frame.fill;
	const { print } = document.overlays.frame;

	return [
		{
			id: 'frame',
			label: 'Frame',
			description: 'Head and shaft as one piece: color, print, lines, shapes, stickers',
			options: [
				{
					id: 'color',
					label: 'Color',
					meta: frame.kind === 'solid' ? frame.color : 'Gradient',
				},
				{ id: 'print', label: 'Print', meta: printName({ print }) },
				{ id: 'objects', label: 'Objects', meta: describeObjects({ document }) },
				{
					id: 'logo',
					label: 'HEAD logo',
					meta: `Required · ${LOGO_COLOR_LABELS[document.logo.color]}`,
				},
				{
					id: 'grommets',
					label: 'Grommets',
					meta: describeTrim({ trim: document.grommets }),
				},
			],
		},
		{
			id: 'handle',
			label: 'Handle',
			description: 'Grip, overgrip and finishing tape',
			options: [
				{ id: 'grip', label: 'Grip', meta: describeGrip({ grip: document.grip }) },
				{
					id: 'overgrip',
					label: 'Overgrip',
					meta: describeOvergrip({ grip: document.grip }),
				},
				{
					id: 'tape',
					label: 'Finishing tape',
					meta: describeTrim({ trim: document.finishingTape }),
				},
			],
		},
		{
			id: 'buttCap',
			label: 'Grip Cap',
			description: describeButtCap({ buttCap: document.buttCap }),
		},
	];
};

const HANDLE_OPTIONS: readonly HandleOption[] = ['grip', 'overgrip', 'tape'];
const FRAME_OPTIONS: readonly FrameOption[] = [
	'color',
	'print',
	'objects',
	'logo',
	'grommets',
];

const ACTIVE_OPTION: Readonly<
	Record<
		BuilderStep,
		(params: { tool: BuilderTool }) => FrameOption | HandleOption | undefined
	>
> = {
	frame: ({ tool }) => tool.frameOption,
	handle: ({ tool }) => tool.handleOption,
	buttCap: () => undefined,
};

export function StepsNav(): React.JSX.Element {
	const document = useDesignStore((state) => state.document);
	const tool = useDesignStore((state) => state.tool);
	const selectTool = useDesignStore((state) => state.selectTool);

	return (
		<StepNav
			label="Customization steps"
			steps={buildSteps({ document })}
			activeStep={tool.step}
			activeOption={ACTIVE_OPTION[tool.step]({ tool })}
			onSelect={({ step, option }) => {
				if (option === undefined) {
					selectTool({ tool: { step } });
					return;
				}
				const handleOption = HANDLE_OPTIONS.find((item) => item === option);
				const frameOption = FRAME_OPTIONS.find((item) => item === option);
				if (step === 'handle' && handleOption !== undefined) {
					selectTool({ tool: { step, handleOption } });
				} else if (frameOption !== undefined) {
					selectTool({ tool: { step, frameOption } });
				}
			}}
		/>
	);
}

export function CheckoutFooter(): React.JSX.Element {
	const [status, setStatus] = useState('');

	return (
		<>
			<Button
				variant="primary"
				className={styles.cartButton}
				onClick={() => {
					setStatus(
						'Checkout isn’t available yet. Your design is saved in this browser.',
					);
				}}
			>
				Proceed to checkout
			</Button>
			<p className={styles.cartStatus} role="status">
				{status}
			</p>
		</>
	);
}
