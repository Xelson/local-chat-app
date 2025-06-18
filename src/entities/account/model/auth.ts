import { atom, computed, noop, withConnectHook, withMiddleware } from '@reatom/core';
import { jazzContext } from './jazz-context';
import { account } from './account';

export const authenticated = atom(false).extend(
	withMiddleware(
		() => (_next, update) =>
			update === undefined ? jazzContext().authSecretStorage.isAuthenticated : update,
	),
	withConnectHook((target) => {
		const context = jazzContext();
		target.set(context.authSecretStorage.isAuthenticated);
		return context.authSecretStorage.onUpdate(target.set);
	}),
);

export const currentPassphrase = atom(() => jazzContext().passphraseAuth.passphrase).extend(
	withConnectHook((target) => {
		const { passphraseAuth } = jazzContext();
		passphraseAuth.loadCurrentAccountPassphrase().catch(noop);
		return passphraseAuth.subscribe(() => target.set(passphraseAuth.passphrase));
	}),
);

export const openrouterApiKey = computed(() => account()?.root.openrouterApiKey, 'openrouterApiKey');
