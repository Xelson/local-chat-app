import {
	type AtomLike,
	memo,
	sleep,
	wrap,
	computed,
	atom,
	throwAbort,
	peek,
	withAsync,
	withCallHook,
	withComputed,
	getCalls,
	noop,
} from '@reatom/core';

import { reatomComponent } from '@reatom/react';
import { styled, VStack } from 'styled-system/jsx';
import { editorFormVariable } from '../model/editor-form';
import { fromAsyncCodeToHtml } from '@shikijs/markdown-it/async';
import MarkdownItAsync from 'markdown-it-async';
import { codeToHtml } from 'shiki';
import { useMemo } from 'react';
import { Skeleton, Spinner } from '~/shared/ui/kit/components';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';
import type { ChatMessageModel } from '~/entities/chat';
import type { CoPlainText } from 'jazz-tools';

const md = MarkdownItAsync();

md.use(
	fromAsyncCodeToHtml(codeToHtml, {
		themes: {
			light: 'vitesse-light',
			dark: 'vitesse-dark',
		},
	}),
);

const MessageBubble = styled('div', {
	base: {
		paddingY: '0.5rem',
		paddingX: '1rem',
		backgroundColor: 'colorPalette.4',
		borderRadius: 'l3',
	},
});

export const MessagesStream = reatomComponent(() => {
	const model = editorFormVariable.get();
	const { content } = model.fields;
	const typing = memo(() => content.value().length > 0);

	const matched = sidebarChatRoute.exact();
	const loaderData = sidebarChatRoute.loader.data();
	const messages = loaderData?.chat?.messages();

	return (
		<VStack
			size='full'
			flexDirection='column-reverse'
		>
			<VStack
				size='full'
				alignItems='start'
			>
				{matched && messages && messages.map(message => (
					<MessageRenderer
						key={message.id}
						model={message}
					/>
				))}
				{typing && (
					<MessageBubble
						colorPalette='purple'
						alignSelf='end'
						opacity='0.5'
					>
						<ContentRenderer model={content.value} />
					</MessageBubble>
				)}
			</VStack>
		</VStack>
	);
});

const MessageRenderer = reatomComponent(({ model }: { model: ChatMessageModel }) => {
	const textModel = model.content()?.text;
	const role = model.role();

	if (role !== 'assistant' && role !== 'user')
		return null;

	return (
		<Skeleton loading={!textModel} asChild>
			<MessageBubble
				colorPalette={role == 'user' ? 'purple' : 'grey'}
				alignSelf={role == 'user' ? 'end' : 'start'}
			>
				{textModel ? <ContentRenderer model={textModel} /> : <Spinner size='sm' />}
			</MessageBubble>
		</Skeleton>
	);
});

const ContentRenderer = reatomComponent(({ model }: { model: AtomLike<CoPlainText | string | undefined> }) => {
	const result = useMemo(() => {
		// Here domain code contains logic that should be in withAbort('first-in-win') for simple throttling implementation.
		// But this version of reatom is in alpha, so we're waiting for implementation
		const trailing = atom(false, '_contentRenderer.trailing');

		const renderText = computed(async () => {
			const content = model();
			if (!content)
				return;

			if (peek(trailing)) throwAbort();

			try {
				trailing.set(true);

				const wait = sleep(150);
				const html = await wrap(md.renderAsync(content.toString()));
				await wrap(wait);

				return html;
			}
			finally {
				trailing.set(false);
			}
		}, '_contentRenderer.renderText').extend(
			withAsync(),
		);

		const data = atom<string | undefined>(undefined, '_contentRenderer.data').extend(
			withComputed((state) => {
				renderText().catch(noop);

				getCalls(renderText.onFulfill).forEach(({ payload }) => {
					state = payload.payload;
				});
				return state;
			}),
		);

		renderText.onFulfill.extend(withCallHook(() => data()));

		return data;
	}, [model]);

	const html = result();

	if (!html)
		return <Spinner size='sm' />;

	return (
		<styled.div
			dangerouslySetInnerHTML={{ __html: html as TrustedHTML }}
			css={{
				'& > pre.shiki': {
					padding: '1rem',
					borderRadius: 'l2',
					marginY: '0.5rem',
				},
				'& img': {
					maxWidth: '10rem',
				},
				'& a': {
					color: 'colorPalette.9',
				},
				'& h1': {
					textStyle: '6xl',
				},
				'& h2': {
					textStyle: '5xl',
				},
				'& h3': {
					textStyle: '4xl',
				},
				'& h4': {
					textStyle: '3xl',
				},
				'& h5': {
					textStyle: '2xl',
				},
				'& h6': {
					textStyle: 'xl',
				},
			}}
		/>
	);
});
