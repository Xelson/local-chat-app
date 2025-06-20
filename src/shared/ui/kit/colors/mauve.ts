import { defineSemanticTokens, defineTokens } from '@pandacss/dev';

const tokens = defineTokens.colors({
	light: {
		'1': { value: '#fdfcfd' },
		'2': { value: '#faf9fb' },
		'3': { value: '#f2eff3' },
		'4': { value: '#eae7ec' },
		'5': { value: '#e3dfe6' },
		'6': { value: '#dbd8e0' },
		'7': { value: '#d0cdd7' },
		'8': { value: '#bcbac7' },
		'9': { value: '#8e8c99' },
		'10': { value: '#84828e' },
		'11': { value: '#65636d' },
		'12': { value: '#211f26' },
		'a1': { value: '#55005503' },
		'a2': { value: '#2b005506' },
		'a3': { value: '#30004010' },
		'a4': { value: '#20003618' },
		'a5': { value: '#20003820' },
		'a6': { value: '#14003527' },
		'a7': { value: '#10003332' },
		'a8': { value: '#08003145' },
		'a9': { value: '#05001d73' },
		'a10': { value: '#0500197d' },
		'a11': { value: '#0400119c' },
		'a12': { value: '#020008e0' },
	},
	dark: {
		'1': { value: '#121113' },
		'2': { value: '#1a191b' },
		'3': { value: '#232225' },
		'4': { value: '#2b292d' },
		'5': { value: '#323035' },
		'6': { value: '#3c393f' },
		'7': { value: '#49474e' },
		'8': { value: '#625f69' },
		'9': { value: '#6f6d78' },
		'10': { value: '#7c7a85' },
		'11': { value: '#b5b2bc' },
		'12': { value: '#eeeef0' },
		'a1': { value: '#00000000' },
		'a2': { value: '#f5f4f609' },
		'a3': { value: '#ebeaf814' },
		'a4': { value: '#eee5f81d' },
		'a5': { value: '#efe6fe25' },
		'a6': { value: '#f1e6fd30' },
		'a7': { value: '#eee9ff40' },
		'a8': { value: '#eee7ff5d' },
		'a9': { value: '#eae6fd6e' },
		'a10': { value: '#ece9fd7c' },
		'a11': { value: '#f5f1ffb7' },
		'a12': { value: '#fdfdffef' },
	},
});
const semanticTokens = defineSemanticTokens.colors({
	'1': { value: { _light: '{colors.mauve.light.1}', _dark: '{colors.mauve.dark.1}' } },
	'2': { value: { _light: '{colors.mauve.light.2}', _dark: '{colors.mauve.dark.2}' } },
	'3': { value: { _light: '{colors.mauve.light.3}', _dark: '{colors.mauve.dark.3}' } },
	'4': { value: { _light: '{colors.mauve.light.4}', _dark: '{colors.mauve.dark.4}' } },
	'5': { value: { _light: '{colors.mauve.light.5}', _dark: '{colors.mauve.dark.5}' } },
	'6': { value: { _light: '{colors.mauve.light.6}', _dark: '{colors.mauve.dark.6}' } },
	'7': { value: { _light: '{colors.mauve.light.7}', _dark: '{colors.mauve.dark.7}' } },
	'8': { value: { _light: '{colors.mauve.light.8}', _dark: '{colors.mauve.dark.8}' } },
	'9': { value: { _light: '{colors.mauve.light.9}', _dark: '{colors.mauve.dark.9}' } },
	'10': { value: { _light: '{colors.mauve.light.10}', _dark: '{colors.mauve.dark.10}' } },
	'11': { value: { _light: '{colors.mauve.light.11}', _dark: '{colors.mauve.dark.11}' } },
	'12': { value: { _light: '{colors.mauve.light.12}', _dark: '{colors.mauve.dark.12}' } },
	'a1': { value: { _light: '{colors.mauve.light.a1}', _dark: '{colors.mauve.dark.a1}' } },
	'a2': { value: { _light: '{colors.mauve.light.a2}', _dark: '{colors.mauve.dark.a2}' } },
	'a3': { value: { _light: '{colors.mauve.light.a3}', _dark: '{colors.mauve.dark.a3}' } },
	'a4': { value: { _light: '{colors.mauve.light.a4}', _dark: '{colors.mauve.dark.a4}' } },
	'a5': { value: { _light: '{colors.mauve.light.a5}', _dark: '{colors.mauve.dark.a5}' } },
	'a6': { value: { _light: '{colors.mauve.light.a6}', _dark: '{colors.mauve.dark.a6}' } },
	'a7': { value: { _light: '{colors.mauve.light.a7}', _dark: '{colors.mauve.dark.a7}' } },
	'a8': { value: { _light: '{colors.mauve.light.a8}', _dark: '{colors.mauve.dark.a8}' } },
	'a9': { value: { _light: '{colors.mauve.light.a9}', _dark: '{colors.mauve.dark.a9}' } },
	'a10': { value: { _light: '{colors.mauve.light.a10}', _dark: '{colors.mauve.dark.a10}' } },
	'a11': { value: { _light: '{colors.mauve.light.a11}', _dark: '{colors.mauve.dark.a11}' } },
	'a12': { value: { _light: '{colors.mauve.light.a12}', _dark: '{colors.mauve.dark.a12}' } },
	'default': { value: { _light: '{colors.mauve.light.9}', _dark: '{colors.mauve.dark.9}' } },
	'emphasized': { value: { _light: '{colors.mauve.light.10}', _dark: '{colors.mauve.dark.10}' } },
	'fg': { value: { _light: 'white', _dark: 'white' } },
	'text': { value: { _light: '{colors.mauve.light.12}', _dark: '{colors.mauve.dark.12}' } },
});

export default {
	name: 'mauve',
	tokens,
	semanticTokens,
};
