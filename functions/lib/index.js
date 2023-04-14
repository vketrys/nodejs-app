"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Filter = require("bad-words");
admin.initializeApp();
exports.profaneIdentifier = functions.firestore
    .document('memes/{memeId}')
    .onCreate(async (snapshot, context) => {
    const profaneDatabase = await admin.firestore().collection('profane').get();
    const profaneFilter = new Filter();
    const profaneWords = [];
    profaneDatabase.docs.forEach((doc) => profaneWords.push(...doc.data().profaneWords));
    profaneFilter.addWords(...profaneWords);
    const memeText = snapshot.data().text.toLowerCase();
    const memeWords = memeText.split(' ');
    let profaneIndicator = false;
    memeWords.forEach((word) => {
        if (profaneFilter.isProfane(word)) {
            profaneIndicator = true;
        }
    });
    if (profaneIndicator) {
        await snapshot.ref.update({ likes: admin.firestore.FieldValue.increment(-3) });
    }
});
//# sourceMappingURL=index.js.map