import { Box } from 'styled-system/jsx';
import { type PropsWithChildren } from 'react';
import { AuthOverlay } from './auth/Overlay';

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
