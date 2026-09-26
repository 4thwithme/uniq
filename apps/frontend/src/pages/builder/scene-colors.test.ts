import { readSceneColors } from '@pages/builder/scene-colors';

describe('readSceneColors', () => {
	afterEach(() => {
		document.documentElement.style.cssText = '';
	});

	it('reads the scene CSS variables', () => {
		document.documentElement.style.setProperty('--scene-bg', ' #010203 ');
		document.documentElement.style.setProperty('--scene-grid-cell', '#040506');
		document.documentElement.style.setProperty('--scene-grid-section', '#070809');

		expect(readSceneColors({ theme: 'dark', language: 'uniq' })).toEqual({
			background: '#010203',
			gridCell: '#040506',
			gridSection: '#070809',
		});
	});

	it.each([
		['uniq', 'dark'],
		['uniq', 'light'],
		['head', 'dark'],
		['head', 'light'],
		['velocity', 'dark'],
		['velocity', 'light'],
	] as const)('falls back per language and theme (%s %s)', (language, theme) => {
		const colors = readSceneColors({ theme, language });

		expect(colors.background).toMatch(/^#[0-9a-f]{6}$/u);
		expect(
			readSceneColors({ theme: theme === 'dark' ? 'light' : 'dark', language }),
		).not.toEqual(colors);
	});
});
