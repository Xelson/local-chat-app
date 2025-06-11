import { co, z } from 'jazz-tools';
import { ChatsList } from '../@x/chat';

const AppRoot = co.map({
	chats: ChatsList,
});

const AccountProfile = co.profile({
	name: z.string(),
	avatar: co.image().optional(),
});

export const AppAccount = co.account({
	root: AppRoot,
	profile: AccountProfile,
}).withMigration(async (account) => {
	if (!account.root) {
		account.root = AppRoot.create({
			chats: ChatsList.create([], { owner: account }),
		});
	}
});
