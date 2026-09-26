import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const fromSrc = ({ dir }: { dir: string }): string =>
	fileURLToPath(new URL(`./src/${dir}`, import.meta.url));

export default defineConfig({
	base: process.env['GITHUB_PAGES_BASE'] ?? '/',
	plugins: [react()],
	resolve: {
		alias: {
			'@app': fromSrc({ dir: 'app' }),
			'@pages': fromSrc({ dir: 'pages' }),
			'@builder': fromSrc({ dir: 'builder' }),
			'@components': fromSrc({ dir: 'components' }),
			'@hooks': fromSrc({ dir: 'hooks' }),
			'@store': fromSrc({ dir: 'store' }),
			'@styles': fromSrc({ dir: 'styles' }),
			'@assets': fromSrc({ dir: 'assets' }),
			'@app-types': fromSrc({ dir: 'types' }),
			'@tests': fileURLToPath(new URL('./tests', import.meta.url)),
			'@uniq/shared': fileURLToPath(
				new URL('../../packages/shared/src/index.ts', import.meta.url),
			),
		},
	},
	server: {
		port: 5173,
		strictPort: true,
	},
	build: {
		target: 'es2023',
		sourcemap: true,
		chunkSizeWarningLimit: 1024,
	},
	test: {
		globals: true,
		restoreMocks: true,
		environment: 'jsdom',
		setupFiles: ['./tests/setup-tests.ts'],
		include: ['src/**/*.test.{ts,tsx}'],
		css: { modules: { classNameStrategy: 'non-scoped' } },
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{ts,tsx}'],
			exclude: [
				'src/main.tsx',
				'src/**/*.test.{ts,tsx}',
				'src/vite-env.d.ts',
				'src/builder/scene/BuilderCanvas.tsx',
			],
			thresholds: { branches: 95, functions: 95, lines: 95, statements: 95 },
		},
	},
});
