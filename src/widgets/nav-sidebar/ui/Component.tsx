import { reatomComponent } from '@reatom/react';
import { Divider, VStack } from 'styled-system/jsx';
import { sidebarChatRoute, sidebarRoute } from '../model/route';
import { Button, Heading, Text } from '~/shared/ui/kit/components';
import { PlusIcon } from 'lucide-react';
import { BrandLogo } from '~/entities/branding';
import { type ChatModel } from '~/entities/chat';
import { ChatItem } from './ChatItem';
import { wrap } from '@reatom/core';

interface ComponentProps {
	onShouldFocusChatInput?: () => void;
}

export const Component = reatomComponent(({ onShouldFocusChatInput }: ComponentProps) => {
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

	const deleteChat = wrap((id: string) => {
		const co = loaderData?.chatsList?.loaded();
		if (!co)
			return;

		const chatIndex = co.findIndex(item => item?.id === id);
		if (chatIndex !== -1)
			co.splice(chatIndex, 1);

		if (sidebarChatRoute()?.chatId === id) {
			sidebarRoute.go();
			onShouldFocusChatInput?.();
		}
	});

	return (
		<VStack
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
		>
			<Heading size='xl'>
				<BrandLogo size='2rem' />
			</Heading>

			<Button
				variant='subtle'
				colorPalette='purple'
				width='full'
				borderRadius='l2'
				onClick={onShouldFocusChatInput}
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
								onRequestDelete={() => deleteChat(model.id)}
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
							onRequestDelete={() => model?.id && deleteChat(model.id)}
						/>
					))
				) : (
					Array.from({ length: 4 }).map((_, index) => (
						<ChatItem key={index} model={undefined} />
					))
				)}
			</VStack>
		</VStack>
	);
});
