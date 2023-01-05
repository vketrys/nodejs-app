import { Request, Response, NextFunction } from 'express';
import { statusCodes } from '../constants/codes.js';
import { db } from '../index.js';
import Collections from '../constants/collections.js';

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
		return res.status(statusCodes.internalServerError).send({ message: error.message});
	}
};
