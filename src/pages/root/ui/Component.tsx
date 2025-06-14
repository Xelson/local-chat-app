import { Box, HStack, styled, VStack } from 'styled-system/jsx';
import { type PropsWithChildren } from 'react';
import { Presence } from '@ark-ui/react';
import { reatomComponent } from '@reatom/react';
import { authenticated } from '~/entities/account';
import { BrandLogo } from '~/entities/branding';
import { Button, Heading, Text } from '~/shared/ui/kit/components';
import { reatomBoolean } from '@reatom/core';

export function Component({ children }: PropsWithChildren) {
	return (
		<Box
			position='relative'
			size='full'
			bg='gray.2'
			padding='1rem'
		>
			{children}

			<AuthOverlay />
		</Box>
	);
}

const StyledPresence = styled(Presence);

const closed = reatomBoolean(false, `authOverlayClosed`);

const AuthOverlay = reatomComponent(() => {
	return (
		<StyledPresence
			present={!closed() && !authenticated()}
			display='flex'
			alignItems='center'
			justifyContent='center'
			flexDir='column'
			gap='6'
			position='fixed'
			inset='0'
			backdropFilter='blur(1rem)'
			backgroundColor='white/5'
			_closed={{ animation: 'fade-out' }}
		>
			<BrandLogo size='10rem' />

			<VStack gap='3' maxW='20rem' textAlign='center'>
				<Heading size='4xl'>First thing first</Heading>
				<Text color='fg.muted'>
					Log in or go through a short sign up to use the application.
				</Text>
			</VStack>

			<VStack w='full' maxW='20rem'>
				<HStack w='full' mt='6'>
					<Button variant='outline' flex='1' size='lg'>Log In</Button>
					<Button flex='1' size='lg'>Sign Up</Button>
				</HStack>

				<Button
					variant='ghost'
					width='full'
					size='lg'
					color='gray.10'
					fontWeight='400'
					onClick={() => closed.setTrue()}
				>
					Continue anonymously
				</Button>
			</VStack>
		</StyledPresence>
	);
});
