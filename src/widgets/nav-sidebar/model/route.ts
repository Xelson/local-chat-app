import { route } from '@reatom/core';
import { z } from 'zod/v4';

export const sidebarRoute = route({
	path: '',
	async loader() {
		return ['Chat 1', 'Chat 2', 'Chat 3'];
	},
});

export const sidebarChatRoute = sidebarRoute.route({
	path: 'chats/:chatId',
	params: z.object({
		chatId: z.string(),
	}),
	async loader() {
		return { message: 'chat content' };
	},
});
