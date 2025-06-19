import { defineConfig } from '@pandacss/dev';
import { createPreset } from '~/shared/ui/kit';
import grayColor from '~/shared/ui/kit/colors/slate';
import accentColor from '~/shared/ui/kit/colors/purple';

export default defineConfig({
	preflight: true,
	include: ['./src/**/*.{js,jsx,ts,tsx}'],
	presets: [createPreset({ accentColor, grayColor, radius: 'xl' })],
	jsxFramework: 'react',
	theme: {
		extend: {},
	},
	outdir: 'styled-system',
});
