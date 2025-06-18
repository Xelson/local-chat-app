import { reatomComponent } from '@reatom/react';
import { sidebarChatRoute } from '../model/route';
import { Button, Dialog, IconButton, Menu, Skeleton, Spinner } from '~/shared/ui/kit/components';
import { GitMergeIcon, PinIcon, PinOffIcon, TextCursorIcon, Trash2Icon } from 'lucide-react';
import { type ChatModel } from '~/entities/chat';
import { Editable, Portal } from '@ark-ui/react';
import { useMemo } from 'react';
import { atom, withComputed } from '@reatom/core';
import { css } from 'styled-system/css';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { VStack } from 'styled-system/jsx';
import { deleteChat } from '../model/delete-chat';

interface ChatItemProps {
	model: ChatModel | null | undefined;
	onRequestDelete?: () => void;
}

export const ChatItem = reatomComponent(({ model, onRequestDelete }: ChatItemProps) => {
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
		<DeleteConfirmationDialog
			model={model}
			onConfirm={onRequestDelete}
		>
			<Menu.Root size='md'>
				<VStack alignItems='start' w='full' gap='0.5rem'>
					<Editable.Root
						value={name?.() ?? ''}
						onValueChange={({ value }) => name?.set(value)}
						onValueCommit={({ value }) => model?.name.update(value)}
						activationMode='dblclick'
						selectOnFocus
						className={'group ' + css({
							position: 'relative',
							width: 'full',
							display: 'flex',
							alignItems: 'center',
						})}
					>
						<Skeleton loading={!model} asChild>
							<Button
								variant='ghost'
								width='full'
								justifyContent='space-between'
								data-selected={selected ? 'true' : undefined}
								maxWidth='full'
								paddingRight='0.75rem'
								asChild
							>
								<Menu.ContextTrigger asChild>
									<a href={chatId ? sidebarChatRoute.path({ chatId }) : undefined}>
										<Editable.Area
											className={css({
												display: 'flex',
												flexDir: 'row',
												alignItems: 'center',
												gap: '0.5rem',
												truncate: true,
											})}
										>
											{model?.branch() && (
												<GitMergeIcon className={css({ color: 'gray.10' })} />
											)}

											<Editable.Preview
												className={css({ width: 'full' })}
											/>
											<Editable.Input
												className={css({ width: 'full', outline: 'none' })}
											/>
										</Editable.Area>

										{model && <CompletionSpinner model={model} />}
									</a>
								</Menu.ContextTrigger>
							</Button>
						</Skeleton>

						<Dialog.Trigger asChild>
							<IconButton
								position='absolute'
								right='0.3rem'
								variant='ghost'
								color='red.9'
								size='xs'
								opacity='0'
								_groupHover={{ opacity: '1' }}
								transition='100ms opacity'
								onClick={(e) => {
									if (e.shiftKey) {
										e.stopPropagation();
										e.preventDefault();
										onRequestDelete?.();
									}
								}}
							>
								<Trash2Icon />
							</IconButton>
						</Dialog.Trigger>

						<Portal>
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
						</Portal>
					</Editable.Root>

					{model && <BranchesList model={model} />}
				</VStack>
			</Menu.Root>
		</DeleteConfirmationDialog>
	);
});

const BranchesList = reatomComponent(({ model }: { model: ChatModel }) => {
	const chatItems = model.branches()?.items();
	if (!chatItems || !chatItems.length)
		return null;

	const handleDeleteChat = (id: string) => {
		const list = model.branches();
		if (list)
			deleteChat(list, id);
	};

	return (
		<VStack
			alignItems='start'
			width='full'
			paddingStart='0.5rem'
			gap='0.25rem'
		>
			{chatItems.map((item, index) => (
				<ChatItem
					key={item?.id ?? index}
					model={item}
					onRequestDelete={() => item && handleDeleteChat(item.id)}
				/>
			))}
		</VStack>
	);
});

const CompletionSpinner = reatomComponent(({ model }: { model: ChatModel }) => {
	const running = model.completionRunning();

	return (
		<Spinner
			size='sm'
			opacity={running ? '1' : '0'}
			_groupHover={{ opacity: '0' }}
			transition='100ms opacity'
			pointerEvents='none'
		/>
	);
});
