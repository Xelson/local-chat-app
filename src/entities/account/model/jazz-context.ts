import { computed, withAsyncData, wrap } from '@reatom/core';
import { z } from 'jazz-tools';
import { AppAccount } from '~/entities/account';
import { invariant } from '~/shared/lib/asserts';
import { createVanillaJazzApp } from '~/shared/lib/jazz';

const SYNC_URL = z.templateLiteral([z.enum(['ws://', 'wss://']), z.string()]).parse(
	import.meta.env.VITE_JAZZ_SYNC_URL,
	{ error: () => 'VITE_JAZZ_SYNC_URL is not defined or is not correct websocket url' },
);

export const jazzAppInit = computed(async () => {
	return wrap(createVanillaJazzApp({
		sync: { peer: SYNC_URL },
		AccountSchema: AppAccount,
	}));
}, 'jazzAppInit').extend(withAsyncData());

export const jazzContext = computed(() => {
	const context = jazzAppInit.data();
	invariant(context, 'Jazz context not initialized yet');
	return context;
});

declare module 'jazz-tools' {
	interface Register {
		Account: typeof AppAccount;
	}
}
