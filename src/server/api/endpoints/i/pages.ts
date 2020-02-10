import $ from 'cafy';
import { ID } from '../../../../misc/cafy-id';
import define from '../../define';
import { Pages } from '../../../../models';
import { makePaginationQuery } from '../../common/make-pagination-query';

export const meta = {
	desc: {
		'ja-JP': '自分の作成したページ一覧を取得します。',
		'en-US': 'Get my pages.'
	},

	tags: ['account', 'pages'],

	requireCredential: true,

	kind: 'read:pages',

	params: {
		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		sinceId: {
			validator: $.optional.type(ID),
		},

		untilId: {
			validator: $.optional.type(ID),
		},
	}
};

export default define(meta, async (ps, user) => {
	const query = makePaginationQuery(Pages.createQueryBuilder('page'), ps.sinceId, ps.untilId)
		.andWhere(`page.userId = :meId`, { meId: user.id });

	const pages = await query
		.take(ps.limit!)
		.getMany();

	return await Pages.packMany(pages);
});
