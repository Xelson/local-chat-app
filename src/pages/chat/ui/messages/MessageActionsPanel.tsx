import { reatomComponent } from '@reatom/react';
import { HStack } from 'styled-system/jsx';
import { Chat, ChatsList, type ChatMessageModel, type ChatModel } from '~/entities/chat';
import { IconButton, Tooltip } from '~/shared/ui/kit/components';
import { CheckIcon, CopyIcon, GitMergeIcon, Trash2Icon } from 'lucide-react';
import { Clipboard } from '@ark-ui/react';
import { css } from 'styled-system/css';
import { memo, wrap } from '@reatom/core';
import { invariant } from '~/shared/lib/asserts';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';

interface MessageActionsPanelProps {
	chat: ChatModel;
	message: ChatMessageModel;
}

export const MessageActionsPanel = reatomComponent(({ chat, message }: MessageActionsPanelProps) => {
	const firstMessage = memo(() => !message.prev()?.loaded());
	const assistantMessage = memo(() => message.loaded()?.role === 'assistant');

	const deleteMessage = wrap(() => {
		const currentCo = message.loaded();
		const chatCo = chat.loaded();
		const prevCo = message.prev()?.loaded();

		invariant(currentCo, 'CO of current message is not available');
		invariant(chatCo, 'CO of chat is not available');
		invariant(chatCo.lastMessage, 'CO of chat last message is not available');
		invariant(prevCo, 'CO of previous message is not available');

		const nextCo = message.next()?.loaded();

		if (currentCo.id === chatCo.lastMessage.id)
			chatCo.lastMessage = prevCo;

		if (nextCo)
			nextCo.prev = prevCo;
	});

	const branchOff = wrap(() => {
		const chatCo = chat.loaded();
		const currentCo = message.loaded();

		invariant(currentCo, 'CO of current message is not available');
		invariant(chatCo, 'CO of chat is not available');

		const branch = Chat.create({
			name: chatCo.name,
			branches: ChatsList.create([], { owner: chatCo._owner }),
			lastMessage: currentCo,
			pinned: false,
			branch: true,
			currentModelId: chatCo.currentModelId,
		});

		chatCo.branches?.push(branch);

		sidebarChatRoute.go({ chatId: branch.id });
	});

	return (
		<HStack
			gap='0.25rem'
			transition='200ms opacity'
			opacity='0'
			_groupHover={{ opacity: '1' }}
		>
			{assistantMessage && (
				<Tooltip.Composed label='Branch off'>
					<IconButton
						variant='ghost'
						size='xs'
						color='gray.11'
						onClick={branchOff}
					>
						<GitMergeIcon />
					</IconButton>
				</Tooltip.Composed>
			)}

			<Clipboard.Root
				className='group'
				value={message.content()?.text()?.toString() ?? ''}
			>
				<Tooltip.Composed label='Copy message'>
					<Clipboard.Trigger asChild>
						<IconButton variant='ghost' size='xs' color='gray.11'>
							<CopyIcon
								className={css({
									opacity: '1',
									_groupCopied: { opacity: '0' },
									transition: '100ms opacity',
								})}
							/>
							<CheckIcon
								className={css({
									position: 'absolute',
									opacity: '0',
									_groupCopied: { opacity: '1' },
									transition: '100ms opacity',
								})}
							/>
						</IconButton>
					</Clipboard.Trigger>
				</Tooltip.Composed>
			</Clipboard.Root>

			{/* <Tooltip.Composed label='Retry message'>
				<IconButton
					variant='ghost'
					size='xs'
					color='gray.11'
				>
					<RefreshCcwIcon />
				</IconButton>
			</Tooltip.Composed> */}

			{!firstMessage && (
				<Tooltip.Composed label='Delete message'>
					<IconButton
						variant='ghost'
						size='xs'
						color='gray.11'
						onClick={deleteMessage}
					>
						<Trash2Icon />
					</IconButton>
				</Tooltip.Composed>
			)}
		</HStack>
	);
});
