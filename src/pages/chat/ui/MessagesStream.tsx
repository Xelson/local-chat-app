import { memo } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { styled, VStack } from 'styled-system/jsx';
import { editorFormVariable } from '../model/editor-form';
import { useMemo } from 'react';
import { Skeleton, Spinner } from '~/shared/ui/kit/components';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';
import type { ChatMessageModel } from '~/entities/chat';
import { type ContentRenderer, type ContentRendererInput, reatomContentRenderer } from '../model/content-renderer';

const MessageBubble = styled('div', {
	base: {
		paddingY: '0.5rem',
		paddingX: '1rem',
		backgroundColor: 'colorPalette.4',
		borderRadius: 'l3',
		maxWidth: 'full',
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

const contentRenderersCache = new WeakMap<ContentRendererInput, ContentRenderer>();

const useCachedContentRenderer = (input: ContentRendererInput) => {
	return useMemo(() => {
		let renderer = contentRenderersCache.get(input);
		if (!renderer) {
			renderer = reatomContentRenderer(input, 'contentRenderer');
			contentRenderersCache.set(input, renderer);
		}
		return renderer;
	}, [input]);
};

const ContentRenderer = reatomComponent(({ model }: { model: ContentRendererInput }) => {
	const renderer = useCachedContentRenderer(model);
	const html = renderer();

	if (!html)
		return <Spinner size='sm' />;

	return (
		<styled.div
			className='group'
			dangerouslySetInnerHTML={{ __html: html as TrustedHTML }}
			css={{
				'position': 'relative',

				'& > pre.shiki': {
					padding: '1rem',
					borderRadius: 'l2',
					marginY: '0.5rem',
					maxWidth: 'full',
					overflowX: 'auto',
					minWidth: '3rem',
					minHeight: '3rem',
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
