import { co, Group, z } from 'jazz-tools';
import { ChatsList } from '../@x/chat';

const AppRoot = co.map({
	chats: ChatsList,
	openrouterApiKey: z.string().optional(),
});

const AccountProfile = co.profile({
	name: z.string(),
	avatar: co.image().optional(),
});

export const AppAccount = co.account({
	root: AppRoot,
	profile: AccountProfile,
}).withMigration(async (account, creationProps) => {
	if (account.root === undefined) {
		account.root = AppRoot.create({
			chats: ChatsList.create([], Group.create()),
		});
	}

	if (account.profile === undefined) {
		const profileGroup = Group.create();
		profileGroup.makePublic();

		account.profile = AccountProfile.create({
			name: creationProps?.name ?? 'New user',
			avatar: undefined,
		}, profileGroup);
	}
});
