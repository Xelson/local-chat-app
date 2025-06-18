import { atom, withConnectHook } from '@reatom/core';
import { co, type ResolveQuery } from 'jazz-tools';
import { AppAccount } from './schema';
import { jazzContext } from './jazz-context';

const resolve: ResolveQuery<typeof AppAccount> = { profile: true, root: { chats: true } };

export const account = atom<co.loaded<typeof AppAccount, typeof resolve> | undefined>(undefined, 'account').extend(
	withConnectHook((target) => {
		jazzContext().me.subscribe({ resolve }, target.set);
	}),
);
