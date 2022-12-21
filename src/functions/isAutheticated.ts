import admin from 'firebase-admin';
import { Request, Response } from 'express';

import { responses } from '../constants/responses.js';
import { statusCodes } from '../constants/codes.js';

// eslint-disable-next-line @typescript-eslint/ban-types
export const isAuthenticated = async(req: Request, res: Response, next: Function): Promise<Response> => {
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

		return next();
	} catch (error) {
		return res.status(statusCodes.unauthorized).send({ message: error.message});
	}
};
