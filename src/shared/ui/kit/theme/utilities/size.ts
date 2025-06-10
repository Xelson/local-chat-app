import { defineUtility } from '@pandacss/dev';

export const size = defineUtility({
	className: 'size',
	values: 'sizes',
	transform(value) {
		return {
			width: value,
			height: value,
		};
	},
});
