import reactThree from '@react-three/eslint-plugin';
import eslintPluginImport from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import requireObjectParams from './eslint-rules/require-object-params.cjs';

const internalAliases = [
	'@app',
	'@pages',
	'@builder',
	'@components',
	'@hooks',
	'@store',
	'@styles',
	'@assets',
	'@app-types',
	'@tests',
];

export default tseslint.config(
	{
		ignores: [
			'dist/**',
			'coverage/**',
			'eslint-rules/**',
			'eslint.config.mjs',
			'**/*.module.scss.d.ts',
		],
	},
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,
	eslintPluginImport.flatConfigs.recommended,
	eslintPluginImport.flatConfigs.typescript,
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	reactHooks.configs.flat['recommended-latest'],
	jsxA11y.flatConfigs.strict,
	reactRefresh.configs.vite,
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'module',
			globals: { ...globals.browser },
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			react: { version: 'detect' },
			'import/resolver': {
				typescript: { alwaysTryTypes: true, project: ['./tsconfig.app.json', './tsconfig.test.json'] },
				node: true,
			},
		},
		plugins: {
			'@react-three': reactThree,
			'custom-rules': { rules: { 'require-object-params': requireObjectParams } },
		},
		rules: {
			'custom-rules/require-object-params': 'error',
			'@react-three/no-clone-in-loop': 'error',
			'@react-three/no-new-in-loop': 'error',

			'no-console': 'error',
			'no-debugger': 'error',
			'no-alert': 'error',
			eqeqeq: ['error', 'always'],
			curly: ['error', 'all'],
			'prefer-const': 'error',
			'no-param-reassign': ['error', { props: true }],
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['.*'],
							message: 'Do not use relative imports, use @aliases instead',
						},
						{
							group: ['@mui/*', 'tailwindcss', '@reduxjs/*'],
							message: 'Banned library, see .claude/rules/frontend/react.md',
						},
					],
				},
			],

			'@typescript-eslint/explicit-module-boundary-types': 'error',
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{ allowExpressions: true, allowTypedFunctionExpressions: true },
			],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ prefer: 'type-imports', fixStyle: 'separate-type-imports' },
			],
			'@typescript-eslint/consistent-type-exports': 'error',
			'@typescript-eslint/no-import-type-side-effects': 'error',
			'@typescript-eslint/switch-exhaustiveness-check': 'error',
			'@typescript-eslint/strict-boolean-expressions': [
				'error',
				{ allowString: false, allowNumber: false, allowNullableObject: true },
			],
			'@typescript-eslint/prefer-readonly': 'error',
			'@typescript-eslint/promise-function-async': 'error',
			'@typescript-eslint/require-array-sort-compare': 'error',
			'@typescript-eslint/no-magic-numbers': 'off',
			'@typescript-eslint/naming-convention': [
				'error',
				{ selector: 'typeLike', format: ['PascalCase'] },
			],

			'react/jsx-no-useless-fragment': 'error',
			'react/no-array-index-key': 'error',
			'react/self-closing-comp': 'error',
			'react/jsx-boolean-value': ['error', 'never'],
			'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
			'react/jsx-no-leaked-render': 'error',
			'react/no-unstable-nested-components': 'error',
			'react/function-component-definition': [
				'error',
				{ namedComponents: 'function-declaration', unnamedComponents: 'arrow-function' },
			],
			'react/hook-use-state': 'error',
			'react/button-has-type': 'error',
			'react/jsx-pascal-case': 'error',
			'react/no-unknown-property': 'error',
			'react/prop-types': 'off',
			'react-refresh/only-export-components': ['error', { allowConstantExport: true }],

			'import/no-default-export': 'error',
			'import/no-duplicates': 'error',
			'import/no-cycle': 'error',
			'import/no-useless-path-segments': 'error',
			'import/newline-after-import': 'error',
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal', 'object', 'type'],
					pathGroups: internalAliases.map((alias) => ({
						pattern: `${alias}/**`,
						group: 'internal',
						position: 'before',
					})),
					pathGroupsExcludedImportTypes: ['type'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],
		},
	},
	{
		files: ['src/builder/{scene,models,materials}/**/*.tsx'],
		rules: {
			'react/no-unknown-property': 'off',
		},
	},
	{
		files: ['vite.config.ts', 'scripts/**/*.ts'],
		languageOptions: { globals: { ...globals.node } },
		rules: {
			'import/no-default-export': 'off',
			'no-restricted-imports': 'off',
		},
	},
	{
		files: ['**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
		languageOptions: { globals: { ...globals.vitest } },
		rules: {
			'custom-rules/require-object-params': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'react-refresh/only-export-components': 'off',
		},
	},
);
