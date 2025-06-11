import { z } from 'jazz-tools';
import { AppAccount } from '~/entities/account';
import { createVanillaJazzApp } from '~/shared/lib/jazz';

const SYNC_URL = z.templateLiteral([z.enum(['ws://', 'wss://']), z.string()]).parse(
	import.meta.env.VITE_JAZZ_SYNC_URL,
	{ error: () => 'VITE_JAZZ_SYNC_URL is not defined or is not correct websocket url' },
);

export const jazzContext = createVanillaJazzApp({
	sync: { peer: SYNC_URL },
	AccountSchema: AppAccount,
});

declare module 'jazz-tools' {
	interface Register {
		Account: typeof AppAccount;
	}
}
