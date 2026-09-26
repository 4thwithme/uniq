/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ALL_TOKENS, SCENE_TOKENS, THEMED_TOKENS } from '@styles/design-tokens';

const srcDir = join(process.cwd(), 'src');

const stylesheets: Record<string, string> = Object.fromEntries(
	readdirSync(srcDir, { recursive: true, encoding: 'utf8' })
		.filter((path) => path.endsWith('.scss'))
		.map((path) => [path, readFileSync(join(srcDir, path), 'utf8')]),
);

const tokensSource = stylesheets[join('styles', 'tokens.scss')] ?? '';

const LANGUAGES = ['head', 'velocity'] as const;

const languageSource = ({ language }: { language: string }): string =>
	stylesheets[join('styles', 'languages', `_${language}.scss`)] ?? '';

const tokenSources = [
	tokensSource,
	...LANGUAGES.map((language) => languageSource({ language })),
];

const blockFor = ({ source, selector }: { source: string; selector: string }): string => {
	const start = source.indexOf(selector);
	if (start === -1) {
		return '';
	}
	const open = source.indexOf('{', start);
	const close = source.indexOf('}', open);
	return source.slice(open, close);
};

const themeBlocks: readonly { label: string; block: string }[] = [
	{
		label: 'uniq dark',
		block: blockFor({ source: tokensSource, selector: ":root,\n[data-theme='dark']" }),
	},
	{
		label: 'uniq light',
		block: blockFor({ source: tokensSource, selector: "[data-theme='light'] {" }),
	},
	...LANGUAGES.flatMap((language) => [
		{
			label: `${language} dark`,
			block: blockFor({
				source: languageSource({ language }),
				selector: `[data-language='${language}'],\n[data-language='${language}'] [data-theme='dark']`,
			}),
		},
		{
			label: `${language} light`,
			block: blockFor({
				source: languageSource({ language }),
				selector: `[data-language='${language}'][data-theme='light'],\n[data-language='${language}'] [data-theme='light']`,
			}),
		},
	]),
];

const definedNames = new Set(
	tokenSources.flatMap((source) =>
		[...source.matchAll(/(--[a-z0-9-]+):/gu)].map((match) => match[1]),
	),
);

const isTokenFile = ({ path }: { path: string }): boolean =>
	path === join('styles', 'tokens.scss') || path.startsWith(join('styles', 'languages'));

describe('design tokens', () => {
	it('defines every catalogued token', () => {
		const missing = ALL_TOKENS.filter((token) => !definedNames.has(token.name));

		expect(missing).toEqual([]);
	});

	it('finds a dark and light block for every language', () => {
		expect(themeBlocks).toHaveLength(2 + LANGUAGES.length * 2);
		themeBlocks.forEach(({ block }) => {
			expect(block.length).toBeGreaterThan(100);
		});
	});

	it('defines every themed token in every language and theme', () => {
		const missing = themeBlocks.flatMap(({ label, block }) =>
			THEMED_TOKENS.filter((token) => !block.includes(`${token.name}:`)).map(
				(token) => `${label} ${token.name}`,
			),
		);

		expect(missing).toEqual([]);
	});

	it('keeps scene tokens as hex so three.js can parse them', () => {
		const values = SCENE_TOKENS.flatMap((token) =>
			themeBlocks.map(
				({ block }) =>
					new RegExp(`${token.name}:\\s*([^;]+);`, 'u').exec(block)?.[1] ?? '',
			),
		);

		expect(values).toHaveLength(SCENE_TOKENS.length * themeBlocks.length);
		values.forEach((value) => {
			expect(value).toMatch(/^#[0-9a-f]{6}$/u);
		});
	});

	it('only uses custom properties defined in the token files or the same stylesheet', () => {
		const undefinedUses = Object.entries(stylesheets).flatMap(([path, source]) => {
			const localNames = new Set(
				[...source.matchAll(/(--[a-z0-9-]+):/gu)].map((match) => match[1]),
			);
			return [...source.matchAll(/var\((--[a-z0-9-]+)/gu)]
				.map((match) => match[1])
				.filter(
					(name) =>
						name !== undefined && !definedNames.has(name) && !localNames.has(name),
				)
				.map((name) => `${path}: ${String(name)}`);
		});

		expect(Object.keys(stylesheets).length).toBeGreaterThan(5);
		expect(undefinedUses).toEqual([]);
	});

	it('uses no literal colors outside the token files', () => {
		const literals = Object.entries(stylesheets)
			.filter(([path]) => !isTokenFile({ path }))
			.flatMap(([path, source]) =>
				[...source.matchAll(/#[0-9a-f]{3,8}\b|rgba?\(|oklch\(|hsla?\(/giu)].map(
					(match) => `${path}: ${match[0]}`,
				),
			);

		expect(literals).toEqual([]);
	});
});
