import autobind from 'autobind-decorator';
import shouldMuteThisNote from '../../../../misc/should-mute-this-note';
import Channel from '../channel';
import { fetchMeta } from '../../../../misc/fetch-meta';
import { Notes } from '../../../../models';
import { PackedNote } from '../../../../models/repositories/note';
import { PackedUser } from '../../../../models/repositories/user';

export default class extends Channel {
	public readonly chName = 'hybridTimeline';
	public static shouldShare = true;
	public static requireCredential = true;

	@autobind
	public async init(params: any) {
		const meta = await fetchMeta();
		if (meta.disableLocalTimeline && !this.user!.isAdmin && !this.user!.isModerator) return;

		// Subscribe events
		this.subscriber.on('notesStream', this.onNote);
	}

	@autobind
	private async onNote(note: PackedNote) {
		// 自分自身の投稿 または その投稿のユーザーをフォローしている または 全体公開のローカルの投稿 の場合だけ
		if (!(
			this.user!.id === note.userId ||
			this.following.includes(note.userId) ||
			((note.user as PackedUser).host == null && note.visibility === 'public')
		)) return;

		if (['followers', 'specified'].includes(note.visibility)) {
			note = await Notes.pack(note.id, this.user!, {
				detail: true
			});

			if (note.isHidden) {
				return;
			}
		} else {
			// リプライなら再pack
			if (note.replyId != null) {
				note.reply = await Notes.pack(note.replyId, this.user!, {
					detail: true
				});
			}
			// Renoteなら再pack
			if (note.renoteId != null) {
				note.renote = await Notes.pack(note.renoteId, this.user!, {
					detail: true
				});
			}
		}

		// 流れてきたNoteがミュートしているユーザーが関わるものだったら無視する
		if (shouldMuteThisNote(note, this.muting)) return;

		this.send('note', note);
	}

	@autobind
	public dispose() {
		// Unsubscribe events
		this.subscriber.off('notesStream', this.onNote);
	}
}
