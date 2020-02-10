import define from '../../../../define';
import { ReversiMatchings } from '../../../../../../models';

export const meta = {
	tags: ['games'],

	requireCredential: true
};

export default define(meta, async (ps, user) => {
	await ReversiMatchings.delete({
		parentId: user.id
	});
});
