import { reatomComponent } from '@reatom/react';
import { Divider, HStack, styled, VStack } from 'styled-system/jsx';
import { sidebarChatRoute, sidebarRoute } from '../model/route';
import { Button, Heading, IconButton, Menu, Skeleton, Text } from '~/shared/ui/kit/components';
import { PinIcon, PinOffIcon, PlusIcon, TextCursorIcon, Trash2Icon } from 'lucide-react';
import { BrandLogo } from '~/entities/branding';
import { type ChatModel } from '~/entities/chat';
import { Editable } from '@ark-ui/react';
import { useMemo } from 'react';
import { atom, withComputed } from '@reatom/core';
import { css } from 'styled-system/css';

interface ComponentProps {
	onClickAddChat?: () => void;
}

export const Component = reatomComponent(({ onClickAddChat }: ComponentProps) => {
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
				onClick={onClickAddChat}
				asChild
			>
				<a href='/'>
					<PlusIcon /> New chat
				</a>
			</Button>

			<VStack
				width='full'
				alignItems='start'
				maskImage={!loadedChatItems ? 'linear-gradient(to bottom, #000 20%, #0000 70%)' : undefined}
			>
				{pinnedChats.length > 0 && (
					<>
						<Text fontWeight='bold' size='sm'>
							Pinned chats
						</Text>
						{pinnedChats.map(model => (
							<ChatItem key={model.id} model={model} />
						))}
						<Divider />
					</>
				)}

				{loadedChatItems ? (
					chats.map((model, index) => (
						<ChatItem key={model?.id ?? index} model={model} />
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

const ChatItem = reatomComponent(({ model }: { model: ChatModel | null | undefined }) => {
	const name = useMemo(() => {
		if (!model)
			return;

		return atom(() => model.name(), `chat.${model.id}.nameEditor`).extend(
			withComputed((state) => {
				const newName = model.name();
				if (newName)
					state = newName;

				return state;
			}),
		);
	}, [model]);

	if (model === null)
		return null;

	const chatId = model?.id;
	const selected = sidebarChatRoute()?.chatId === model?.id;

	return (
		<Menu.Root size='md'>
			<Editable.Root
				value={name?.() ?? ''}
				onValueChange={({ value }) => name?.set(value)}
				onValueCommit={({ value }) => model?.name.update(value)}
				activationMode='dblclick'
				selectOnFocus
				className={css({ width: 'full' })}
			>
				<Skeleton loading={!model} asChild>
					<Button
						className='group'
						variant='ghost'
						width='full'
						justifyContent='space-between'
						data-selected={selected ? 'true' : undefined}
						maxWidth='full'
						paddingRight='0.3rem'
						asChild
					>
						<Menu.ContextTrigger asChild>
							<a href={chatId ? sidebarChatRoute.path({ chatId }) : undefined}>
								<Editable.Area className={css({ truncate: true })}>
									<Editable.Preview
										className={css({ width: 'full' })}
									/>
									<Editable.Input
										className={css({ width: 'full', outline: 'none' })}
									/>
								</Editable.Area>

								<HStack gap='0.25rem'>
									<IconButton
										variant='ghost'
										color='red.9'
										size='xs'
										opacity='0'
										_groupHover={{ opacity: '1' }}
										transition='100ms opacity'
									>
										<Trash2Icon />
									</IconButton>
								</HStack>
							</a>
						</Menu.ContextTrigger>
					</Button>
				</Skeleton>

				<Menu.Positioner>
					<Menu.Content>
						<Menu.ItemGroup>
							{model?.pinned() ? (
								<Menu.Item
									value='unpin'
									onClick={() => model?.pinned.update(false)}
								>
									<PinOffIcon /> Unpin
								</Menu.Item>
							) : (
								<Menu.Item
									value='pin'
									onClick={() => model?.pinned.update(true)}
								>
									<PinIcon /> Pin
								</Menu.Item>
							)}

							<Editable.EditTrigger asChild>
								<Menu.Item value='rename'>
									<TextCursorIcon /> Rename
								</Menu.Item>
							</Editable.EditTrigger>
						</Menu.ItemGroup>
					</Menu.Content>
				</Menu.Positioner>
			</Editable.Root>
		</Menu.Root>
	);
});
