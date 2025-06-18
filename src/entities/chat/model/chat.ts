import { atom, withConnectHook, computed, type Computed, type Action } from '@reatom/core';
import type { Account, AnonymousJazzAgent, co } from 'jazz-tools';
import { reatomChatMessage, type ChatMessageModel } from './chat-message';
import { Chat, ChatsList } from './schema';
import { chatListsCache, chatsCache, messagesCache } from './cache';

type ChatLoaded = co.loaded<typeof Chat>;

export type ChatModel = {
	id: string;
	name: Computed<string | undefined> & { update: Action<[name: string], unknown> };
	pinned: Computed<boolean | undefined> & { update: Action<[pinned: boolean], unknown> };
	branch: Computed<boolean | undefined>;
	lastMessage: Computed<ChatMessageModel | null | undefined>;
	messages: Computed<ChatMessageModel[]>;
	completionRunning: Computed<boolean>;
	branches: Computed<ChatsListModel | null | undefined>;
	currentModelId: Computed<string | undefined>;
	loaded: Computed<ChatLoaded | undefined>;
	lastScrollPosition: number;
};

type LastMessageDeepLoad = {
	content: true;
	prev: LastMessageDeepLoad;
};

const lastMessageDeepLoad: LastMessageDeepLoad = {
	content: true,
	get prev() { return lastMessageDeepLoad; },
};

const branchesDeepLoad = {
	$each: {
		lastMessage: lastMessageDeepLoad,
		get branches() { return branchesDeepLoad; },
	},
};

export const reatomChat = (
	id: string,
	{ loadAs, name }: {
		loadAs: Account | AnonymousJazzAgent;
		name: string;
	},
): ChatModel => {
	const loaded = atom<ChatLoaded | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => (
			Chat.subscribe(id, {
				loadAs,
				resolve: { lastMessage: lastMessageDeepLoad },
			}, target.set)
		)),
	);

	const nameAtom = computed(() => loaded()?.name, `${name}.role`).actions({
		update: (name: string) => loaded()?.applyDiff({ name }),
	});

	const pinned = computed(() => loaded()?.pinned, `${name}.pinned`).actions({
		update: (pinned: boolean) => loaded()?.applyDiff({ pinned }),
	});

	const branch = computed(() => loaded()?.branch, `${name}.branch`);
	const currentModelId = computed(() => loaded()?.currentModelId, `${name}.currentModelId`);

	const getCachedBranches = (id: string) =>
		chatListsCache.getOrCreate(id, () => reatomChatsList(id, { name: `${name}.branch.${id}`, loadAs }));

	const branches = computed(() => {
		const loadedBranches = loaded()?._refs.branches?.value;
		return loadedBranches ? getCachedBranches(loadedBranches.id) : loadedBranches;
	}, `${name}.branches`);

	const getCachedMessage = (id: string) =>
		messagesCache.getOrCreate(id, () => reatomChatMessage(id, { name: `${name}.messages.${id}`, loadAs }));

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

		console.log('DEBUG', { id, modelsLength: models.length });

		return models.reverse();
	}, `${name}.messages`);

	const completionRunning = computed(() => {
		const messagesList = messages();
		return messagesList.some(message => !!message.streaming());
	}, `${name}.completionRunning`);

	return {
		id,
		name: nameAtom,
		pinned,
		branch,
		currentModelId,
		lastMessage,
		messages,
		completionRunning,
		branches,
		loaded,
		lastScrollPosition: 0,
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
	{ loadAs, name }: {
		loadAs: Account | AnonymousJazzAgent;
		name: string;
	},
): ChatsListModel => {
	const loaded = atom<ChatsLoaded | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => ChatsList.subscribe(id, { loadAs, resolve: branchesDeepLoad }, target.set)),
	);

	const getCachedChat = (id: string) =>
		chatsCache.getOrCreate(id, () => reatomChat(id, { name: `${name}.item.${id}`, loadAs }));

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
