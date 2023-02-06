import { Request, Response, NextFunction } from 'express';
import { statusCodes } from '../constants/codes';
import { db } from '../index';
import Collections from '../constants/collections';

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
		return res.status(statusCodes.internalServerError_500).send({ message: error.message});
	}
};
