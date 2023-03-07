import { signInWithEmailAndPassword } from 'firebase/auth';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { responses } from '../constants/responses';
import { errorCodes, statusCodes } from '../constants/codes';
import { Roles } from '../constants/roles';
import { auth, db } from '../index';
import Collections from '../constants/collections';

dotenv.config();

export const signup = async(req: Request, res: Response): Promise<Response> => {
	const { displayName, email, password } = req.body;

	//TODO: setting admin email from Firebase 
	const role = email === process.env.EXAMPLE_EMAIL || email === 'test@gmail.com' 
		? Roles.admin 
		: Roles.user;

	if (!email || !password) {
		return res
			.status(statusCodes.unprocessableEntity_422)
			.json(!email ? responses.emailRequired : responses.passwordRequired);
	}

	try {
		const { uid } = await admin.auth().createUser({
			displayName,
			password,
			email,
		});

		await admin.auth().setCustomUserClaims(uid, { role });

		await db.collection(Collections.users).doc(uid).set({
			email,
			displayName,
			role,
		});

		return res.status(statusCodes.created_201).json({ uid, email, role });
	} catch (error) {
		return res
			.status(
				error.code === errorCodes.weakPassword ? 
					statusCodes.badRequest_400 : 
					statusCodes.internalServerError_500,
			)
			.json({ error: error.message });
	}
};

export const signin = async(req: Request, res: Response): Promise<Response> => {
	const { email, password } = req.body;
  
	if (!email || !password) {
		return res
			.status(statusCodes.unprocessableEntity_422)
			.json(!email ? responses.emailRequired : responses.passwordRequired);
	}
	
	try {    
		await signInWithEmailAndPassword(auth, email, password);
		const jwtToken = await auth.currentUser.getIdToken();

		return res.status(statusCodes.ok_200).json(jwtToken);
	} catch (error) {
		return res
			.status(
				error.code === errorCodes.wrongPassword ? 
					statusCodes.badRequest_400 : 
					statusCodes.internalServerError_500,
			)
			.json({ error: error.message });
	}
};
