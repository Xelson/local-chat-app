import { co, z, type CoListSchema } from 'jazz-tools';

export const ChatMessage = co.map({
	role: z.literal(['system', 'user', 'assistant']),
	content: co.plainText(),
	streaming: z.literal(['starting', 'completing', 'done']),
	answeredByModel: z.string().optional(),
	attachments: z.array(co.fileStream()),
	get prev() { return ChatMessage.optional(); },
	get next() { return ChatMessage.optional(); },
});

export const Chat = co.map({
	name: z.string(),
	pinned: z.boolean(),
	branch: z.boolean(),
	lastMessage: ChatMessage,
	currentModelId: z.string(),
	get branches(): CoListSchema<typeof Chat> { return ChatsList; },
});

export const ChatsList = co.list(Chat);
