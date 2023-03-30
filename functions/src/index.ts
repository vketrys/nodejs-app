import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Filter = require('bad-words');

admin.initializeApp();

exports.profaneIdentifier = functions.firestore
	.document('memes/{memeId}')
	.onCreate(async(snapshot, context) => {
		const profaneDatabase = await admin.firestore().collection('profane').get();
		const profaneFilter = new Filter();
		const profaneWords: string[] = [];

		profaneDatabase.docs.forEach((doc) => profaneWords.push(...doc.data().words));

		profaneFilter.addWords(...profaneWords);

		const memeText = snapshot.data().text;
		const memeWords: string[] = memeText.split(' ');

		let profaneIndicator = false;

		memeWords.forEach((word) => {
			if (profaneFilter.isProfane(word)) {
				profaneIndicator = true;
			}
		});

		// eslint-disable-next-line no-console
		console.log('profane', profaneWords);
		

		if (profaneIndicator) {
			await snapshot.ref.update({ likes: admin.firestore.FieldValue.increment(-3) });
		}
	});




