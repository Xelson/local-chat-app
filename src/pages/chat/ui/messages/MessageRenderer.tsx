import { reatomComponent } from '@reatom/react';
import { VStack } from 'styled-system/jsx';
import type { ChatMessageModel } from '~/entities/chat';
import { dayJs } from '~/shared/lib/date';
import { Skeleton, Text } from '~/shared/ui/kit/components';
import { MessageBubble } from './MessageBubble';
import { ContentRenderer } from './ContentRenderer';
import { AttachmentsRenderer } from './AttachmentsRenderer';
import { MessageActionsPanel } from './MessageActionsPanel';
import { memo as reactMemo } from 'react';

export const MessageRenderer = reactMemo(reatomComponent(({ model }: { model: ChatMessageModel }) => {
	const textModel = model.content()?.text;
	const role = model.role();
	const createdAt = model.createdAt();

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
						{textModel && <ContentRenderer id={model.id} model={textModel} />}

						<AttachmentsRenderer model={model} />
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

			<MessageActionsPanel model={model} />
		</VStack>
	);
}));
