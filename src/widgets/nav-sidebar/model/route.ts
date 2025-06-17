import { reatomRoute } from '@reatom/core';
import { z } from 'zod/v4';
import { account } from '~/entities/account';
import { reatomChatsList } from '~/entities/chat';

export const sidebarRoute = reatomRoute({
	path: '',
	async loader() {
		const me = account();
		if (!me || !me.root?.chats)
			return;

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
		const loaderData = sidebarRoute.loader.data();
		if (!loaderData)
			return;

		const { chatsList } = loaderData;
		const chat = chatsList.items()?.find(chat => chat?.id === chatId);

		return { chat };
	},
});
