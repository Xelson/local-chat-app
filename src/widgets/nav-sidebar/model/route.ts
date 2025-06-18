import { reatomRoute } from '@reatom/core';
import { z } from 'zod/v4';
import { account } from '~/entities/account';
import { reatomChatsList, type ChatModel, type ChatsListModel } from '~/entities/chat';

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

		const findChat = (list: ChatsListModel): ChatModel | undefined => {
			const items = list.items();
			if (!items)
				return;

			for (let item of items) {
				if (!item)
					continue;

				if (item.id === chatId)
					return item;

				const children = item.branches();
				if (children) {
					item = findChat(children);
					if (item)
						return item;
				}
			}
		};

		return { chat: findChat(loaderData.chatsList) };
	},
});
