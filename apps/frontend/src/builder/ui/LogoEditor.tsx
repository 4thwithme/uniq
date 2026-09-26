import { LOGO_COLORS, LOGO_SIZE_RANGE } from '@uniq/shared';

import { HEAD_LOGO } from '@builder/decor/brand-logo';
import { setLogoCommand } from '@builder/design/design-commands';
import { useDesignStore } from '@builder/store/design-store';
import styles from '@builder/ui/BuilderPanel.module.scss';
import { LOGO_COLOR_LABELS } from '@builder/ui/logo-labels';

import { SegmentedControl } from '@components/SegmentedControl/SegmentedControl';
import { Slider } from '@components/Slider/Slider';

const PERCENT = 100;

export function LogoEditor(): React.JSX.Element {
	const logo = useDesignStore((state) => state.document.logo);
	const execute = useDesignStore((state) => state.execute);

	return (
		<div className={styles.section}>
			<svg
				className={styles.logoPreview}
				viewBox={`0 0 ${String(HEAD_LOGO.width)} ${String(HEAD_LOGO.height)}`}
				role="img"
				aria-label="HEAD logo"
			>
				<path d={HEAD_LOGO.d} fill="currentColor" />
			</svg>
			<p className={styles.notice} role="status">
				Required on every racket. It sits on the inside of the head at 8 o’clock and
				always stays on top: nothing can cover it.
			</p>
			<SegmentedControl
				legend="Logo color"
				name="logo-color"
				options={LOGO_COLORS.map((color) => ({
					value: color,
					label: LOGO_COLOR_LABELS[color],
				}))}
				value={logo.color}
				onChange={({ value }) => {
					execute({ command: setLogoCommand({ logo: { ...logo, color: value } }) });
				}}
			/>
			<p className={styles.hint}>
				Auto picks black or white for contrast with the frame.
			</p>
			<Slider
				label="Logo size"
				value={Math.round(logo.size * PERCENT)}
				min={LOGO_SIZE_RANGE.min * PERCENT}
				max={LOGO_SIZE_RANGE.max * PERCENT}
				unit="%"
				onChange={({ value }) => {
					execute({
						command: setLogoCommand({
							logo: { ...logo, size: value / PERCENT },
							mergeKey: 'logo-size',
						}),
					});
				}}
			/>
		</div>
	);
}
