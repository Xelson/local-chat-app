import { memo, reatomMap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { Center, HStack, styled, VStack } from 'styled-system/jsx';
import { editorFormVariable } from '../model/editor-form';
import { useMemo } from 'react';
import { Skeleton, Spinner } from '~/shared/ui/kit/components';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';
import type { ChatMessageModel } from '~/entities/chat';
import { type ContentRenderer, type ContentRendererInput, reatomContentRenderer } from '../model/content-renderer';
import type { FileStream } from 'jazz-tools';

const MessageBubble = styled('div', {
	base: {
		paddingY: '0.5rem',
		paddingX: '1rem',
		backgroundColor: 'colorPalette.4',
		borderRadius: 'l3',
		maxWidth: 'full',
		minHeight: '2.5rem',
		flexShrink: '0',
	},
	variants: {
		role: {
			assistant: {
				colorPalette: 'gray',
				borderBottomLeftRadius: '0',
			},
			user: {
				alignSelf: 'end',
				borderBottomRightRadius: '0',
			},
		},
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
			height='auto'
			size='full'
			flexDirection='column-reverse'
			overflowY='auto'
			scrollbarWidth='none'
			marginTop='-1rem'
			paddingTop='1rem'
		>
			<VStack
				size='full'
				alignItems='start'
				height='auto'
				paddingBottom='10rem'
			>
				{matched && messages && messages.map(message => (
					<MessageRenderer
						key={message.id}
						model={message}
					/>
				))}
				{typing && (
					<MessageBubble
						role='user'
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
			<MessageBubble role={role}>
				{textModel && <ContentRenderer model={textModel} />}

				<AttachmentsRenderer model={model} />
			</MessageBubble>
		</Skeleton>
	);
});

const contentRenderersCache = new WeakMap<ContentRendererInput, ContentRenderer>();

const useCachedContentRenderer = (input: ContentRendererInput) => {
	return useMemo(() => {
		let renderer = contentRenderersCache.get(input);
		if (!renderer) {
			renderer = reatomContentRenderer(input, '_contentRenderer');
			contentRenderersCache.set(input, renderer);
		}
		return renderer;
	}, [input]);
};

const ContentRenderer = reatomComponent(({ model }: { model: ContentRendererInput }) => {
	const renderer = useCachedContentRenderer(model);
	const html = renderer();

	if (!html) {
		const rawText = model()?.toString();
		return rawText ? <Skeleton loading>{rawText}</Skeleton> : <Spinner size='sm' />;
	}

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
					position: 'relative',
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

const AttachmentsRenderer = reatomComponent(({ model }: { model: ChatMessageModel }) => {
	const attachments = model.attachments();
	if (!attachments)
		return null;

	return (
		<HStack>
			{attachments.map(stream => (
				<AttachmentPreview
					key={stream.id}
					stream={stream}
				/>
			))}
		</HStack>
	);
});

const streamToUrlMap = reatomMap<string, string>(undefined, 'streamToUrlMap');

function AttachmentPreview({ stream }: { stream: FileStream }) {
	const url = streamToUrlMap.getOrCreate(stream.id, () => URL.createObjectURL(stream.toBlob() ?? new Blob()));

	return (
		<Center
			size='8rem'
			borderRadius='l2'
			border='default'
		>

		</Center>
	);
}
