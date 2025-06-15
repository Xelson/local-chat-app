import { computed, withAsyncData, wrap } from '@reatom/core';
import { fetchModels } from '../api/fetch-models';
import { invariant } from '~/shared/lib/asserts';

export const modelsListQuery = computed(async () => {
	const { data, error } = await wrap(fetchModels());
	invariant(!error, `${error}`);

	return data;
}, 'modelsListQuery').extend(
	withAsyncData(),
	target => ({
		namesMap: computed(() => {
			const data = target.data();
			if (!data)
				return null;

			return new Map(data.map(item => [item.id, item.name]));
		}, `${target.name}.namesMap`),
	}),
);
