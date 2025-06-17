import { usePopover } from '@ark-ui/react/popover';
import { useCallback, useEffect, useRef, type RefObject } from 'react';

export const usePopoverSelection = (ref: RefObject<Element | null>) => {
	const latestSelectionRef = useRef('');

	const popover = usePopover({
		autoFocus: false,
		positioning: {
			placement: 'top',
			getAnchorRect() {
				const selection = ref.current?.ownerDocument.getSelection();
				if (!selection?.rangeCount) return null;
				const range = selection.getRangeAt(0);
				return range.getBoundingClientRect();
			},
		},
	});

	const hasSelectionWithin = useCallback((el?: Element | null) => {
		if (!el) return false;

		const selection = el.ownerDocument.getSelection();
		if (!selection?.rangeCount) return false;

		const range = selection.getRangeAt(0);
		return !range.collapsed && el.contains(range.commonAncestorContainer);
	}, []);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const doc = node.ownerDocument || document;

		const onMouseUp = () => {
			if (hasSelectionWithin(node)) {
				popover.reposition();
				popover.setOpen(true);

				latestSelectionRef.current = document.getSelection()?.toString() ?? '';
			}
		};

		const onSelect = () => {
			if (hasSelectionWithin(node)) {
				popover.reposition();
			}
			else {
				popover.setOpen(false);
			}
		};

		doc.addEventListener('mouseup', onMouseUp);
		doc.addEventListener('selectionchange', onSelect);

		return () => {
			doc.removeEventListener('mouseup', onMouseUp);
			doc.removeEventListener('selectionchange', onSelect);
		};
	}, [ref, popover, hasSelectionWithin]);

	const getLatestSelection = useCallback(() => latestSelectionRef.current, []);

	return { popover, getLatestSelection };
};
