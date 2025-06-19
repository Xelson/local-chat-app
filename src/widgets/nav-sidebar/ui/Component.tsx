import { reatomComponent } from '@reatom/react';
import { Divider, HStack, VStack } from 'styled-system/jsx';
import { sidebarRoute } from '../model/route';
import { Button, IconButton, Text } from '~/shared/ui/kit/components';
import { PanelLeftCloseIcon, PlusIcon } from 'lucide-react';
import { BrandLogo } from '~/entities/branding';
import { type ChatModel } from '~/entities/chat';
import { ChatItem } from './ChatItem';
import { deleteChat } from '../model/delete-chat';
import { SettingsDialog } from './SettingsDialog';
import { reatomBoolean } from '@reatom/core';

const sidebarOpen = reatomBoolean(true, 'sidebarOpen');

export const Component = reatomComponent(() => {
	const loaderData = sidebarRoute.loader.data();
	const loadedChatItems = loaderData?.chatsList.items();

	const chats: ChatModel[] = [];
	const pinnedChats: ChatModel[] = [];

	loadedChatItems?.forEach((chat) => {
		if (chat) {
			if (chat.pinned())
				pinnedChats.push(chat);
			else
				chats.push(chat);
		}
	});

	const handleDeleteChat = (id: string) => {
		const list = loaderData?.chatsList;
		if (list)
			deleteChat(list, id);
	};

	const open = sidebarOpen();

	return (
		<VStack
			position='relative'
			alignItems='start'
			border='default'
			borderColor='border.subtle'
			borderRadius='l3'
			padding='1rem'
			height='full'
			backgroundColor='white/80'
			backdropFilter='blur(3rem)'
			gap='1rem'
			width='14.5rem'
			flexShrink='0'
			marginLeft={open ? '0' : '-16rem'}
			transition='200ms margin ease'
		>
			<HStack className='group' justifyContent='space-between' width='full'>
				<BrandLogo size='2rem' />

				<IconButton
					variant='ghost'
					ml='auto'
					opacity='0'
					_groupHover={{ opacity: '1' }}
					transition='200ms opacity'
					onClick={sidebarOpen.setFalse}
				>
					<PanelLeftCloseIcon />
				</IconButton>

				<BrandLogo
					position='absolute'
					size='2rem'
					right={open ? '0' : '-3.5rem'}
					cursor='pointer'
					opacity={open ? '0' : '1'}
					transition='200ms all'
					onClick={sidebarOpen.setTrue}
				/>
			</HStack>

			<Button
				variant='subtle'
				colorPalette='purple'
				width='full'
				borderRadius='l2'
				asChild
			>
				<a href='/'>
					<PlusIcon /> New chat
				</a>
			</Button>

			<VStack
				width='full'
				height='full'
				alignItems='start'
				maskImage={!loadedChatItems
					? 'linear-gradient(to bottom, #000 20%, #0000 70%)'
					: 'linear-gradient(to bottom, #000 calc(100% - 2rem), #0000)'}
				overflowY='auto'
				scrollbarWidth='none'
				gap='0.25rem'
			>
				{pinnedChats.length > 0 && (
					<>
						<Text fontWeight='bold' size='sm'>
							Pinned chats
						</Text>
						{pinnedChats.map(model => (
							<ChatItem
								key={model.id}
								model={model}
								onRequestDelete={() => handleDeleteChat(model.id)}
							/>
						))}
						{chats.length > 0 && <Divider />}
					</>
				)}

				{loadedChatItems ? (
					chats.map((model, index) => (
						<ChatItem
							key={model?.id ?? index}
							model={model}
							onRequestDelete={() => model?.id && handleDeleteChat(model.id)}
						/>
					))
				) : (
					Array.from({ length: 4 }).map((_, index) => (
						<ChatItem key={index} model={undefined} />
					))
				)}
			</VStack>

			<SettingsDialog />
		</VStack>
	);
});
