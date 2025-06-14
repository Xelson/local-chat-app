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

	return (
		<VStack
			size='full'
			flexDirection='column-reverse'
		>
			<VStack
				size='full'
				alignItems='start'
			>
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

const ContentRenderer = reatomComponent(({ model }: { model: AtomLike<string> }) => {
	const result = useMemo(() => {
		// Here domain code contains logic that should be in withAbort('first-in-win') for simple throttling implementation.
		// But this version of reatom is in alpha, so we're waiting for implementation

		const trailing = atom(false, 'contentRenderer.trailing');

		const renderText = computed(async () => {
			const content = model();
			if (peek(trailing)) throwAbort();

			try {
				trailing.set(true);

				const wait = sleep(150);
				const html = await wrap(md.renderAsync(content));
				await wrap(wait);

				return html;
			}
			finally {
				trailing.set(false);
			}
		}, 'contentRenderer.renderText').extend(
			withAsync(),
		);

		const data = atom('', 'contentRenderer.data').extend(
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
