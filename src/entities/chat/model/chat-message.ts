import { co, CoPlainText, type Account, type AnonymousJazzAgent } from 'jazz-tools';
import { ChatMessage } from './schema';
import { atom, computed, withConnectHook, type Computed } from '@reatom/core';

type PlainTextModel = ReturnType<typeof reatomPlainText>;

const reatomPlainText = (
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
	const prev = computed(() => {
		const loadedPrev = loaded()?._refs.prev?.value;

		return loadedPrev
			? reatomChatMessage(loadedPrev.id, { loadAs, name: `${name}.prev.${loadedPrev.id}` })
			: loadedPrev;
	}, `${name}.prev`);

	const content = computed(() => {
		const loadedContent = loaded()?.content;

		return loadedContent
			? { text: reatomPlainText(loadedContent.id, { loadAs, name: `${name}.content.${loadedContent.id}` }) }
			: loadedContent;
	}, `${name}.content`);

	return {
		id,
		role,
		content,
		streaming,
		prev,
		loaded,
	};
};
