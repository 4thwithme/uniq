import { MAX_GRADIENT_STOPS, MIN_GRADIENT_STOPS } from '@uniq/shared';

import {
	addGradientStopCommand,
	removeGradientStopCommand,
	setGradientAngleCommand,
	setGradientStopCommand,
} from '@builder/design/design-commands';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';

import { Button } from '@components/Button/Button';
import { ColorField } from '@components/ColorField/ColorField';
import { IconButton } from '@components/IconButton/IconButton';
import { CloseIcon, PlusIcon } from '@components/icons/Icons';
import { Slider } from '@components/Slider/Slider';

import type { GradientFill, ZoneId } from '@uniq/shared';

interface GradientEditorProps {
	zoneId: ZoneId;
	fill: GradientFill;
}

const PERCENT = 100;

export function GradientEditor({ zoneId, fill }: GradientEditorProps): React.JSX.Element {
	const execute = useDesignStore((state) => state.execute);

	return (
		<div className={styles.section}>
			<Slider
				label="Angle"
				value={fill.angle}
				min={0}
				max={359}
				unit="°"
				onChange={({ value }) => {
					execute({ command: setGradientAngleCommand({ zoneId, angle: value }) });
				}}
			/>
			<ul className={styles.stops} aria-label="Gradient stops">
				{fill.stops.map((stop, index) => {
					const stopName = `Stop ${String(index + 1)}`;
					return (
						<li
							key={`${String(index)}-${String(fill.stops.length)}`}
							className={styles.stop}
						>
							<div className={styles.stopHeader}>
								<p className={styles.stopTitle}>{stopName}</p>
								<IconButton
									label={`Remove stop ${String(index + 1)}`}
									size="sm"
									disabled={fill.stops.length <= MIN_GRADIENT_STOPS}
									onClick={() => {
										execute({ command: removeGradientStopCommand({ zoneId, index }) });
									}}
								>
									<CloseIcon />
								</IconButton>
							</div>
							<ColorField
								label={`${stopName} color`}
								value={stop.color}
								onChange={({ value }) => {
									execute({
										command: setGradientStopCommand({ zoneId, index, color: value }),
									});
								}}
							/>
							<Slider
								label={`${stopName} position`}
								value={Math.round(stop.offset * PERCENT)}
								min={0}
								max={PERCENT}
								unit="%"
								onChange={({ value }) => {
									execute({
										command: setGradientStopCommand({
											zoneId,
											index,
											offset: value / PERCENT,
										}),
									});
								}}
							/>
						</li>
					);
				})}
			</ul>
			<Button
				size="sm"
				className={styles.addStop}
				disabled={fill.stops.length >= MAX_GRADIENT_STOPS}
				onClick={() => {
					execute({ command: addGradientStopCommand({ zoneId }) });
				}}
			>
				<PlusIcon aria-hidden="true" width={14} height={14} />
				Add stop
			</Button>
		</div>
	);
}
