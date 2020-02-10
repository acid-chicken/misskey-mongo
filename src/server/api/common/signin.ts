import * as Koa from 'koa';

import config from '../../../config';
import { ILocalUser } from '../../../models/entities/user';
import { Signins } from '../../../models';
import { genId } from '../../../misc/gen-id';
import { publishMainStream } from '../../../services/stream';

export default function(ctx: Koa.Context, user: ILocalUser, redirect = false) {
	if (redirect) {
		//#region Cookie
		const expires = 1000 * 60 * 60 * 24 * 365; // One Year
		ctx.cookies.set('i', user.token, {
			path: '/',
			domain: config.hostname,
			// SEE: https://github.com/koajs/koa/issues/974
			// When using a SSL proxy it should be configured to add the "X-Forwarded-Proto: https" header
			secure: config.url.startsWith('https'),
			httpOnly: false,
			expires: new Date(Date.now() + expires),
			maxAge: expires
		});
		//#endregion

		ctx.redirect(config.url);
	} else {
		ctx.body = {
			id: user.id,
			i: user.token
		};
		ctx.status = 200;
	}

	(async () => {
		// Append signin history
		const record = await Signins.save({
			id: genId(),
			createdAt: new Date(),
			userId: user.id,
			ip: ctx.ip,
			headers: ctx.headers,
			success: true
		});

		// Publish signin event
		publishMainStream(user.id, 'signin', await Signins.pack(record));
	})();
}
