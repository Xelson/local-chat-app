import { useCallback } from 'react';
import { wrap, type FieldAtom } from '@reatom/core';

export function useFormField<State, Value>(model: FieldAtom<State, Value>) {
	const setValue = wrap(model.change);
	const focus = wrap(model.focus.in);
	const blur = wrap(model.focus.out);
	const validation = model.validation();
	const value = model.value();
	const disabled = model.disabled();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const ref = useCallback(wrap((element: HTMLInputElement | HTMLTextAreaElement | null) => {
		model.elementRef.set(element ? element : undefined);
	}), [model]);

	const onBlur = useCallback(() => blur(), [blur]);
	const onFocus = useCallback(() => focus(), [focus]);

	const getFieldProps = useCallback(() => ({
		ref,
		disabled,
		onBlur,
		onFocus,
	}), [ref, disabled, onBlur, onFocus]);

	return {
		value,
		setValue,
		getFieldProps,
		...validation,
	};
}
