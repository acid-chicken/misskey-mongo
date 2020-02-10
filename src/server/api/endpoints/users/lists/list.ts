import define from '../../../define';
import { UserLists } from '../../../../../models';

export const meta = {
	desc: {
		'ja-JP': '自分の作成したユーザーリスト一覧を取得します。'
	},

	tags: ['lists', 'account'],

	requireCredential: true,

	kind: 'read:account',

	res: {
		type: 'array' as const,
		optional: false as const, nullable: false as const,
		items: {
			type: 'object' as const,
			optional: false as const, nullable: false as const,
			ref: 'UserList',
		}
	},
};

export default define(meta, async (ps, me) => {
	const userLists = await UserLists.find({
		userId: me.id,
	});

	return await Promise.all(userLists.map(x => UserLists.pack(x)));
});
