import { useState } from 'react';

import { TokenValue } from '@pages/design-system/components/TokenValue';
import styles from '@pages/design-system/DesignSystemPage.module.scss';

import { Button } from '@components/Button/Button';

import {
	CONTROL_TOKENS,
	FONT_SIZE_TOKENS,
	MOTION_TOKENS,
	RADIUS_TOKENS,
	SPACE_TOKENS,
} from '@styles/design-tokens';

import type { TokenEntry } from '@styles/design-tokens';

const DISPLAY_SIZES = new Set(['--font-size-6', '--font-size-5', '--font-size-4']);

function TokenCell({ token }: { token: TokenEntry }): React.JSX.Element {
	return (
		<span className={styles.tokenMeta}>
			<code className={styles.tokenName}>{token.name}</code>
			<span className={styles.tokenUsage}>{token.usage}</span>
		</span>
	);
}

export function TypographySection(): React.JSX.Element {
	return (
		<div className={styles.stack}>
			<div className={styles.fontPair}>
				<div className={styles.fontCard}>
					<p className={styles.fontCardLabel}>Display · Barlow Condensed 500/600</p>
					<p className={styles.fontDisplaySample}>Paint it your way</p>
					<p className={styles.tokenUsage}>
						Headings and caps section labels only. Never values, inputs or body text.
					</p>
				</div>
				<div className={styles.fontCard}>
					<p className={styles.fontCardLabel}>Base · Instrument Sans 400–700</p>
					<p className={styles.fontBaseSample}>
						Pick a zone, set the finish, then drag the racket to check the light.
					</p>
					<p className={styles.tabularSample}>
						<span>#1F7A3D</span>
						<span>45°</span>
						<span>100%</span>
						<span>0.35</span>
					</p>
				</div>
			</div>
			<ul className={styles.scaleList}>
				{FONT_SIZE_TOKENS.map((token) => (
					<li key={token.name} className={styles.scaleRow}>
						<TokenCell token={token} />
						<TokenValue name={token.name} className={styles.tokenValue} />
						<span
							className={
								DISPLAY_SIZES.has(token.name) ? styles.scaleDisplay : styles.scaleBase
							}
							style={{ fontSize: `var(${token.name})` }}
						>
							{DISPLAY_SIZES.has(token.name) ? 'Racket studio' : 'Zone · Frame · 72%'}
						</span>
					</li>
				))}
			</ul>
			<p className={styles.capsSample}>Caps label · section headers in panels</p>
		</div>
	);
}

export function SpacingSection(): React.JSX.Element {
	return (
		<ul className={styles.scaleList}>
			{SPACE_TOKENS.map((token) => (
				<li key={token.name} className={styles.scaleRow}>
					<TokenCell token={token} />
					<TokenValue name={token.name} className={styles.tokenValue} />
					<span className={styles.spaceBar} style={{ width: `var(${token.name})` }} />
				</li>
			))}
		</ul>
	);
}

export function ShapeSection(): React.JSX.Element {
	return (
		<div className={styles.stack}>
			<div className={styles.shapeRow}>
				{RADIUS_TOKENS.map((token) => (
					<div key={token.name} className={styles.shapeItem}>
						<span
							className={styles.shapeBox}
							style={{ borderRadius: `var(${token.name})` }}
						/>
						<code className={styles.tokenName}>{token.name}</code>
						<TokenValue name={token.name} className={styles.tokenValue} />
					</div>
				))}
			</div>
			<ul className={styles.scaleList}>
				{CONTROL_TOKENS.map((token) => (
					<li key={token.name} className={styles.scaleRow}>
						<TokenCell token={token} />
						<TokenValue name={token.name} className={styles.tokenValue} />
						<span
							className={styles.controlBar}
							style={{ height: `var(${token.name})` }}
						/>
					</li>
				))}
			</ul>
		</div>
	);
}

export function ElevationSection(): React.JSX.Element {
	return (
		<div className={styles.elevationRow}>
			<div className={styles.elevationSunken}>
				<code className={styles.tokenName}>Sunken</code>
				<span className={styles.tokenUsage}>--color-surface-sunken + strong border</span>
			</div>
			<div className={styles.elevationFlat}>
				<code className={styles.tokenName}>Flat</code>
				<span className={styles.tokenUsage}>--color-surface + hairline</span>
			</div>
			<div className={styles.elevationFloat}>
				<code className={styles.tokenName}>Float</code>
				<span className={styles.tokenUsage}>+ --shadow-float, over the scene only</span>
			</div>
		</div>
	);
}

const ENTER_ANIMATIONS = [
	{ id: 'rise', label: 'Rise', usage: 'Tool content, list items, messages' },
	{ id: 'pop', label: 'Pop', usage: 'Menus and dropdown lists' },
	{ id: 'slide', label: 'Slide', usage: 'Side panels opening' },
	{ id: 'fade', label: 'Fade', usage: 'Changing values' },
] as const;

function EnterDemo(): React.JSX.Element {
	const [round, setRound] = useState(0);

	return (
		<div className={styles.stack}>
			<div className={styles.enterRow}>
				{ENTER_ANIMATIONS.map((animation) => (
					<div key={`${animation.id}-${String(round)}`} className={styles.enterItem}>
						<span className={styles.enterBox} data-animation={animation.id} />
						<code className={styles.tokenName}>{animation.label}</code>
						<span className={styles.tokenUsage}>{animation.usage}</span>
					</div>
				))}
			</div>
			<Button
				size="sm"
				onClick={() => {
					setRound(round + 1);
				}}
			>
				Replay
			</Button>
		</div>
	);
}

export function MotionSection(): React.JSX.Element {
	return (
		<div className={styles.stack}>
			<EnterDemo />
			<MotionTokens />
		</div>
	);
}

function MotionTokens(): React.JSX.Element {
	return (
		<ul className={styles.scaleList}>
			{MOTION_TOKENS.map((token) => (
				<li key={token.name} className={styles.scaleRow}>
					<TokenCell token={token} />
					<TokenValue name={token.name} className={styles.tokenValue} />
					{!token.name.startsWith('--duration') ? (
						<span className={styles.tokenUsage}>Motion is off with reduced motion</span>
					) : (
						<span className={styles.motionTrack}>
							<span
								className={styles.motionDot}
								style={{ transitionDuration: `var(${token.name})` }}
							/>
						</span>
					)}
				</li>
			))}
		</ul>
	);
}
