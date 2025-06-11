import { defineSemanticTokens } from '@pandacss/dev';
import { colors } from './colors';
import { shadows } from './shadows';
import { borders } from './borders';

export const semanticTokens = defineSemanticTokens({
	colors,
	shadows,
	borders,
});
