import $ from 'cafy';
import define from '../../../define';
import { Emojis } from '../../../../../models';
import { toPuny } from '../../../../../misc/convert-host';
import { makePaginationQuery } from '../../../common/make-pagination-query';
import { ID } from '../../../../../misc/cafy-id';

export const meta = {
	desc: {
		'ja-JP': 'カスタム絵文字を取得します。'
	},

	tags: ['admin'],

	requireCredential: true,
	requireModerator: true,

	params: {
		host: {
			validator: $.optional.nullable.str,
			default: null as any
		},

		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		sinceId: {
			validator: $.optional.type(ID),
		},

		untilId: {
			validator: $.optional.type(ID),
		}
	}
};

export default define(meta, async (ps) => {
	const q = makePaginationQuery(Emojis.createQueryBuilder('emoji'), ps.sinceId, ps.untilId);

	if (ps.host == null) {
		q.andWhere(`emoji.host IS NOT NULL`);
	} else {
		q.andWhere(`emoji.host = :host`, { host: toPuny(ps.host) });
	}

	const emojis = await q
		.orderBy('emoji.category', 'ASC')
		.orderBy('emoji.name', 'ASC')
		.take(ps.limit!)
		.getMany();

	return emojis.map(e => ({
		id: e.id,
		name: e.name,
		category: e.category,
		aliases: e.aliases,
		host: e.host,
		url: e.url
	}));
});
