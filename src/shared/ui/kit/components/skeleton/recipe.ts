import { defineRecipe } from '@pandacss/dev';

export const skeleton = defineRecipe({
	className: 'skeleton',
	base: {
		'animation': 'skeleton-pulse',
		'backgroundClip': 'padding-box',
		'backgroundColor': 'gray.3',
		'borderRadius': '0.5rem',
		'color': 'transparent',
		'cursor': 'default',
		'pointerEvents': 'none',
		'userSelect': 'none',
		'&::before, &::after, *': {
			visibility: 'hidden',
		},
	},
});
