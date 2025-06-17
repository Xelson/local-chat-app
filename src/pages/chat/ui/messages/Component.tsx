import { memo } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { VStack } from 'styled-system/jsx';
import { editorFormVariable } from '../../model/editor-form';
import { Badge } from '~/shared/ui/kit/components';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';
import type { ChatMessageModel } from '~/entities/chat';
import { dayJs } from '~/shared/lib/date';
import { MessageRenderer } from './MessageRenderer';
import { MessageBubble } from './MessageBubble';
import { ContentRenderer } from './ContentRenderer';
import { MessagesViewport } from './Viewport';

export const MessagesStream = reatomComponent(() => {
	const model = editorFormVariable.get();
	const { content } = model.fields;
	const typing = memo(() => content.value().length > 0 && !model.submit.pending());

	const messagesGroup = memo(() => {
		if (!sidebarChatRoute.exact())
			return undefined;

		const loaderData = sidebarChatRoute.loader.data();
		const messages = loaderData?.chat?.messages();
		if (!messages)
			return undefined;

		const map = new Map<string, ChatMessageModel[]>();

		messages.forEach((model) => {
			const date = model.createdAt()?.toLocaleDateString() ?? '';
			const messageModels = map.get(date) ?? [];
			messageModels.push(model);
			map.set(date, messageModels);
		});

		return Array.from(map);
	});

	return (
		<MessagesViewport>
			{messagesGroup?.map(([date, messages]) => (
				<VStack
					position='relative'
					alignItems='start'
					gap='inherit'
					width='full'
				>
					<Badge
						position='sticky'
						top='0'
						marginX='auto'
						variant='solid'
						color='fg.default'
						backgroundColor='black.a1'
						backdropFilter='blur(0.3rem)'
						pointerEvents='none'
						zIndex='banner'
					>
						{dayJs().calendar(date, {
							sameDay: '[Today], DD.MM.YYYY',
							lastDay: '[Yesterday], DD.MM.YYYY',
							sameElse: 'DD.MM.YYYY',
						})}
					</Badge>

					{messages.map(message => (
						<MessageRenderer
							key={message.id}
							model={message}
						/>
					))}
				</VStack>
			))}
			{typing && (
				<MessageBubble
					role='user'
					opacity='0.5'
				>
					<ContentRenderer model={content.value} />
				</MessageBubble>
			)}
		</MessagesViewport>
	);
});
