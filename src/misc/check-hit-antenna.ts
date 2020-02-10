import { Antenna } from '../models/entities/antenna';
import { Note } from '../models/entities/note';
import { User } from '../models/entities/user';
import { UserListJoinings } from '../models';
import parseAcct from './acct/parse';
import { getFullApAccount } from './convert-host';

export async function checkHitAntenna(antenna: Antenna, note: Note, noteUser: User, followers: User['id'][]): Promise<boolean> {
	if (note.visibility === 'specified') return false;

	if (note.visibility === 'followers') {
		if (!followers.includes(antenna.userId)) return false;
	}

	if (!antenna.withReplies && note.replyId != null) return false;

	if (antenna.src === 'home') {
		if (!followers.includes(antenna.userId)) return false;
	} else if (antenna.src === 'list') {
		const listUsers = (await UserListJoinings.find({
			userListId: antenna.userListId!
		})).map(x => x.userId);

		if (!listUsers.includes(note.userId)) return false;
	} else if (antenna.src === 'users') {
		const accts = antenna.users.map(x => {
			const { username, host } = parseAcct(x);
			return getFullApAccount(username, host).toLowerCase();
		});
		if (!accts.includes(getFullApAccount(noteUser.username, noteUser.host).toLowerCase())) return false;
	}

	if (antenna.keywords.length > 0) {
		if (note.text == null) return false;

		const matched = antenna.keywords.some(keywords =>
			keywords.every(keyword =>
				antenna.caseSensitive
					? note.text!.includes(keyword)
					: note.text!.toLowerCase().includes(keyword.toLowerCase())
			));
		
		if (!matched) return false;
	}

	if (antenna.withFile) {
		if (note.fileIds.length === 0) return false;
	}

	// TODO: eval expression

	return true;
}
