export interface TokenEntry {
	name: `--${string}`;
	usage: string;
}

export interface TokenGroup {
	title: string;
	tokens: readonly TokenEntry[];
}

export const COLOR_TOKEN_GROUPS: readonly TokenGroup[] = [
	{
		title: 'Surfaces',
		tokens: [
			{ name: '--color-bg', usage: 'App background behind everything' },
			{ name: '--color-surface', usage: 'Panels, islands, secondary buttons' },
			{
				name: '--color-surface-raised',
				usage: 'Hover and selected rows inside a surface',
			},
			{ name: '--color-surface-sunken', usage: 'Inputs, tracks, wells' },
			{ name: '--color-border', usage: 'Hairlines between and around surfaces' },
			{ name: '--color-border-strong', usage: 'Control edges (3:1 on surface)' },
		],
	},
	{
		title: 'Text',
		tokens: [
			{ name: '--color-text', usage: 'Primary text and values' },
			{ name: '--color-text-muted', usage: 'Labels, secondary text' },
			{ name: '--color-text-subtle', usage: 'Placeholders, disabled hints' },
		],
	},
	{
		title: 'Accent (grass green)',
		tokens: [
			{ name: '--color-accent', usage: 'The one primary action, active slider' },
			{ name: '--color-accent-hover', usage: 'Hover of the primary action' },
			{ name: '--color-accent-subtle', usage: 'Pressed or selected background' },
			{ name: '--color-accent-text', usage: 'Green text on surfaces' },
			{ name: '--color-on-accent', usage: 'Text on the accent fill' },
			{ name: '--color-focus', usage: 'Focus ring' },
		],
	},
	{
		title: 'Status',
		tokens: [
			{ name: '--color-danger', usage: 'Errors, destructive actions' },
			{ name: '--color-warning', usage: 'Warnings' },
			{ name: '--color-success', usage: 'Success (teal, never brand green)' },
		],
	},
	{
		title: 'Scene (hex, read by three.js)',
		tokens: [
			{ name: '--scene-bg', usage: '3D scene background' },
			{ name: '--scene-grid-cell', usage: 'Floor grid small cells' },
			{ name: '--scene-grid-section', usage: 'Floor grid section lines' },
		],
	},
];

export const SCENE_TOKENS = COLOR_TOKEN_GROUPS.flatMap((group) => group.tokens).filter(
	(token) => token.name.startsWith('--scene-'),
);

export const THEMED_TOKENS: readonly TokenEntry[] = [
	...COLOR_TOKEN_GROUPS.flatMap((group) => group.tokens),
	{ name: '--shadow-float', usage: 'The only shadow: floating layers over the scene' },
];

export const FONT_SIZE_TOKENS: readonly TokenEntry[] = [
	{ name: '--font-size-6', usage: 'Display, page titles' },
	{ name: '--font-size-5', usage: 'Display, section titles' },
	{ name: '--font-size-4', usage: 'Display, sub-sections' },
	{ name: '--font-size-3', usage: 'Large body, island title' },
	{ name: '--font-size-2', usage: 'Body' },
	{ name: '--font-size-1', usage: 'Controls, labels, dense UI' },
	{ name: '--font-size-0', usage: 'Captions, badges, small buttons' },
];

export const SPACE_TOKENS: readonly TokenEntry[] = [
	{ name: '--space-1', usage: 'Icon to text' },
	{ name: '--space-2', usage: 'Inside controls, tight groups' },
	{ name: '--space-3', usage: 'Control padding' },
	{ name: '--space-4', usage: 'Panel padding, floating gutter' },
	{ name: '--space-5', usage: 'Between groups in a panel' },
	{ name: '--space-6', usage: 'Between panel sections' },
	{ name: '--space-7', usage: 'Page sections' },
	{ name: '--space-8', usage: 'Page margins on wide screens' },
];

export const RADIUS_TOKENS: readonly TokenEntry[] = [
	{ name: '--radius-0', usage: 'Scene-edge surfaces' },
	{ name: '--radius-1', usage: 'Controls, swatches, badges' },
	{ name: '--radius-2', usage: 'Panels, islands, tracks' },
];

export const CONTROL_TOKENS: readonly TokenEntry[] = [
	{ name: '--control-height-sm', usage: 'Small buttons, toolbar' },
	{ name: '--control-height-md', usage: 'Default controls' },
	{ name: '--control-height-lg', usage: 'Rare, touch-first actions' },
	{ name: '--border-width', usage: 'Every hairline' },
];

export const TYPE_ROLE_TOKENS: readonly TokenEntry[] = [
	{ name: '--font-family-display', usage: 'Headings' },
	{ name: '--font-family-base', usage: 'Body and controls' },
	{ name: '--font-family-label', usage: 'Panel and group labels' },
	{ name: '--font-family-numeric', usage: 'Values: hex, angles, %' },
	{ name: '--font-weight-label', usage: 'Label weight' },
	{ name: '--font-weight-control', usage: 'Button and select weight' },
	{ name: '--tracking-display', usage: 'Heading letter-spacing' },
	{ name: '--tracking-label', usage: 'Label letter-spacing' },
	{ name: '--text-transform-label', usage: 'Uppercase or sentence case labels' },
];

export const MOTION_TOKENS: readonly TokenEntry[] = [
	{ name: '--duration-instant', usage: 'Press down' },
	{ name: '--duration-fast', usage: 'Hover, color changes, content swaps' },
	{ name: '--duration-base', usage: 'Menus, small reveals, theme crossfade' },
	{ name: '--duration-slow', usage: 'Panels sliding in' },
	{ name: '--ease-out', usage: 'Default easing' },
	{ name: '--ease-spring', usage: 'Small overshoot: switch thumb, slider thumb' },
	{ name: '--motion-distance', usage: 'Rise / slide travel' },
	{ name: '--motion-scale-press', usage: 'Scale while pressed' },
	{ name: '--motion-scale-enter', usage: 'Start scale of pop-in' },
	{ name: '--motion-stagger', usage: 'Delay between list items' },
];

export const ALL_TOKENS: readonly TokenEntry[] = [
	...THEMED_TOKENS,
	...FONT_SIZE_TOKENS,
	...SPACE_TOKENS,
	...RADIUS_TOKENS,
	...CONTROL_TOKENS,
	...TYPE_ROLE_TOKENS,
	...MOTION_TOKENS,
];
