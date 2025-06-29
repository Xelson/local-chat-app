import { connectLogger } from '@reatom/core';

if (import.meta.env.DEV)
	connectLogger();

import { createRoot } from 'react-dom/client';
import './index.css';
import { RootLayout } from '~/pages/root';
import { ChatPage } from '~/pages/chat';
import { lazy, Suspense } from 'react';
import { jazzAppInit } from '~/entities/account';
import { Center } from 'styled-system/jsx';
import { BrandLogo } from '~/entities/branding';
import { ToastsStream } from '~/shared/ui/toaster';

const InitializeJazz = lazy(async () => {
	await jazzAppInit();
	return { default: ({ children }) => children };
});

createRoot(document.body).render(
	<Suspense
		fallback={(
			<Center size='full'>
				<BrandLogo size='8rem' />
			</Center>
		)}
	>
		<InitializeJazz>
			<RootLayout>
				<ChatPage />
			</RootLayout>

			<ToastsStream />
		</InitializeJazz>
	</Suspense>,
);
