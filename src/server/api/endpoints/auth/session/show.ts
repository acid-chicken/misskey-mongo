import $ from 'cafy';
import define from '../../../define';
import { ApiError } from '../../../error';
import { AuthSessions } from '../../../../../models';

export const meta = {
	tags: ['auth'],

	requireCredential: false,

	params: {
		token: {
			validator: $.str,
			desc: {
				'ja-JP': 'セッションのトークン',
				'en-US': 'The token of a session.'
			}
		}
	},

	errors: {
		noSuchSession: {
			message: 'No such session.',
			code: 'NO_SUCH_SESSION',
			id: 'bd72c97d-eba7-4adb-a467-f171b8847250'
		}
	}
};

export default define(meta, async (ps, user) => {
	// Lookup session
	const session = await AuthSessions.findOne({
		token: ps.token
	});

	if (session == null) {
		throw new ApiError(meta.errors.noSuchSession);
	}

	return await AuthSessions.pack(session, user);
});
