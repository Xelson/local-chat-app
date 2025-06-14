import { useCallback } from 'react';
import { wrap, type FieldAtom } from '@reatom/core';

export function useFormField<State, Value>(model: FieldAtom<State, Value>) {
	const setValue = wrap(model.change);
	const focus = wrap(model.focus.in);
	const blur = wrap(model.focus.out);
	const validation = model.validation();
	const value = model.value();
	const disabled = model.disabled();
	const setElementRef = wrap(model.elementRef.set);

	const ref = useCallback((element: HTMLElement | null) => {
		setElementRef(element ? element : undefined);
	}, [setElementRef]);

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
