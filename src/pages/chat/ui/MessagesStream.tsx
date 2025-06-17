import { memo, reatomMap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { HStack, styled, VStack } from 'styled-system/jsx';
import { editorFormVariable } from '../model/editor-form';
import { useMemo, memo as reactMemo, type PropsWithChildren, useLayoutEffect, useRef, type RefObject } from 'react';
import { Badge, Skeleton, Spinner, Text } from '~/shared/ui/kit/components';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';
import type { ChatMessageModel } from '~/entities/chat';
import { type ContentRenderer, type ContentRendererInput, reatomContentRenderer } from '../model/content-renderer';
import type { FileStream } from 'jazz-tools';
import { FileIcon } from 'lucide-react';
import { css } from 'styled-system/css';
import { dayJs } from '~/shared/lib/date';

const MessageBubble = styled('div', {
	base: {
		display: 'flex',
		flexDirection: 'column',
		gap: '0.5rem',
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

const useViewportScrollRestoration = (ref: RefObject<HTMLDivElement | null>) => {
	const chat = sidebarChatRoute.exact() ? sidebarChatRoute.loader.data()?.chat : undefined;

	useLayoutEffect(() => {
		const scrollableEl = ref.current;
		if (!chat || !scrollableEl)
			return;

		if (chat.lastScrollPosition)
			scrollableEl.scrollTop = chat.lastScrollPosition;

		const controller = new AbortController();

		scrollableEl.addEventListener('scroll', () => {
			chat.lastScrollPosition = scrollableEl.scrollTop;
		}, controller);

		return () => controller.abort();
	}, [ref, chat]);
};

const MessagesViewport = reatomComponent(({ children }: PropsWithChildren) => {
	const model = editorFormVariable.get();
	const attachmentsPresent = memo(() => model.fields.attachments().size > 0);

	const scrollableRef = useRef<HTMLDivElement>(null);
	useViewportScrollRestoration(scrollableRef);

	return (
		<VStack
			ref={scrollableRef}
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
				paddingBottom={attachmentsPresent ? '20rem' : '10rem'}
				transition='500ms padding ease'
				gap='1rem'
			>
				{children}
			</VStack>
		</VStack>
	);
});

const MessageRenderer = reatomComponent(({ model }: { model: ChatMessageModel }) => {
	const textModel = model.content()?.text;
	const role = model.role();
	const createdAt = model.createdAt();

	if (role !== 'assistant' && role !== 'user')
		return null;

	return (
		<Skeleton loading={!textModel} asChild>
			<MessageBubble
				role={role}
				flexDir='row'
				alignItems='end'
			>
				<VStack alignItems='start' gap='inherit' w='full'>
					{textModel && <ContentRenderer model={textModel} />}

					<AttachmentsRenderer model={model} />
				</VStack>

				<Text
					color='fg.muted'
					textStyle='xs'
					textAlign='end'
					title={createdAt?.toLocaleString()}
				>
					{createdAt && dayJs(createdAt).format('HH:mm')}
				</Text>
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
		return rawText ? <Skeleton loading>{rawText}</Skeleton> : <Spinner size='sm' my='auto' />;
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

const AttachmentsRenderer = reactMemo(reatomComponent(({ model }: { model: ChatMessageModel }) => {
	const attachments = model.attachments();
	if (!attachments || !attachments.length)
		return null;

	return (
		<VStack alignItems='start' gap='0.25rem'>
			<Text textStyle='sm' fontWeight='medium'>
				Attachments:
			</Text>

			<HStack>
				{attachments.map(stream => (
					stream ? (
						<AttachmentPreview
							key={stream.id}
							stream={stream}
						/>
					) : (
						<Skeleton
							loading
							size='8rem'
							borderRadius='l2'
						/>
					)
				))}
			</HStack>
		</VStack>
	);
}));

const streamToUrlMap = reatomMap<string, string>(undefined, 'streamToUrlMap');

const fileSizeFormatter = Intl.NumberFormat('en', {
	notation: 'compact',
	style: 'unit',
	unit: 'byte',
	unitDisplay: 'narrow',
});

function AttachmentPreview({ stream }: { stream: FileStream }) {
	const meta = stream.getMetadata();
	const url = streamToUrlMap.getOrCreate(stream.id, () => URL.createObjectURL(stream.toBlob() ?? new Blob()));

	return (
		<VStack
			size='8rem'
			borderRadius='l2'
			border='default'
			padding='0.5rem'
			alignItems='start'
			flexDirection='column'
			justifyContent='space-between'
			background='white.a9'
			gap='0.25rem'
		>
			{meta?.mimeType.startsWith('image/') ? (
				<styled.img
					size='4.5rem'
					borderRadius='l1'
					src={url}
				/>
			) : (
				<FileIcon
					className={css({
						size: '4.5rem',
						marginBottom: 'auto',
						strokeWidth: '1',
						color: 'colorPalette.7',
					})}
				/>
			)}

			<VStack alignItems='start' gap='0' width='full'>
				<Text truncate maxW='full' textStyle='sm' fontWeight='medium'>
					{meta?.fileName}
				</Text>
				<Text textStyle='xs' color='fg.muted'>
					{fileSizeFormatter.format(meta?.totalSizeBytes ?? 0)}
				</Text>
			</VStack>
		</VStack>
	);
}
