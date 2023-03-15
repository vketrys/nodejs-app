import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { responses } from '../constants/responses';
import { statusCodes } from '../constants/codes';
import handleError from '../utils/handleError';

export const isAuthenticated = async(req: Request, res: Response, next: NextFunction): Promise<Response> => {
	const { authorization } = req.headers;

	if (!authorization || !authorization.startsWith('Bearer')) {
		return res.status(statusCodes.UNAUTHORIZED).json(responses.unauthorized);
	}

	const splitedToken = authorization.split(' ');

	if (splitedToken.length !== 2) {
		return res.status(statusCodes.INVALID_TOKEN).json(responses.tokenIssue);
	}

	const token = splitedToken[1];

	try {
		const { uid, role, email }: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);

		res.locals = { 
			...res.locals,
			uid,
			role,
			email,
		};

		next();
	} catch (error) {
		return handleError(res, error);
	}
};
