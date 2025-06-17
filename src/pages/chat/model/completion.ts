import { action, computed, take, withAsync, wrap } from '@reatom/core';
import { CoPlainText } from 'jazz-tools';
import { openrouterApiKey } from '~/entities/account';
import { ChatMessage, type ChatModel } from '~/entities/chat';
import { invariant } from '~/shared/lib/asserts';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { APICallError, streamText, type CoreMessage, type UserContent } from 'ai';
import type { co } from 'jazz-tools';
import { match } from 'ts-pattern';
import { FileStream } from 'jazz-tools';

const deepTake = <Return>(computer: () => Return) => take(computed(computer));

export const startCompletion = action(async (chat: ChatModel, modelId: string) => {
	const lastMessageCo
		= chat.lastMessage()?.loaded()
		?? await wrap(deepTake(() => chat.lastMessage()?.loaded()));

	invariant(lastMessageCo, 'lastMessage CO is not available');

	const chatCo = chat.loaded();
	invariant(chatCo, 'chat CO is not available');

	const apiKey = openrouterApiKey();
	invariant(apiKey, 'openrouter api key is not available');

	const chatMessages = chat.messages()
		.map(m => m.loaded())
		.filter((m): m is NonNullable<typeof m> => !!m);

	invariant(chatMessages.length > 0, 'chat messages list is empty');

	const streamingPlainText = CoPlainText.create('');

	const completionMessageCo = ChatMessage.create({
		role: 'assistant',
		attachments: [],
		answeredByModel: modelId,
		content: streamingPlainText,
		streaming: true,
		prev: lastMessageCo,
	});

	chatCo.lastMessage = completionMessageCo;

	const openrouter = createOpenRouter({ apiKey });

	try {
		const { fullStream } = streamText({
			model: openrouter(modelId),
			messages: await wrap(Promise.all(chatMessages.map(mapChatMessageToAiFormat))),
		});

		let position = 0;

		for await (const part of fullStream) {
			if (part.type === 'error') {
				if (part.error instanceof APICallError) {
					const body = JSON.parse(part.error.responseBody || '{}');
					throw new Error(body.error.message);
				}
			}
			else if (part.type === 'text-delta') {
				streamingPlainText.insertAfter(position, part.textDelta);
				position += part.textDelta.length;
			}
		}

		completionMessageCo.streaming = false;
	}
	catch (error) {
		chatCo.lastMessage = lastMessageCo;
		throw error;
	}
}, 'startCompletion').extend(withAsync());

const mapChatMessageToAiFormat = async (message: co.loaded<typeof ChatMessage>) => match(message)
	.returnType<Promise<CoreMessage>>()
	.with({ role: 'user' }, async () => {
		const text = message.content?.toString();

		if (!message.attachments.length) {
			invariant(text, 'empty chat message');
			return { role: 'user', content: text };
		}

		const content: UserContent = [];
		if (text)
			content.push({ type: 'text', text });

		const prepareAttachment = async (stream: FileStream) => {
			if (!stream?.toBlob)
				stream = await FileStream.load(stream.id) ?? stream;

			const blob = stream.toBlob();
			invariant(blob, `failed to convert attachment ${stream.id} to blob`);

			if (blob.type.startsWith('image/')) {
				content.push({
					type: 'image',
					image: await blob.arrayBuffer(),
				});
			}
			else {
				const meta = stream.getMetadata();
				content.push({
					type: 'file',
					data: await blob.arrayBuffer(),
					mimeType: meta?.mimeType ?? '*',
					filename: meta?.fileName,
				});
			}
		};

		await Promise.all(message.attachments.map(prepareAttachment));

		return { role: 'user', content };
	})
	.with({ role: 'assistant' }, async () => {
		const text = message.content?.toString();
		invariant(text, 'empty chat message');

		return { role: 'assistant', content: text };
	})
	.with({ role: 'system' }, async () => {
		const text = message.content?.toString();
		invariant(text, 'empty chat message');

		return { role: 'system', content: text };
	})
	.exhaustive();
