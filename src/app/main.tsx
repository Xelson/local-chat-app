import { createRoot } from 'react-dom/client';
import './index.css';
import { RootLayout } from '~/pages/root';
import { ChatPage } from '~/pages/chat';

import { openrouterApiKey } from '~/entities/account';
import { connectLogger } from '@reatom/core';

openrouterApiKey.subscribe(key => console.log(key));

connectLogger();

createRoot(document.body).render(
	<RootLayout>
		<ChatPage />
	</RootLayout>,
);
