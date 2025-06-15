import { type RefObject, useEffect } from 'react';
import { useCallbackRef } from '../react/use-callback-ref';

interface UseScrollPaginationProps {
	loading: boolean;
	shouldObserve: boolean;
	onLoadMore(): void;
	threshold?: number;
	direction?: 'to-top' | 'to-bottom';
}

export function useScrollPagination<T extends HTMLElement = HTMLElement>(
	ref: RefObject<T | null> | (() => T),
	{ onLoadMore, shouldObserve, loading, threshold = 0.99, direction = 'to-bottom' }: UseScrollPaginationProps,
) {
	const cb = useCallbackRef(onLoadMore);
	const getTreshold = useCallbackRef(() => threshold);
	const getElement = useCallbackRef(() => typeof ref === 'function' ? ref() : ref.current, [typeof ref === 'function']);

	useEffect(() => {
		const element = getElement();
		if (!shouldObserve || loading || !element) return;

		let oldScroll = window.scrollY || document.documentElement.scrollTop;
		const flexDirMod = getComputedStyle(element).flexDirection == 'column-reverse' ? -1.0 : 1.0;

		const listener = () => {
			const scrollTop = element.scrollTop * flexDirMod;

			if (scrollTop == oldScroll) return;

			const curDir = scrollTop > oldScroll ? 'to-bottom' : 'to-top';
			oldScroll = scrollTop;

			if (curDir != direction)
				return;

			const threshold = getTreshold();

			if (direction == 'to-bottom') {
				if ((scrollTop + element.clientHeight) / element.scrollHeight > threshold)
					cb();
			}
			else if (scrollTop / element.scrollHeight < 1.0 - threshold)
				cb();
		};

		const eventTarget = element === document.scrollingElement ? window : element;
		eventTarget.addEventListener('scroll', listener);

		listener();

		return () => {
			eventTarget.removeEventListener('scroll', listener);
		};
	}, [ref, cb, shouldObserve, loading, getTreshold, direction, getElement]);
}
