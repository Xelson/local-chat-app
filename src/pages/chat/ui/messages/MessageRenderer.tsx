import { reatomComponent } from '@reatom/react';
import { VStack } from 'styled-system/jsx';
import type { ChatMessageModel } from '~/entities/chat';
import { dayJs } from '~/shared/lib/date';
import { Skeleton, Text } from '~/shared/ui/kit/components';
import { MessageBubble } from './MessageBubble';
import { ContentRenderer } from './ContentRenderer';
import { AttachmentsRenderer } from './AttachmentsRenderer';
import { memo as reactMemo, type PropsWithChildren } from 'react';

type MessageRendererProps = PropsWithChildren<{ message: ChatMessageModel }>;

export const MessageRenderer = reactMemo(reatomComponent(({ message, children }: MessageRendererProps) => {
	const textModel = message.content()?.text;
	const role = message.role();
	const createdAt = message.createdAt();

	if (role !== 'assistant' && role !== 'user')
		return null;

	return (
		<VStack
			className='group'
			alignItems={role == 'user' ? 'end' : 'start'}
			width='full'
			gap='0.25rem'
		>
			<Skeleton loading={!textModel} asChild>
				<MessageBubble
					role={role}
					flexDir='row'
					alignItems='end'
				>
					<VStack
						alignItems='start'
						gap='inherit'
						flexGrow='1'
						minW='0'
						maxW='full'
					>
						{textModel && <ContentRenderer id={message.id} model={textModel} />}

						<AttachmentsRenderer model={message} />
					</VStack>

					<Text
						color='fg.muted'
						textStyle='xs'
						textAlign='end'
						title={createdAt?.toLocaleString()}
						flexShrink='0'
					>
						{createdAt && dayJs(createdAt).format('HH:mm')}
					</Text>
				</MessageBubble>
			</Skeleton>

			{children}
		</VStack>
	);
}));
