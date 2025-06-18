import { createRoot } from 'react-dom/client';
import './index.css';
import { RootLayout } from '~/pages/root';
import { ChatPage } from '~/pages/chat';
import { connectLogger } from '@reatom/core';
import { lazy, Suspense } from 'react';
import { jazzAppInit } from '~/entities/account';
import { Center } from 'styled-system/jsx';
import { BrandLogo } from '~/entities/branding';

connectLogger();

const InitializeJazz = lazy(async () => {
	await jazzAppInit();
	return { default: ({ children }) => children };
});

createRoot(document.body).render(
	<Suspense
		fallback={(
			<Center size='full'>
				<BrandLogo
					animation='spin'
					animationDuration='60s'
				/>
			</Center>
		)}
	>
		<InitializeJazz>
			<RootLayout>
				<ChatPage />
			</RootLayout>
		</InitializeJazz>
	</Suspense>,
);
