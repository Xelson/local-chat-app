import { reatomComponent } from '@reatom/react';
import { VStack } from 'styled-system/jsx';
import { sidebarRoute } from '../model/route';
import { Button, Heading, Text } from '~/shared/ui/kit/components';
import { PlusIcon } from 'lucide-react';
import { BrandLogo } from '~/entities/branding';

export const Component = reatomComponent(() => {
	const loaderData = sidebarRoute.loader.data();

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

			{!loaderData ? (
				'loading...'
			) : (
				loaderData.map(chat => <Text key={chat}>chat</Text>)
			)}
		</VStack>
	);
});
