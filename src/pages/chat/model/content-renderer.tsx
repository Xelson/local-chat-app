import {
	type AtomLike,
	atom,
	computed,
	peek,
	throwAbort,
	sleep,
	wrap,
	withAsync,
	withComputed,
	noop,
	getCalls,
	withCallHook,
} from '@reatom/core';

import { fromAsyncCodeToHtml } from '@shikijs/markdown-it/async';
import MarkdownItAsync from 'markdown-it-async';
import { codeToHtml } from 'shiki';
import type { CoPlainText } from 'jazz-tools';
import { transformerAddCopyButton } from '../ui/shiki-transformers';

export const md = MarkdownItAsync();

md.use(
	fromAsyncCodeToHtml(codeToHtml, {
		themes: {
			light: 'vitesse-light',
			dark: 'vitesse-dark',
		},
		transformers: [
			transformerAddCopyButton,
		],
	}),
);

export type ContentRenderer = ReturnType<typeof reatomContentRenderer>;
export type ContentRendererInput = AtomLike<CoPlainText | string | undefined>;

export const reatomContentRenderer = (input: ContentRendererInput, name: string) => {
	// Here domain code contains logic that should be in withAbort('first-in-win') for simple throttling implementation.
	// But this version of reatom is in alpha, so we're waiting for implementation
	const trailing = atom(false, `${name}.trailing`);

	const renderText = computed(async () => {
		const content = input();
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
	}, `${name}.renderText`).extend(
		withAsync(),
	);

	const data = atom<string | undefined>(undefined, `${name}.data`).extend(
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
};
