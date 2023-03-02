import { Request, Response } from 'express';
import admin from 'firebase-admin';
import handleError from '../utils/handleError';
import { statusCodes } from '../constants/codes';
import { responses } from '../constants/responses';
import { Roles } from '../constants/roles';
import { db } from '../index';
import Collections from '../constants/collections';

export const getAllUsers = async(req: Request, res: Response) => {
	try {
		const listUsers = await admin.auth().listUsers();
		const users = listUsers.users.map(mapUser);

		return res.status(statusCodes.ok_200).json({ users });
	} catch (err) {
		return handleError(res, err);
	}
};

export const getUser = async(req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user = await admin.auth().getUser(id);

		return res.status(statusCodes.ok_200).json(mapUser(user));
	} catch (error) {
		return handleError(res, error);
	}
};

export const updateUser = async(req: Request, res: Response) => {
	const { id } = req.params;
	const { displayName, password } = req.body;
	
	try {
		if (!displayName || !password) {
			return res.status(statusCodes.badRequest_400).json(responses.missingFields);
		}

		await admin.auth().updateUser(id, { displayName, password });
		await db.collection(Collections.users).doc(id).update({ displayName });
		const user = await admin.auth().getUser(id);

		return res.status(statusCodes.ok_200).json(mapUser(user));
	} catch (error) {
		return handleError(res, error);
	}
};

export const removeUser = async(req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const { email } = await admin.auth().getUser(id);

		await admin.auth().deleteUser(id);
		await db.collection(Collections.users).doc(id).delete();

		return res.status(statusCodes.ok_200).json(`${email} ${responses.userRemoved}`);
	} catch (err) {
		return handleError(res, err);
	}
};

function mapUser(user: admin.auth.UserRecord) {
	const customClaims = (user.customClaims || { role: '' }) as { role?: Roles };
	const role = customClaims.role || '';

	return {
		uid: user.uid,
		email: user.email || '',
		displayName: user.displayName || '',
		role,
		lastSignInTime: user.metadata.lastSignInTime,
		creationTime: user.metadata.creationTime,
	};
}
