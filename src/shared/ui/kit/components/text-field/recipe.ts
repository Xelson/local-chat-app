import { defineSlotRecipe } from '@pandacss/dev';

export const textField = defineSlotRecipe({
	className: 'textField',
	slots: ['root', 'input', 'element'],
	base: {
		root: {
			display: 'flex',
			alignItems: 'center',
			position: 'relative',
			colorPalette: 'forest',
			transitionDuration: 'normal',
			transitionProperty: 'box-shadow, border-color, background-color, opacity, outline-color, color',
			transitionTimingFunction: 'default',
			outline: '1px solid transparent',
			_disabled: {
				cursor: 'not-allowed',
			},
		},
		input: {
			appearance: 'none',
			background: 'none',
			width: '100%',
			outline: 0,
			transition: 'inherit',
			_disabled: {
				cursor: 'not-allowed',
			},
		},
		element: {
			display: 'flex',
			alignItems: 'center',
			flexShrink: 0,
			gap: '0.375rem',
			transition: 'inherit',
		},
	},
	defaultVariants: {
		variant: 'solid',
		size: 'default',
	},
	variants: {
		variant: {
			unstyled: {},
			solid: {
				root: {
					backgroundColor: 'gray.2',
					outlineColor: 'gray.4',
					_hover: {
						outlineColor: 'gray.5',
					},
					_priority: {
						_focusWithin: {
							outlineColor: 'colorPalette.7',
						},
						_invalid: {
							outlineColor: 'border.error',
						},
					},
				},
				input: {
					_placeholder: {
						color: 'grey.2',
					},
					_disabled: {
						_placeholder: {
							color: 'grey.2',
						},
					},
				},
				element: {
					color: 'neutral.400',
				},
			},
		},
		size: {
			default: {
				root: {
					minHeight: '2rem',
					borderRadius: '0.25rem',
					paddingX: '0.75rem',
					paddingY: '0.25rem',
					gap: '0.75rem',
				},
				element: {
					_icon: {
						width: '1.25rem',
						height: '1.25rem',
					},
				},
			},
		},
	},
});
