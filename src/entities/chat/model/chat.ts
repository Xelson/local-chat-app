import { atom, withConnectHook, computed, type Computed, reatomMap } from '@reatom/core';
import type { Account, AnonymousJazzAgent, co } from 'jazz-tools';
import { reatomChatBranchesList, type ChatBranchesModel } from './chat-branch';
import { reatomChatMessage, type ChatMessageModel } from './chat-message';
import { Chat, ChatsList } from './schema';

type ChatLoaded = co.loaded<typeof Chat>;

export type ChatModel = {
	id: string;
	name: Computed<string | undefined>;
	pinned: Computed<boolean | undefined>;
	lastMessage: Computed<ChatMessageModel | null | undefined>;
	messages: Computed<ChatMessageModel[]>;
	branches: Computed<ChatBranchesModel | null | undefined>;
	loaded: Computed<ChatLoaded | undefined>;
};

export const reatomChat = (
	id: string,
	{ loadAs, name }: { loadAs: Account | AnonymousJazzAgent; name: string },
) => {
	const loaded = atom<ChatLoaded | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => Chat.subscribe(id, { loadAs, resolve: { lastMessage: true } }, target.set)),
	);

	const nameAtom = computed(() => loaded()?.name, `${name}.role`);
	const pinned = computed(() => loaded()?.pinned, `${name}.pinned`);

	const branchesCache = reatomMap<string, ChatBranchesModel>(undefined, `${name}._branchesCache`);
	const getCachedBranch = (id: string) => (
		branchesCache.getOrCreate(id, () => reatomChatBranchesList(id, { loadAs, name: `${name}.branches.${id}` }))
	);

	const branches = computed(() => {
		const loadedBranches = loaded()?._refs.branches?.value;
		return loadedBranches ? getCachedBranch(loadedBranches.id) : loadedBranches;
	}, `${name}.branches`);

	const messagesCache = reatomMap<string, ChatMessageModel>(undefined, `${name}._branchesCache`);
	const getCachedMessage = (id: string) => (
		messagesCache.getOrCreate(id, () => reatomChatMessage(id, { loadAs, name: `${name}.messages.${id}` }))
	);

	const lastMessage = computed(() => {
		const loadedLast = loaded()?._refs.lastMessage?.value;
		return loadedLast ? getCachedMessage(loadedLast.id) : loadedLast;
	}, `${name}.prev`);

	const messages = computed(() => {
		const models: ChatMessageModel[] = [];

		for (
			let loadedLast = loaded()?._refs.lastMessage?.value;
			loadedLast;
			loadedLast = loadedLast?._refs.prev?.value
		) {
			models.push(getCachedMessage(loadedLast.id));
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

	const chatsCache = reatomMap<string, ChatModel>(undefined, `${name}._chatsCache`);
	const getCachedChat = (id: string) => (
		chatsCache.getOrCreate(id, () => reatomChat(id, { loadAs, name: `${name}.item.${id}` }))
	);

	const items = computed(() => {
		const refs = loaded()?._refs;
		const loadedItems = refs ? [...refs].map(ref => ref.value) : undefined;
		return loadedItems ? loadedItems.map(item => item ? getCachedChat(item.id) : item) : loadedItems;
	}, `${name}.items`);

	return {
		id,
		items,
		loaded,
	};
};
