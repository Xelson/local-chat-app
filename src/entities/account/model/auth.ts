import { atom, computed, noop, withConnectHook, withMiddleware } from '@reatom/core';
import { jazzContext } from './jazz-context';
import { account } from './account';

export const authenticated = atom(false).extend(
	withMiddleware(
		() => (_next, update) =>
			update === undefined ? jazzContext.authSecretStorage.isAuthenticated : update,
	),
	withConnectHook((target) => {
		target.set(jazzContext.authSecretStorage.isAuthenticated);
		return jazzContext.authSecretStorage.onUpdate(target.set);
	}),
);

const { passphraseAuth } = jazzContext;

export const currentPassphrase = atom(passphraseAuth.passphrase).extend(
	withConnectHook((target) => {
		passphraseAuth.loadCurrentAccountPassphrase().catch(noop);
		return passphraseAuth.subscribe(() => target.set(passphraseAuth.passphrase));
	}),
);

export const openrouterApiKey = computed(() => account()?.root.openrouterApiKey, 'openrouterApiKey');
