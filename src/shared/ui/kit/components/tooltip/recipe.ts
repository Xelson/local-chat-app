import { tooltipAnatomy } from '@ark-ui/react';
import { defineSlotRecipe } from '@pandacss/dev';

export const tooltip = defineSlotRecipe({
	className: 'tooltip',
	slots: tooltipAnatomy.keys(),
	jsx: ['Tooltip.Composed'],
	base: {
		content: {
			background: 'gray.a12',
			borderRadius: 'l2',
			boxShadow: 'sm',
			color: 'bg.default',
			fontWeight: 'semibold',
			px: '2',
			py: '1',
			textStyle: 'xs',
			maxWidth: '2xs',
			zIndex: 'tooltip',
			backdropFilter: 'blur(1rem)',
			_open: {
				animation: 'fadeIn 0.25s ease-out',
			},
			_closed: {
				animation: 'fadeOut 0.2s ease-out',
			},
		},
	},
});
