import { co, FileStream, type Account, type AnonymousJazzAgent, type ResolveQuery } from 'jazz-tools';
import { ChatMessage } from './schema';
import { atom, computed, withConnectHook, type Computed, reatomMap, withAsyncData, wrap } from '@reatom/core';
import { reatomPlainText, type PlainTextModel } from './jazz-primitives';
import { messagesCache } from './cache';

const resolve: ResolveQuery<typeof ChatMessage> = { content: true };
type Loaded = co.loaded<typeof ChatMessage, typeof resolve>;

export type ChatMessageModel = {
	id: string;
	role: Computed<Loaded['role'] | undefined>;
	streaming: Computed<Loaded['streaming'] | undefined>;
	answeredByModel: Computed<string | undefined>;
	content: Computed<{ text: PlainTextModel } | undefined | null>;
	attachments: Computed<(FileStream | null)[] | undefined>;
	prev: Computed<ChatMessageModel | undefined | null>;
	next: Computed<ChatMessageModel | undefined | null>;
	loaded: Computed<Loaded | undefined>;
	createdAt: Computed<Date | undefined>;
};

export const reatomChatMessage = (
	id: string,
	{ loadAs, name }: {
		loadAs: Account | AnonymousJazzAgent;
		name: string;
	},
): ChatMessageModel => {
	const loaded = atom<Loaded | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => ChatMessage.subscribe(id, { loadAs, resolve }, target.set)),
	);

	const role = computed(() => loaded()?.role, `${name}.role`);
	const streaming = computed(() => loaded()?.streaming, `${name}.streaming`);
	const answeredByModel = computed(() => loaded()?.answeredByModel, `${name}.answeredByModel`);

	const getCachedMessage = (id: string) =>
		messagesCache.getOrCreate(id, () => reatomChatMessage(id, { name: `${name}.messages.${id}`, loadAs }));

	const prev = computed(() => {
		const loadedPrev = loaded()?._refs.prev?.value;
		return loadedPrev ? getCachedMessage(loadedPrev.id) : loadedPrev;
	}, `${name}.prev`);

	const next = computed(() => {
		const loadedNext = loaded()?._refs.next?.value;
		return loadedNext ? getCachedMessage(loadedNext.id) : loadedNext;
	}, `${name}.next`);

	const plainTextCache = reatomMap<string, PlainTextModel>(undefined, `${name}._plainTextCache`);
	const getCachedPlainText = (id: string) => (
		plainTextCache.getOrCreate(id, () => reatomPlainText(id, { loadAs, name: `${name}.content.${id}` }))
	);

	const content = computed(() => {
		const loadedContent = loaded()?.content;
		return loadedContent ? { text: getCachedPlainText(loadedContent.id) } : loadedContent;
	}, `${name}.content`);

	const syncAttachments = computed(async () => {
		const streams = loaded()?.attachments;
		if (!streams)
			return;

		return wrap(Promise.all(streams.map(s => FileStream.load(s.id, { loadAs }))));
	}, `${name}.syncAttachments`).extend(withAsyncData());

	const attachments = syncAttachments.data;

	const createdAt = computed(() => {
		const createdAt = loaded()?._createdAt;
		return createdAt ? new Date(createdAt) : undefined;
	}, `${name}.createdAt`);

	return {
		id,
		role,
		content,
		attachments,
		streaming,
		answeredByModel,
		prev,
		next,
		createdAt,
		loaded,
	};
};
