import { wrap } from '@reatom/core';
import { reatomComponent } from '@reatom/react';
import { VStack, HStack } from 'styled-system/jsx';
import { Logo as BrandLogo } from '~/entities/branding/ui/Logo';
import { Heading, Text, Button } from '~/shared/ui/kit/components';
import { overlayPage } from '../../model/auth';

export const MainContent = reatomComponent(() => {
	const openSignIn = wrap(() => overlayPage.set('signIn'));
	const openSignUp = wrap(() => overlayPage.set('signUp'));

	return (
		<VStack gap='6'>
			<BrandLogo size='10rem' />

			<VStack gap='3' maxW='20rem' textAlign='center'>
				<Heading size='4xl'>First thing first</Heading>
				<Text color='fg.muted'>
					Log in or go through a short sign up to use the application.
				</Text>
			</VStack>

			<VStack w='full' maxW='20rem'>
				<HStack w='full' mt='6'>
					<Button variant='outline' flex='1' size='lg' onClick={openSignIn}>
						Log In
					</Button>
					<Button flex='1' size='lg' onClick={openSignUp}>
						Sign Up
					</Button>
				</HStack>
			</VStack>
		</VStack>
	);
});
