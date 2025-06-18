import { reatomComponent } from '@reatom/react';
import { HStack } from 'styled-system/jsx';
import type { ChatMessageModel, ChatModel } from '~/entities/chat';
import { IconButton, Tooltip } from '~/shared/ui/kit/components';
import { CheckIcon, CopyIcon, GitMergeIcon, RefreshCcwIcon, Trash2Icon } from 'lucide-react';
import { Clipboard } from '@ark-ui/react';
import { css } from 'styled-system/css';
import { wrap } from '@reatom/core';
import { invariant } from '~/shared/lib/asserts';

interface MessageActionsPanelProps {
	chat: ChatModel;
	message: ChatMessageModel;
}

export const MessageActionsPanel = reatomComponent(({ chat, message }: MessageActionsPanelProps) => {
	const prevMessageCo = message.prev()?.loaded();

	const deleteMessage = wrap(() => {
		const currentCo = message.loaded();
		const chatCo = chat.loaded();

		invariant(currentCo, 'CO of current message is not available');
		invariant(chatCo, 'CO of chat is not available');
		invariant(chatCo.lastMessage, 'CO of chat last message is not available');
		invariant(prevMessageCo, 'CO of previous message is not available');

		const nextCo = message.next()?.loaded();

		if (currentCo.id === chatCo.lastMessage.id)
			chatCo.lastMessage = prevMessageCo;

		if (nextCo)
			nextCo.prev = prevMessageCo;
	});

	return (
		<HStack
			gap='0.25rem'
			transition='200ms opacity'
			opacity='0'
			_groupHover={{ opacity: '1' }}
		>
			<Tooltip.Composed label='Branch off'>
				<IconButton variant='ghost' size='xs' color='gray.11'>
					<GitMergeIcon />
				</IconButton>
			</Tooltip.Composed>

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

			<Tooltip.Composed label='Retry message'>
				<IconButton variant='ghost' size='xs' color='gray.11'>
					<RefreshCcwIcon />
				</IconButton>
			</Tooltip.Composed>

			{prevMessageCo && (
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
