import { atom, withConnectHook, withMiddleware } from '@reatom/core';
import { jazzContext } from './jazz-context';

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
