import { Center, Divider, HStack, VStack } from "styled-system/jsx";
import { IconButton, TextField } from "~/shared/ui/kit/components";
import { Sidebar } from "~/widgets/nav-sidebar";
import { ModelSelect } from "./ModelSelect";
import { ArrowUpIcon, PaperclipIcon } from "lucide-react";

export function Component() {
	return (
		<HStack size='full' gap='1rem'>
			<Sidebar />

			<Center size='full'>
				<InputPanel />
			</Center>
		</HStack>
	)
}

function InputPanel() {
	return (
		<VStack
			alignItems='start'
			width='full'
			maxWidth='50rem'
			padding='1rem'
			border='default'
			borderColor='border.subtle'
			background='white/50'
			backdropFilter='blur(2rem)'
			borderRadius='l3'
			shadow='sm'
		>
			<TextField.Root width='full' p='0' outline='none'>
				<TextField.Textarea
					autoresize
					placeholder='Type your message here...'
				/>
			</TextField.Root>

			<Divider />

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
	)
}

