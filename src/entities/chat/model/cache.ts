import { reatomMap } from '@reatom/core';
import type { ChatModel, ChatsListModel } from './chat';
import type { ChatMessageModel } from './chat-message';

export const chatsCache = reatomMap<string, ChatModel>(undefined, `_chatsCache`);
export const chatListsCache = reatomMap<string, ChatsListModel>(undefined, `_chatListsCache`);
export const messagesCache = reatomMap<string, ChatMessageModel>(undefined, `_messagesCache`);
