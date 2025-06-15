import type { Account, AnonymousJazzAgent, co } from 'jazz-tools';
import { ChatBranch, ChatBranchesList } from './schema';
import { atom, computed, withConnectHook, type Computed, reatomMap } from '@reatom/core';
import { reatomChatMessage, type ChatMessageModel } from './chat-message';

type BranchLoaded = co.loaded<typeof ChatBranch>;

export type ChatBranchModel = {
	name: Computed<string | undefined>;
	lastMessage: Computed<ChatMessageModel | null | undefined>;
	branches: Computed<ChatBranchesModel | null | undefined>;
	loaded: Computed<BranchLoaded | undefined>;
};

export const reatomChatBranch = (
	id: string,
	{ loadAs, name }: { loadAs: Account | AnonymousJazzAgent; name: string },
): ChatBranchModel => {
	const loaded = atom<BranchLoaded | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => ChatBranch.subscribe(id, { loadAs }, target.set)),
	);

	const nameAtom = computed(() => loaded()?.name, `${name}.role`);

	const messagesCache = reatomMap<string, ChatMessageModel>(undefined, `${name}._messagesCache`);
	const getCachedMessage = (id: string) => (
		messagesCache.getOrCreate(id, () => reatomChatMessage(id, { loadAs, name: `${name}.prev.${id}` }))
	);

	const lastMessage = computed(() => {
		const loadedLast = loaded()?._refs.lastMessage?.value;
		return loadedLast ? getCachedMessage(loadedLast.id) : loadedLast;
	}, `${name}.prev`);

	const branchesCache = reatomMap<string, ChatBranchesModel>(undefined, `${name}._branchesCache`);
	const getCachedBranches = (id: string) => (
		branchesCache.getOrCreate(id, () => reatomChatBranchesList(id, { loadAs, name: `${name}.branches.${id}` }))
	);

	const branches = computed(() => {
		const loadedBranches = loaded()?._refs.branches?.value;
		return loadedBranches ? getCachedBranches(loadedBranches.id) : loadedBranches;
	}, `${name}.branches`);

	return {
		name: nameAtom,
		lastMessage,
		branches,
		loaded,
	};
};

type BranchesLoaded = co.loaded<typeof ChatBranchesList>;

export type ChatBranchesModel = {
	id: string;
	items: Computed<(ChatBranchModel | null | undefined)[] | undefined>;
	loaded: Computed<BranchesLoaded | undefined>;
};

export const reatomChatBranchesList = (
	id: string,
	{ loadAs, name }: { loadAs: Account | AnonymousJazzAgent; name: string },
): ChatBranchesModel => {
	const loaded = atom<BranchesLoaded | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => ChatBranchesList.subscribe(id, { loadAs }, target.set)),
	);

	const branchesCache = reatomMap<string, ChatBranchModel>(undefined, `${name}._branchesCache`);
	const getCachedBranch = (id: string) => (
		branchesCache.getOrCreate(id, () => reatomChatBranch(id, { loadAs, name: `${name}.item.${id}` }))
	);

	const items = computed(() => {
		const refs = loaded()?._refs;
		const loadedItems = refs ? [...refs].map(ref => ref.value) : undefined;

		return loadedItems ? loadedItems.map(item => (
			item ? getCachedBranch(item.id) : item
		)) : loadedItems;
	}, `${name}.items`);

	return {
		id,
		items,
		loaded,
	};
};
