import { createRoot } from 'react-dom/client';
import './index.css';
import { RootLayout } from '~/pages/root';
import { ChatPage } from '~/pages/chat';
import { connectLogger } from '@reatom/core';

connectLogger();

createRoot(document.body).render(
	<RootLayout>
		<ChatPage />
	</RootLayout>,
);
