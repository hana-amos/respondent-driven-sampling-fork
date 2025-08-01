/** @type {import('prettier').Config} */
module.exports = {
	endOfLine: 'lf',
	semi: true,
	useTabs: false,
	singleQuote: true,
	arrowParens: 'avoid',
	tabWidth: 4,
	trailingComma: 'none',
	useTabs: true,
	// Since prettier 3.0, manually specifying plugins is required
	plugins: [require.resolve('@ianvs/prettier-plugin-sort-imports')],
	importOrder: [
		'^(react/(.*)$)|^(react$)',
		'',
		'<THIRD_PARTY_MODULES>',
		'',
		'^types$',
		'^@/types/(.*)$',
		'^@/assets/(.*)$',
		'^@/config/(.*)$',
		'^@/lib/(.*)$',
		'^@/hooks/(.*)$',
		'^@/components/(.*)$',
		'^@/styles/(.*)$',
		'^@/pages/(.*)$',
		'',
		'^[./]'
	],
	importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
	importOrderTypeScriptVersion: '5.0.0'
};
