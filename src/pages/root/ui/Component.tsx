import { Box } from 'styled-system/jsx';
import type { PropsWithChildren } from 'react';

export function Component({ children }: PropsWithChildren) {
	return (
		<Box size='full' bg='gray.2' padding='1rem'>
			{children}
		</Box>
	);
}
