import { reatomComponent } from '@reatom/react';
import { VStack } from 'styled-system/jsx';
import { sidebarRoute } from '../model/route';
import { Button, Heading, Skeleton } from '~/shared/ui/kit/components';
import { PlusIcon } from 'lucide-react';
import { BrandLogo } from '~/entities/branding';
import { type ChatModel } from '~/entities/chat';

export const Component = reatomComponent(() => {
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

	return (
		<Skeleton loading={!model} asChild>
			<Button
				variant='ghost'
				width='full'
				justifyContent='start'
			>
				{model?.name()}
			</Button>
		</Skeleton>
	);
});
