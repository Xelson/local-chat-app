import { atom, withConnectHook } from '@reatom/core';
import { co, type Account, type AnonymousJazzAgent, type CoPlainText } from 'jazz-tools';

export type PlainTextModel = ReturnType<typeof reatomPlainText>;

export const reatomPlainText = (
	id: string,
	{ loadAs, name }: { loadAs: Account | AnonymousJazzAgent; name: string },
) => {
	return atom<CoPlainText | undefined>(undefined, `${name}.loaded`).extend(
		withConnectHook(target => co.plainText().subscribe(id, { loadAs }, target.set)),
	);
};
