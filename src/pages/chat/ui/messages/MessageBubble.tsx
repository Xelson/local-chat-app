import { styled } from 'styled-system/jsx';

export const MessageBubble = styled('div', {
	base: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.5rem',
		paddingY: '0.5rem',
		paddingX: '1rem',
		backgroundColor: 'colorPalette.4',
		borderRadius: 'l3',
		maxWidth: 'full',
		minHeight: '2.5rem',
		flexShrink: '0',
		overflow: 'hidden',
		position: 'relative',
	},
	variants: {
		role: {
			assistant: {
				colorPalette: 'gray',
				borderBottomLeftRadius: '0',
			},
			user: {
				borderBottomRightRadius: '0',
				alignSelf: 'end',
			},
		},
	},
});
