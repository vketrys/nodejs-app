import { Request, Response, NextFunction } from 'express';
import { db } from '../index';
import Collections from '../constants/collections';
import handleError from '../utils/handleError';

export const isYoursPost = async(req: Request, res: Response, next: NextFunction): Promise<Response> => {
	const { memeId } = req.params;

	try {
		const memeSnap = (await db.collection(Collections.memes).doc(memeId).get()).data();

		res.locals = { 
			...res.locals,
			userId: memeSnap.userId,
		};

		next();
	} catch (error) {
		return handleError(res, error);
	}
};
