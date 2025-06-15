import { atom, withConnectHook, computed, type Computed } from '@reatom/core';
import type { Account, AnonymousJazzAgent, co } from 'jazz-tools';
import { reatomChatBranchesList } from './chat-branch';
import { reatomChatMessage, type ChatMessageModel } from './chat-message';
import { Chat, ChatsList } from './schema';

type ChatLoaded = co.loaded<typeof Chat>;

export type ChatModel = ReturnType<typeof reatomChat>;

export const reatomChat = (
	id: string,
	{ loadAs, name }: { loadAs: Account | AnonymousJazzAgent; name: string },
) => {
	const loaded = atom<ChatLoaded | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => Chat.subscribe(id, { loadAs, resolve: { lastMessage: true } }, target.set)),
	);

	const nameAtom = computed(() => loaded()?.name, `${name}.role`);
	const pinned = computed(() => loaded()?.pinned, `${name}.pinned`);
	const lastMessage = computed(() => {
		const loadedLast = loaded()?._refs.lastMessage?.value;

		return loadedLast
			? reatomChatMessage(loadedLast.id, { loadAs, name: `${name}.prev` })
			: loadedLast;
	}, `${name}.prev`);

	const branches = computed(() => {
		const loadedBranches = loaded()?._refs.branches?.value;

		return loadedBranches
			? reatomChatBranchesList(loadedBranches.id, { loadAs, name: `${name}.branches.${loadedBranches.id}` })
			: loadedBranches;
	}, `${name}.branches`);

	const messages = computed(() => {
		const models: ChatMessageModel[] = [];

		for (
			let loadedLast = loaded()?._refs.lastMessage?.value;
			loadedLast;
			loadedLast = loadedLast?._refs.prev?.value
		) {
			models.push(reatomChatMessage(loadedLast.id, { loadAs, name: `${name}.messages.${loadedLast.id}` }));
		}

		return models.reverse();
	}, `${name}.messages`);

	return {
		id,
		name: nameAtom,
		pinned,
		lastMessage,
		messages,
		branches,
		loaded,
	};
};

type ChatsLoaded = co.loaded<typeof ChatsList>;

export type ChatsListModel = {
	id: string;
	items: Computed<(ChatModel | null | undefined)[] | undefined>;
	loaded: Computed<ChatsLoaded | undefined>;
};

export const reatomChatsList = (
	id: string,
	{ loadAs, name }: { loadAs: Account | AnonymousJazzAgent; name: string },
): ChatsListModel => {
	const loaded = atom<ChatsLoaded | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => ChatsList.subscribe(id, { loadAs }, target.set)),
	);

	const items = computed(() => {
		const refs = loaded()?._refs;
		const loadedItems = refs ? [...refs].map(ref => ref.value) : undefined;

		return loadedItems ? loadedItems.map(item => (
			item ? reatomChat(item.id, { loadAs, name: `${name}.item.${item.id}` }) : item
		)) : loadedItems;
	}, `${name}.items`);

	return {
		id,
		items,
		loaded,
	};
};
