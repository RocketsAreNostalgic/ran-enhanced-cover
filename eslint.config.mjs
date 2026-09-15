import ranWordPress from '@rocketsarenostalgic/quality-config/eslint/wordpress';

export default [
	{
		ignores: [
			'build/**',
			'node_modules/**',
			'vendor/**',
			'.codex/**',
			'.agents/**',
		],
	},
	...ranWordPress,
	{
		files: ['blocks/**/*.js'],
		settings: {
			'import/core-modules': [
				'@wordpress/block-editor',
				'@wordpress/blocks',
				'@wordpress/components',
				'@wordpress/data',
				'@wordpress/element',
				'@wordpress/i18n',
			],
		},
		rules: {
			'@wordpress/no-unsafe-wp-apis': 'off',
		},
	},
	{
		files: ['webpack.config.js', 'tests/browser/**/*.js'],
		languageOptions: {
			sourceType: 'commonjs',
			globals: {
				__dirname: 'readonly',
				module: 'readonly',
				process: 'readonly',
				require: 'readonly',
			},
		},
	},
];
