import { 
	getAuth, 
	signInWithEmailAndPassword,
	UserCredential,
} from 'firebase/auth';
import admin from 'firebase-admin';
import { Request, Response } from 'express';
import app from '../config/firebase.js';
import { responses } from '../constants/responses.js';
import { errorCodes, statusCodes } from '../constants/codes.js';
import { Roles } from '../constants/roles.js';

export const signup = async(req: Request, res: Response): Promise<Response> => {
	try {
		const { displayName, email, password } = req.body;
		const role = Roles.user;
  
		if (!email || !password) {
			return res.status(statusCodes.unprocessableEntity).send(!email ? responses.emailRequired : responses.passwordRequired);
		}

		const { uid } = await admin.auth().createUser({
			displayName,
			password,
			email,
		});

		await admin.auth().setCustomUserClaims(uid, { role });

		return res.status(statusCodes.created).send({ uid, email, role });
	} catch (error) {
		return res
			.status(
				error.code === errorCodes.weakPassword ? 
					statusCodes.badRequest : 
					statusCodes.internalServerError,
			)
			.json({ error: error.message });
	}
};

export const signin = async(req: Request, res: Response): Promise<Response> => {
	try {
		const { email, password } = req.body;
  
		if (!email || !password) {
			return res.status(statusCodes.unprocessableEntity).json({
				email: responses.emailRequired,
				password: responses.passwordRequired,
			});
		}
  
		const auth = getAuth(app);
  
		const user: UserCredential = await signInWithEmailAndPassword(auth, email, password);

		return res.status(statusCodes.ok).json(user);
	} catch (error) {
		return res
			.status(
				error.code === errorCodes.wrongPassword ? 
					statusCodes.badRequest : 
					statusCodes.internalServerError,
			)
			.json({ error: error.message });
	}
};
