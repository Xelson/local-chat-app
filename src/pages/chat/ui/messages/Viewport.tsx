import { memo, wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { HStack, VStack } from 'styled-system/jsx';
import { editorFormVariable } from '../../model/editor-form';
import { type PropsWithChildren, useLayoutEffect, useRef, type RefObject } from 'react';
import { Popover } from '~/shared/ui/kit/components';
import { sidebarChatRoute } from '~/widgets/nav-sidebar';
import { QuoteIcon } from 'lucide-react';
import { usePopoverSelection } from '~/shared/ui/react-dom';
import { Portal } from '@ark-ui/react';

const useViewportScrollRestoration = (ref: RefObject<HTMLDivElement | null>) => {
	const chat = sidebarChatRoute.exact() ? sidebarChatRoute.loader.data()?.chat : undefined;

	useLayoutEffect(() => {
		const scrollableEl = ref.current;
		if (!chat || !scrollableEl)
			return;

		if (chat.lastScrollPosition)
			scrollableEl.scrollTop = chat.lastScrollPosition;

		const controller = new AbortController();

		scrollableEl.addEventListener('scroll', () => {
			chat.lastScrollPosition = scrollableEl.scrollTop;
		}, controller);

		return () => controller.abort();
	}, [ref, chat]);
};

export const MessagesViewport = reatomComponent(({ children }: PropsWithChildren) => {
	const model = editorFormVariable.get();
	const attachmentsPresent = memo(() => model.fields.attachments().size > 0);

	const scrollableRef = useRef<HTMLDivElement>(null);
	useViewportScrollRestoration(scrollableRef);
	const { popover, getLatestSelection } = usePopoverSelection(scrollableRef);

	const handleClickQuote = wrap((e) => {
		e.preventDefault();
		e.stopPropagation();

		const selection = getLatestSelection();
		if (!selection)
			return;

		const quotedFragment = selection
			.split('\n')
			.map(part => '> ' + part.trim())
			.join('\n');

		const contentField = model.fields.content;
		let currentContentValue = contentField.value();
		if (currentContentValue)
			currentContentValue += '\n';

		contentField.change(currentContentValue + quotedFragment);
	});

	return (
		<VStack
			ref={scrollableRef}
			height='auto'
			size='full'
			flexDirection='column-reverse'
			overflowY='auto'
			scrollbarWidth='none'
			marginTop='-1rem'
			paddingTop='1rem'
		>
			<VStack
				size='full'
				alignItems='start'
				height='auto'
				paddingBottom={attachmentsPresent ? '20rem' : '10rem'}
				transition='500ms padding ease'
				gap='1rem'
			>
				{children}
			</VStack>

			<Popover.RootProvider value={popover}>
				<Portal>
					<Popover.Positioner>
						<Popover.Content px='1rem'>
							<Popover.Arrow>
								<Popover.ArrowTip />
							</Popover.Arrow>

							<HStack
								cursor='pointer'
								fontWeight='medium'
								_icon={{ size: '1rem' }}
								onClick={handleClickQuote}
							>
								<QuoteIcon /> Quote
							</HStack>
						</Popover.Content>
					</Popover.Positioner>
				</Portal>
			</Popover.RootProvider>
		</VStack>
	);
});
