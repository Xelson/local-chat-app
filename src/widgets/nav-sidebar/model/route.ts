import { reatomRoute } from '@reatom/core';
import { z } from 'zod/v4';
import { jazzContext } from '~/entities/account';
import { reatomChatsList } from '~/entities/chat';

const { me } = jazzContext;

export const sidebarRoute = reatomRoute({
	path: '',
	async loader() {
		return {
			chatsList: reatomChatsList(me.root.chats.id, { loadAs: me, name: 'chats' }),
		};
	},
});

export const sidebarChatRoute = sidebarRoute.route({
	path: 'chats/:chatId',
	params: z.object({
		chatId: z.string(),
	}),
	async loader({ chatId }) {
		const { chatsList } = await sidebarRoute.loader();
		return { chat: chatsList.items()?.find(chat => chat?.id === chatId) };
	},
});
