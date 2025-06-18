import type { ChatsListModel } from '~/entities/chat';
import { sidebarChatRoute, sidebarRoute } from './route';

export const deleteChat = (chatsListModel: ChatsListModel, id: string) => {
	const co = chatsListModel.loaded();
	if (!co)
		return false;

	const chatIndex = co.findIndex(item => item?.id === id);
	if (chatIndex !== -1)
		co.splice(chatIndex, 1);

	if (sidebarChatRoute()?.chatId === id) {
		sidebarRoute.go();
		return true;
	}

	return false;
};
