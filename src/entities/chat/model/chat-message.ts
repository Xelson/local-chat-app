import { co, CoPlainText, type Account, type AnonymousJazzAgent } from 'jazz-tools';
import { ChatMessage } from './schema';
import { atom, computed, withConnectHook, type Computed, reatomMap } from '@reatom/core';

type PlainTextModel = ReturnType<typeof reatomPlainText>;

export const reatomPlainText = (
	id: string,
	{ loadAs, name }: { loadAs: Account | AnonymousJazzAgent; name: string },
) => {
	return atom<CoPlainText | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => co.plainText().subscribe(id, { loadAs }, target.set)),
	);
};

type Loaded = co.loaded<typeof ChatMessage>;

export type ChatMessageModel = {
	id: string;
	role: Computed<Loaded['role'] | undefined>;
	streaming: Computed<Loaded['streaming'] | undefined>;
	answeredBy: Computed<string | undefined>;

	content: Computed<{ text: PlainTextModel } | undefined | null>;
	prev: Computed<ChatMessageModel | undefined | null>;
	loaded: Computed<Loaded | undefined>;
};

export const reatomChatMessage = (
	id: string,
	{ loadAs, name }: { loadAs: Account | AnonymousJazzAgent; name: string },
): ChatMessageModel => {
	const loaded = atom<Loaded | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => ChatMessage.subscribe(id, { loadAs }, target.set)),
	);

	const role = computed(() => loaded()?.role, `${name}.role`);
	const streaming = computed(() => loaded()?.streaming, `${name}.streaming`);
	const answeredBy = computed(() => loaded()?.answeredBy, `${name}.answeredBy`);

	const messagesCache = reatomMap<string, ChatMessageModel>(undefined, `${name}._messagesCache`);
	const getCachedMessage = (id: string) => (
		messagesCache.getOrCreate(id, () => reatomChatMessage(id, { loadAs, name: `${name}.prev.${id}` }))
	);

	const prev = computed(() => {
		const loadedPrev = loaded()?._refs.prev?.value;
		return loadedPrev ? getCachedMessage(loadedPrev.id) : loadedPrev;
	}, `${name}.prev`);

	const plainTextCache = reatomMap<string, PlainTextModel>(undefined, `${name}._plainTextCache`);
	const getCachedPlainText = (id: string) => (
		plainTextCache.getOrCreate(id, () => reatomPlainText(id, { loadAs, name: `${name}.content.${id}` }))
	);

	const content = computed(() => {
		const loadedContent = loaded()?.content;
		return loadedContent ? { text: getCachedPlainText(loadedContent.id) } : loadedContent;
	}, `${name}.content`);

	return {
		id,
		role,
		content,
		streaming,
		answeredBy,
		prev,
		loaded,
	};
};
