import {
	assign,
	atom,
	computed,
	experimental_fieldArray,
	reatomField,
	reatomForm,
	reatomMap,
	variable,
	withAsyncData,
	withCallHook,
	withChangeHook,
	withComputed,
	wrap,
} from '@reatom/core';

import type { Account, Group } from 'jazz-tools';
import { co, CoPlainText } from 'jazz-tools';
import { account, jazzContext } from '~/entities/account';
import { Chat, ChatBranchesList, ChatMessage } from '~/entities/chat';
import { modelsListQuery } from '~/entities/llm';
import { invariant } from '~/shared/lib/asserts';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';
import type { Modality } from '../api/fetch-models';

export type EditorFormModel = ReturnType<typeof reatomEditorForm>;

export const reatomEditorForm = (owner: Account | Group, name: string) => {
	const form = reatomForm({
		content: '',
		modelId: '',
		attachments: experimental_fieldArray((param: File, name) => reatomField<File>(param, name)),
	}, {
		name,
		validateOnChange: true,
		onSubmit: async ({ modelId, content }) => {
			const matched = sidebarChatRoute.exact();
			const attachmentStreams = attachmentModels()
				.map(m => m.stream.data())
				.filter((item): item is NonNullable<typeof item> => !!item);

			if (!matched) {
				const message = ChatMessage.create({
					content: CoPlainText.create(content, { owner }),
					role: 'user',
					streaming: false,
					prev: undefined,
					attachments: attachmentStreams,
				});

				const chat = Chat.create({
					name: content.slice(0, 64),
					branches: ChatBranchesList.create([], { owner }),
					lastMessage: message,
					pinned: false,
					currentModelId: modelId,
				});

				account()?.root.chats?.push(chat);

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
					attachments: attachmentStreams,
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

	form.fields.modelId.extend(
		withComputed((state) => {
			if (sidebarChatRoute.exact()) {
				const currentModelId = sidebarChatRoute.loader.data()?.chat?.currentModelId();
				if (currentModelId)
					return currentModelId;
			}
			if (!state) {
				const availableModels = modelsListQuery.data();
				if (availableModels?.[0])
					return availableModels[0].id;
			}

			return state;
		}),
		withChangeHook((newValue) => {
			const currentChatCo = sidebarChatRoute.loader.data()?.chat?.loaded();
			if (currentChatCo)
				currentChatCo.currentModelId = newValue;
		}),
	);

	const fileModelsCache = reatomMap<File, AttachmentModel>(undefined, `${name}._fileModelsCache`);

	const attachmentModels = computed(() => form.fields.attachments.array().map((model) => {
		const file = model.value();
		return fileModelsCache.getOrCreate(file, () => (
			reatomAttachmentModel(file, { owner, name: `${name}.attachmentModels` })
		));
	}), `${name}.attachmentModels`);

	const supportedInputModalities = computed(() => {
		const modelId = form.fields.modelId.value();
		return modelsListQuery.data()?.find(item => item.id === modelId)?.architecture.input_modalities;
	}, `${name}.supportedInputModalities`);

	const usedModalities = computed(() => {
		const attachments = form.fields.attachments.array();
		const modalities: Modality[] = [];

		attachments.forEach((model) => {
			const mimeType = model().type;
			if (mimeType.match('image/*')) modalities.push('image');
			else modalities.push('file');
		});

		if (form.fields.content.value())
			modalities.push('text');

		return modalities;
	}, `${name}.usedModalities`);

	return assign(form, {
		attachmentModels,
		supportedInputModalities,
		usedModalities,
	});
};

export type AttachmentModel = ReturnType<typeof reatomAttachmentModel>;

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
		file,
		stream,
		name,
		uploadProgress,
	};
};

export const editorFormVariable = variable<EditorFormModel>('editorForm');
