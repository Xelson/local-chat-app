import { reatomComponent } from '@reatom/react';
import { styled, VStack } from 'styled-system/jsx';
import { sidebarChatRoute, sidebarRoute } from '../model/route';
import { Button, Heading, Skeleton } from '~/shared/ui/kit/components';
import { PlusIcon } from 'lucide-react';
import { BrandLogo } from '~/entities/branding';
import { type ChatModel } from '~/entities/chat';
import { wrap } from '@reatom/core';

interface ComponentProps {
	onClickAddChat?: () => void;
}

export const Component = reatomComponent(({ onClickAddChat }: ComponentProps) => {
	const loaderData = sidebarRoute.loader.data();
	const chatItems = loaderData?.chatsList.items();

	return (
		<VStack
			alignItems='start'
			border='default'
			borderColor='border.subtle'
			borderRadius='l3'
			padding='1rem'
			height='full'
			backgroundColor='white/80'
			backdropFilter='blur(3rem)'
			gap='1rem'
			width='14.5rem'
			flexShrink='0'
		>
			<Heading size='xl'>
				<BrandLogo size='2rem' />
			</Heading>

			<Button
				variant='subtle'
				colorPalette='purple'
				width='full'
				borderRadius='l2'
				onClick={onClickAddChat}
			>
				<PlusIcon /> New chat
			</Button>

			<VStack
				width='full'
				alignItems='start'
				maskImage={!chatItems ? 'linear-gradient(to bottom, #000 20%, #0000 70%)' : undefined}
			>
				{chatItems?.map((model, index) => (
					<ChatItem key={model?.id ?? index} model={model} />
				)) ?? (
					Array.from({ length: 4 }).map((_, index) => (
						<ChatItem key={index} model={undefined} />
					))
				)}
			</VStack>
		</VStack>
	);
});

const ChatItem = reatomComponent(({ model }: { model: ChatModel | null | undefined }) => {
	if (model === null)
		return null;

	const selected = sidebarChatRoute()?.chatId === model?.id;
	const navigate = wrap(sidebarChatRoute.go);

	const handleClick = () => {
		if (!model)
			return;

		navigate({ chatId: model.id });
	};

	return (
		<Skeleton loading={!model} asChild>
			<Button
				variant='ghost'
				width='full'
				justifyContent='start'
				data-selected={selected ? 'true' : undefined}
				onClick={handleClick}
				maxWidth='full'
			>
				<styled.span truncate>{model?.name()}</styled.span>
			</Button>
		</Skeleton>
	);
});
