'use client';
import { ark, type Assign } from '@ark-ui/react';
import { Dialog } from '@ark-ui/react/dialog';
import { type DialogVariantProps, dialog } from 'styled-system/recipes';
import type { ComponentProps, HTMLStyledProps } from 'styled-system/types';
import { createStyleContext } from '../../utils/create-style-context';
import { IconButton, type IconButtonProps } from '../button';
import { XIcon } from 'lucide-react';

const { withRootProvider, withContext } = createStyleContext(dialog);

export type RootProviderProps = ComponentProps<typeof RootProvider>;
export const RootProvider = withRootProvider<Assign<Dialog.RootProviderProps, DialogVariantProps>>(
	Dialog.RootProvider,
);

export type RootProps = ComponentProps<typeof Root>;
export const Root = withRootProvider<Assign<Dialog.RootProps, DialogVariantProps>>(Dialog.Root);

export const Backdrop = withContext<
	HTMLDivElement,
	Assign<HTMLStyledProps<'div'>, Dialog.BackdropBaseProps>
>(Dialog.Backdrop, 'backdrop');

export const CloseTrigger = withContext<
	HTMLButtonElement,
	Assign<HTMLStyledProps<'button'>, Dialog.CloseTriggerBaseProps>
>(Dialog.CloseTrigger, 'closeTrigger');

export const Content = withContext<
	HTMLDivElement,
	Assign<HTMLStyledProps<'div'>, Dialog.ContentBaseProps>
>(Dialog.Content, 'content');

export const Description = withContext<
	HTMLDivElement,
	Assign<HTMLStyledProps<'div'>, Dialog.DescriptionBaseProps>
>(Dialog.Description, 'description');

export const Positioner = withContext<
	HTMLDivElement,
	Assign<HTMLStyledProps<'div'>, Dialog.PositionerBaseProps>
>(Dialog.Positioner, 'positioner');

export const Title = withContext<
	HTMLHeadingElement,
	Assign<HTMLStyledProps<'h2'>, Dialog.TitleBaseProps>
>(Dialog.Title, 'title');

export const Trigger = withContext<
	HTMLButtonElement,
	Assign<HTMLStyledProps<'button'>, Dialog.TriggerBaseProps>
>(Dialog.Trigger, 'trigger');

export const Footer = withContext<
	HTMLDivElement, HTMLStyledProps<'div'>
>(ark.div, 'footer');

export const CloseButton = (props: IconButtonProps) => (
	<CloseTrigger asChild>
		<IconButton
			top='0.5rem'
			right='0.5rem'
			position='absolute'
			variant='ghost'
			color='gray.9'
			_icon={{ width: '1.25rem', height: '1.25rem' }}
			{...props}
		>
			<XIcon />
		</IconButton>
	</CloseTrigger>
);

export { DialogContext as Context } from '@ark-ui/react/dialog';
