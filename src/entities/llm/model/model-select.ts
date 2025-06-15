import { assign, atom, computed, reatomNumber, sleep, withAsyncData, wrap } from '@reatom/core';
import { modelsListQuery } from './models-list';

type ModelsSelectOptions = {
	limit?: number;
};

export type ModelsSelectModel = ReturnType<typeof reatomModelsSelect>;

export const reatomModelsSelect = (options: ModelsSelectOptions = {}, name: string) => {
	const limit = reatomNumber(options.limit ?? Infinity, `${name}.limit`);
	const search = atom('', `${name}.search`);
	const total = computed(() => modelsListQuery.data()?.length, `${name}.total`);

	const results = computed(async () => {
		const lim = limit();
		const searchQuery = search().toLowerCase();
		const selectedId = selectedModelId();

		await wrap(sleep(300));

		const data = modelsListQuery.data();
		if (data && selectedId !== null) {
			const elementIndex = data.findIndex(item => item.id === selectedId);
			if (elementIndex != -1) {
				const [element] = data.splice(elementIndex, 1);
				data.unshift(element);
			}
		}

		return data
			?.filter(item => (
				item.name.toLowerCase().includes(searchQuery)
				|| item.description.toLowerCase().includes(searchQuery)
			))
			.slice(0, lim);
	}, `${name}.filteredQuery`).extend(
		withAsyncData(),
	);

	const selectedModelId = atom<string | null>(null, `${name}.selectedModelId`);

	return assign(results, {
		search,
		limit,
		total,
		selectedModelId,
	});
};
