import { 
	getAuth, 
	signInWithEmailAndPassword,
	UserCredential,
} from 'firebase/auth';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import app from '../config/firebase.js';
import { responses } from '../constants/responses.js';
import { errorCodes, statusCodes } from '../constants/codes.js';
import { Roles } from '../constants/roles.js';
import { db } from '../index.js';
import Collections from '../constants/collections.js';

dotenv.config();

export const signup = async(req: Request, res: Response): Promise<Response> => {
	try {
		const { displayName, email, password } = req.body;

		//TODO: setting admin email from Firebase 
		const role = email === process.env.EXAMPLE_EMAIL ? Roles.admin : Roles.user;
  
		if (!email || !password) {
			return res.status(statusCodes.unprocessableEntity).send(!email ? responses.emailRequired : responses.passwordRequired);
		}

		const { uid } = await admin.auth().createUser({
			displayName,
			password,
			email,
		});

		await db.collection(Collections.users).doc(uid).set({
			email,
			displayName,
			role,
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
