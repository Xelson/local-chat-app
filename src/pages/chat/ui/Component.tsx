import { Center, Divider, HStack, VStack } from 'styled-system/jsx';
import { IconButton, TextField } from '~/shared/ui/kit/components';
import { Sidebar } from '~/widgets/nav-sidebar';
import { ModelSelect } from './ModelSelect';
import { ArrowUpIcon, PaperclipIcon } from 'lucide-react';

export function Component() {
	return (
		<HStack size='full' gap='1rem'>
			<Sidebar />

			<Center
				size='full'
				alignItems='start'
			>
				<VStack
					size='full'
					position='relative'
					alignItems='start'
					width='full'
					maxWidth='50rem'
					marginX='1rem'
				>
					<InputPanel />
				</VStack>
			</Center>
		</HStack>
	);
}

function InputPanel() {
	const stickToBottom = false;

	return (
		<VStack
			position='absolute'
			left='-1rem'
			right='-1rem'
			bottom={stickToBottom ? '0' : '50%'}
			translate='auto'
			translateY={stickToBottom ? '0%' : '50%'}
			alignItems='start'
			padding='1rem'
			border='default'
			borderColor='border.subtle'
			background='white/50'
			backdropFilter='blur(2rem)'
			borderRadius='l3'
			shadow='sm'
			transition='200ms all ease-in-out'
		>
			<TextField.Root
				className='group'
				variant='unstyled'
				padding='0'
				width='full'
			>
				<TextField.Textarea
					autoresize
					placeholder='Type your message here...'
					maxHeight='50vh'
				/>
			</TextField.Root>

			<Divider maskImage='radial-gradient(#000 20%, #0000 70%)' />

			<HStack width='full' justifyContent='space-between'>
				<HStack gap='0.5rem'>
					<ModelSelect />
					<IconButton variant='subtle' size='sm'>
						<PaperclipIcon />
					</IconButton>
				</HStack>

				<IconButton variant='subtle' size='sm'>
					<ArrowUpIcon />
				</IconButton>
			</HStack>
		</VStack>
	);
}
