import { co, z, type CoListSchema } from 'jazz-tools';

export const ChatMessage = co.map({
	role: z.literal(['system', 'developer', 'user', 'assistant', 'tool']),
	content: co.plainText(),
	streaming: z.boolean(),
	answeredByModel: z.string().optional(),
	attachments: z.array(co.fileStream()),
	get prev() { return ChatMessage.optional(); },
});

export const Chat = co.map({
	name: z.string(),
	pinned: z.boolean(),
	lastMessage: ChatMessage,
	currentModelId: z.string(),
	get branches() { return ChatBranchesList; },
});

export const ChatBranch = co.map({
	name: z.string(),
	lastMessage: ChatMessage,
	get branches(): CoListSchema<typeof ChatBranch> {
		return ChatBranchesList;
	},
});

export const ChatBranchesList = co.list(ChatBranch);

export const ChatsList = co.list(Chat);
