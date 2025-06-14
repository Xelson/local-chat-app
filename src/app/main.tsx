import { createRoot } from 'react-dom/client';
import './index.css';
import { RootLayout } from '~/pages/root';
import { ChatPage } from '~/pages/chat';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jazzContext } from '~/entities/account';
import { connectLogger } from '@reatom/core';

connectLogger();

createRoot(document.body).render(
	<RootLayout>
		<ChatPage />
	</RootLayout>,
);
