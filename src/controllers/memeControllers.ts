import { Request, Response } from 'express';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import admin from 'firebase-admin';
import { db, storage } from '../index.js';
import { statusCodes } from '../constants/codes.js';
import { Roles } from '../constants/roles.js';
import handleError from '../utils/handleError.js';
import { responses } from '../constants/responses.js';
import Collections from '../constants/collections.js';

export const createMeme = async(req: Request, res: Response) => {
	const { text } = req.body;
	const file = req.file;

	const { uid } = res.locals;

	if (!req.file) {
		return res.status(statusCodes.badRequest).send({ message: responses.missingFile });
	}

	const fileType = file.originalname.split('.').at(-1);

	try {
		const memeRef = await db.collection(Collections.memes).add({
			text,
			isPublished: false,
			likes: 0,
			userId: uid,
			createdAt: admin.firestore.Timestamp.now(),
		});

		const memeId = memeRef.id;
		const fileName = `${uid}/${memeId}.${fileType}`;

		const mediaRef = ref(storage, fileName);

		const snapshot = await uploadBytes(mediaRef, file.buffer);
		const downloadURL = snapshot.ref.fullPath;

		await db.collection(Collections.memes).doc(memeId).set({
			mediaURL: downloadURL,
		}, { merge: true });

		return res.status(statusCodes.created).send({ message: responses.memeCreated });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getAllMemes = async(req: Request, res: Response) => {
	const { role } = res.locals;

	try {
		const memesRef = role === Roles.admin ? 
			db.collection(Collections.memes) : 
			db.collection(Collections.memes).where('isPublished', '==', true);

		const memesSnapshot = await memesRef.get();

		return res.status(statusCodes.ok).send(memesSnapshot.docs.map((doc) => doc.data()));
	} catch (error) {
		return handleError(res, error);
	}
};

export const likeMeme = async(req: Request, res: Response) => {
	const { uid } = res.locals;
	const { memeId } = req.params;
	const { count } = req.body;

	try {
		const likeRef = db.collection(Collections.memes).doc(memeId).collection(Collections.likes);

		const memeRef = db.collection(Collections.memes).doc(memeId);
		const increment = admin.firestore.FieldValue.increment(count || 1);
		const decrement = admin.firestore.FieldValue.increment(-count || -1);

		const likeQuery = likeRef.where('uid', '==', uid);
		const likeSnap = await likeQuery.get();

		if (likeSnap.docs.length === 0) {
			await likeRef.add({
				uid,
				memeId,
			});

			await memeRef.update({ likes: increment });
		} else {

			likeSnap.docs.forEach((doc) => doc.ref.delete());
			await memeRef.update({ likes: decrement });

			return res.status(statusCodes.forbidden).send({ message: responses.memeUnrated });
		}

		return res.status(statusCodes.ok).send({ message: responses.memeRated });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getMeme = async(req: Request, res: Response) => {
	const { memeId } = req.params;

	try {
		const memeRef = db.collection(Collections.memes).doc(memeId);

		const memeSnapshot = await memeRef.get();

		return res.status(statusCodes.ok).send(memeSnapshot.data());
	} catch (error) {
		return handleError(res, error);
	}
};

export const updateMeme = async(req: Request, res: Response) => {
	const { memeId } = req.params;
	const { uid } = res.locals;
	const { text } = req.body;
	const file = req.file;

	const fileType = file.originalname.split('.').at(-1);

	try {
		const memeRef = db.collection(Collections.memes).doc(memeId);

		const fileName = `${uid}/${memeId}.${fileType}`;

		const mediaRef = ref(storage, fileName);

		await deleteObject(mediaRef);

		const snapshot = await uploadBytes(mediaRef, file.buffer);
		const downloadURL = snapshot.ref.fullPath;

		await memeRef.update({ 
			text,
			mediaURL: downloadURL,
		 });

		return res.status(statusCodes.ok).send({ message: responses.memeUpdated });
	} catch (error) {
		return handleError(res, error);
	}
};

export const deleteMeme = async(req: Request, res: Response) => {
	const { memeId } = req.params;

	try {
		const memeRef = db.collection(Collections.memes).doc(memeId);

		await memeRef.delete();

		return res.status(statusCodes.ok).send({ message: responses.memeDeleted });
	} catch (error) {
		return handleError(res, error);
	}
};
