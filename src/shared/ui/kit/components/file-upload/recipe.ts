import { fileUploadAnatomy } from '@ark-ui/react';
import { defineSlotRecipe } from '@pandacss/dev';

export const fileUpload = defineSlotRecipe({
	className: 'fileUpload',
	slots: fileUploadAnatomy.keys(),
	base: {
		root: {
			display: 'flex',
			flexDirection: 'column',
			gap: '4',
			width: '100%',
		},
		label: {
			fontWeight: 'medium',
			textStyle: 'sm',
		},
		dropzone: {
			alignItems: 'center',
			background: 'bg.default',
			borderRadius: 'l3',
			borderWidth: '1px',
			display: 'flex',
			flexDirection: 'column',
			gap: '3',
			justifyContent: 'center',
			minHeight: 'xs',
			px: '6',
			py: '4',
			flexShrink: '0',
		},
		item: {
			position: 'relative',
			animation: 'fadeIn 0.25s ease-out',
			background: 'bg.default',
			borderRadius: 'l3',
			borderWidth: '1px',
			columnGap: '3',
			display: 'flex',
			flexDirection: 'column',
			padding: '0.5rem',
			size: '8rem',
			maxWidth: 'full',
			flexShrink: '0',
		},
		itemGroup: {
			display: 'flex',
			flexDirection: 'column',
			gap: '3',
		},
		itemName: {
			color: 'fg.default',
			fontWeight: 'medium',
			textStyle: 'sm',
			truncate: true,
			maxWidth: 'full',
		},
		itemSizeText: {
			color: 'fg.muted',
			textStyle: 'sm',
			truncate: true,
			maxWidth: 'full',
		},
		itemDeleteTrigger: {
			alignSelf: 'flex-start',
			position: 'absolute',
			top: '0.25rem',
			right: '0.25rem',
		},
		itemPreview: {

		},
		itemPreviewImage: {
			aspectRatio: '1',
			objectFit: 'cover',
			size: '4rem',
			borderRadius: 'l2',
			overflow: 'hidden',
			marginBottom: 'auto',
		},
	},
});
