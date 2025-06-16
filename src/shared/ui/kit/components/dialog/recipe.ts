import { dialogAnatomy } from '@ark-ui/react';
import { defineSlotRecipe } from '@pandacss/dev';

export const dialog = defineSlotRecipe({
	className: 'dialog',
	slots: [...dialogAnatomy.keys(), 'footer'],
	base: {
		backdrop: {
			backdropFilter: 'blur(0.25rem)',
			background: {
				_light: 'white.a10',
				_dark: 'black.a10',
			},
			height: '100vh',
			left: '0',
			position: 'fixed',
			top: '0',
			width: '100vw',
			zIndex: 'overlay',
			_open: {
				animation: 'backdrop-in',
			},
			_closed: {
				animation: 'backdrop-out',
			},
		},
		positioner: {
			alignItems: 'center',
			display: 'flex',
			justifyContent: 'center',
			left: '0',
			overflow: 'auto',
			position: 'fixed',
			top: '0',
			width: '100vw',
			height: '100dvh',
			zIndex: 'modal',
		},
		content: {
			display: 'flex',
			flexDirection: 'column',
			gap: '1rem',
			background: 'bg.default',
			borderRadius: 'l3',
			boxShadow: 'lg',
			minW: 'sm',
			position: 'relative',
			padding: '1.5rem',
			_open: {
				animation: 'dialog-in',
			},
			_closed: {
				animation: 'dialog-out',
			},
		},
		title: {
			fontWeight: 'semibold',
			textStyle: 'xl',
			maxWidth: 'calc(100% - 2rem)',
		},
		description: {
			color: 'fg.muted',
			textStyle: 'sm',
		},
		footer: {
			display: 'flex',
			gap: '0.625rem',
			width: 'full',
			marginTop: '1rem',
		},
	},
});
