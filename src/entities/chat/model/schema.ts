import { co, z, type CoListSchema } from 'jazz-tools';

export const ChatMessage = co.map({
	role: z.literal(['system', 'developer', 'user', 'assistant', 'tool']),
	content: co.plainText(),
	streaming: z.boolean(),
	get prev() { return ChatMessage.nullable(); },
});

export const Chat = co.map({
	name: z.string(),
	pinned: z.boolean(),
	lastMessage: ChatMessage,
	get branches() { return co.list(ChatBranch); },
});

export const ChatBranch = co.map({
	name: z.string(),
	lastMessage: ChatMessage,
	get branches(): CoListSchema<typeof ChatBranch> {
		return co.list(ChatBranch);
	},
});

export const ChatsList = co.list(Chat);
