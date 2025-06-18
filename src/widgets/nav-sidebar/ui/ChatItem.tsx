import { reatomComponent } from '@reatom/react';
import { sidebarChatRoute } from '../model/route';
import { Button, Dialog, IconButton, Kbd, Menu, Skeleton, Spinner, Text } from '~/shared/ui/kit/components';
import { PinIcon, PinOffIcon, TextCursorIcon, Trash2Icon } from 'lucide-react';
import { type ChatModel } from '~/entities/chat';
import { Editable, Portal } from '@ark-ui/react';
import { useMemo, useRef, type PropsWithChildren } from 'react';
import { atom, withComputed } from '@reatom/core';
import { css } from 'styled-system/css';

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
									<Editable.Area className={css({ truncate: true })}>
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
			</Menu.Root>
		</DeleteConfirmationDialog>
	);
});

interface DeleteConfirmationDialogProps extends PropsWithChildren {
	model?: ChatModel;
	onConfirm?: () => void;
}

const DeleteConfirmationDialog = reatomComponent(({ model, children, onConfirm }: DeleteConfirmationDialogProps) => {
	const clickedConfirmRef = useRef(false);

	return (
		<Dialog.Root
			unmountOnExit
			lazyMount
			onExitComplete={() => {
				if (clickedConfirmRef.current) {
					onConfirm?.();
					clickedConfirmRef.current = false;
				}
			}}
		>
			{children}

			<Portal>
				<Dialog.Backdrop />
				<Dialog.Positioner>
					<Dialog.Content>
						<Dialog.Title>Are you sure you want to delete this?</Dialog.Title>
						<Dialog.Description>
							Chat <b>{model?.name()}</b> will be permanently deleted
						</Dialog.Description>

						<Dialog.CloseButton />

						<Dialog.Footer>
							<Dialog.CloseTrigger asChild>
								<Button variant='outline' width='full'>
									Cancel
								</Button>
							</Dialog.CloseTrigger>

							<Dialog.CloseTrigger asChild>
								<Button
									colorPalette='red'
									width='full'
									onClick={() => clickedConfirmRef.current = true}
								>
									Confirm
								</Button>
							</Dialog.CloseTrigger>
						</Dialog.Footer>

						<Text color='fg.muted' textStyle='xs' textAlign='end' w='full'>
							<Kbd size='sm' px='2'>SHIFT</Kbd> to skip this
						</Text>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
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
