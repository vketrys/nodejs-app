import { Request, Response } from 'express';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import admin from 'firebase-admin';
import { db, storage } from '../index';
import { statusCodes } from '../constants/codes';
import { Roles } from '../constants/roles';
import handleError from '../utils/handleError';
import { responses } from '../constants/responses';
import Collections from '../constants/collections';

export const createMeme = async(req: Request, res: Response) => {
	const { text } = req.body;
	const file = req.file;

	const { uid } = res.locals;

	if (!file) {
		return res.status(statusCodes.badRequest_400).send({ message: responses.missingFile });
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

		return res.status(statusCodes.created_201).send({ message: responses.memeCreated });
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

		return res.status(statusCodes.ok_200).send(memesSnapshot.docs.map((doc) => doc.data()));
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
			});

			await memeRef.update({ likes: increment });
		} else {

			likeSnap.docs.forEach((doc) => doc.ref.delete());
			await memeRef.update({ likes: decrement });

			return res.status(statusCodes.forbidden_403).send({ message: responses.memeUnrated });
		}

		return res.status(statusCodes.ok_200).send({ message: responses.memeRated });
	} catch (error) {
		return handleError(res, error);
	}
};

export const getMeme = async(req: Request, res: Response) => {
	const { memeId } = req.params;

	try {
		const memeRef = db.collection(Collections.memes).doc(memeId);

		const memeSnapshot = await memeRef.get();

		return res.status(statusCodes.ok_200).send(memeSnapshot.data());
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
		const memeSnap = await memeRef.get();
		const currentFileName = await memeSnap.data().mediaURL;

		const newFileName = `${uid}/${memeId}.${fileType}`;

		const mediaRef = ref(storage, newFileName);

		await deleteObject(ref(storage, currentFileName));

		const snapshot = await uploadBytes(mediaRef, file.buffer);
		const mediaURL = snapshot.ref.fullPath;

		await memeRef.update({ 
			text,
			mediaURL,
		 });

		return res.status(statusCodes.ok_200).send({ message: responses.memeUpdated });
	} catch (error) {
		return handleError(res, error);
	}
};

export const deleteMeme = async(req: Request, res: Response) => {
	const { memeId } = req.params;

	try {
		const memeRef = db.collection(Collections.memes).doc(memeId);
		const memeSnap = await memeRef.get();
		const fileName = await memeSnap.data().mediaURL;

		const mediaRef = ref(storage, fileName);

		await deleteObject(mediaRef);

		await memeRef.delete();

		return res.status(statusCodes.ok_200).send({ message: responses.memeDeleted });
	} catch (error) {
		return handleError(res, error);
	}
};
