import { Presence } from '@ark-ui/react';
import { reatomComponent } from '@reatom/react';
import { styled } from 'styled-system/jsx';
import { authenticated } from '~/entities/account';
import { overlayPage } from '../../model/auth';
import { match } from 'ts-pattern';
import { MainContent } from './MainContent';
import { SignUpContent } from './SignUpContent';
import { SignInContent } from './SignInContent';

const StyledPresence = styled(Presence);

export const AuthOverlay = reatomComponent(() => {
	const open = !authenticated();

	return (
		<StyledPresence
			present={open}
			display='flex'
			alignItems='center'
			justifyContent='center'
			flexDir='column'
			position='fixed'
			inset='0'
			zIndex='modal'
			backdropFilter='blur(1rem)'
			backgroundColor='white/5'
			_closed={{ animation: 'fade-out' }}
			lazyMount
			unmountOnExit
		>
			{match(overlayPage())
				.with('signIn', () => <SignInContent />)
				.with('signUp', () => <SignUpContent />)
				.otherwise(() => <MainContent />)}
		</StyledPresence>
	);
});
