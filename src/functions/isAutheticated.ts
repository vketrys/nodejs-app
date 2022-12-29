import admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { responses } from '../constants/responses.js';
import { statusCodes } from '../constants/codes.js';

export const isAuthenticated = async(req: Request, res: Response, next: NextFunction): Promise<Response> => {
	const { authorization } = req.headers;

	if (!authorization || !authorization.startsWith('Bearer')) {
		return res.status(statusCodes.unauthorized).send({message : responses.unauthorized});
	}

	const splitedToken = authorization.split(' ');

	if (splitedToken.length !== 2) {
		return res.status(statusCodes.unauthorized).send({ message: responses.tokenIssue}); 
	}

	const token = splitedToken[1];

	try {
		const decodedToken: admin.auth.DecodedIdToken = await admin.auth().verifyIdToken(token);

		res.locals = { 
			...res.locals,
			uid: decodedToken.uid,
			role: decodedToken.role,
			email: decodedToken.email,
		};

		next();
	} catch (error) {
		return res.status(statusCodes.unauthorized).send({ message: error.message});
	}
};
