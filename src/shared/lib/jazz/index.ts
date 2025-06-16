import { type JazzContextManagerProps, JazzBrowserContextManager } from 'jazz-browser';
import { type AccountClass, type Account, type CoValueFromRaw, type AnyAccountSchema, PassphraseAuth } from 'jazz-tools';
import { invariant } from '../asserts';
import wordsList from './words-list.json';

export async function createVanillaJazzApp<
	S extends
	| (AccountClass<Account> & CoValueFromRaw<Account>)
	| AnyAccountSchema,
>(opts: Pick<JazzContextManagerProps<S>, 'sync' | 'AccountSchema'>) {
	const contextManager = new JazzBrowserContextManager<S>();

	await contextManager.createContext({
		guestMode: false,
		...opts,
	});

	const context = contextManager.getCurrentValue();
	invariant(context && 'me' in context, 'Failed to get me from jazz context');

	const authSecretStorage = contextManager.getAuthSecretStorage();

	return {
		me: context.me,
		context,
		logOut: contextManager.logOut,
		authSecretStorage,
		wordsListSet: new Set(wordsList),
		passphraseAuth: new PassphraseAuth(
			context.node.crypto,
			context.authenticate,
			context.register,
			authSecretStorage,
			wordsList,
		),
	};
}
