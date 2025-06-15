import { assign, atom, computed, reatomForm, variable, withAsyncData, withCallHook, wrap } from '@reatom/core';
import type { Account, Group } from 'jazz-tools';
import { co, CoPlainText } from 'jazz-tools';
import { jazzContext } from '~/entities/account';
import { Chat, ChatBranchesList, ChatMessage } from '~/entities/chat';
import { invariant } from '~/shared/lib/asserts';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';

export type EditorFormModel = ReturnType<typeof reatomEditorForm>;

export const reatomEditorForm = (owner: Account | Group, name: string) => {
	const form = reatomForm({
		content: '',
		attachments: new Array<File>(),
	}, {
		name,
		validateOnChange: true,
		onSubmit: async ({ content, attachments }) => {
			const matched = sidebarChatRoute.exact();
			if (!matched) {
				const message = ChatMessage.create({
					content: CoPlainText.create(content, { owner }),
					role: 'user',
					streaming: false,
					prev: undefined,
				});

				const chat = Chat.create({
					name: content.slice(0, 64),
					branches: ChatBranchesList.create([], { owner }),
					lastMessage: message,
					pinned: false,
				});

				jazzContext.me.root.chats.push(chat);

				sidebarChatRoute.go({ chatId: chat.id });
			}
			else {
				const data = sidebarChatRoute.loader.data();
				const currentChat = data?.chat;

				invariant(currentChat !== undefined, 'Chat is not loaded yet');
				invariant(currentChat !== null, 'Chat is not available');

				const co = currentChat.loaded();
				invariant(co?.lastMessage, 'Cannot fetch lastMessage of the chat');

				const message = ChatMessage.create({
					content: CoPlainText.create(content, { owner }),
					role: 'user',
					streaming: false,
					prev: co.lastMessage,
				});

				if (co)
					co.lastMessage = message;
			}
		},
	});

	form.submit.onFulfill.extend(
		withCallHook(() => {
			form.fields.content.elementRef()?.focus();
		}),
	);

	return assign(form, {
		attachmentModels: computed(() => form.fields.attachments
			.array()
			.map(file => reatomAttachmentModel(file.value(), { owner, name: `${name}.attachmentModels` })),
		),
	});
};

const reatomAttachmentModel = (
	file: File,
	{ name, owner }: { name: string; owner: Account | Group },
) => {
	const uploadProgress = atom(0, `${name}.uploadProgress`);

	const stream = atom(async () => {
		const data = await wrap(
			co.fileStream().createFromBlob(file, {
				owner,
				onProgress: progress => uploadProgress.set(progress),
			}),
		);
		return data;
	}, `${name}.stream`).extend(
		withAsyncData(),
	);

	return {
		stream,
	};
};

export const editorFormVariable = variable<EditorFormModel>('editorForm');
