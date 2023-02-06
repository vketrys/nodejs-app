import { Request, Response } from 'express';
import admin from 'firebase-admin';
import handleError from '../utils/handleError';
import { statusCodes } from '../constants/codes';
import { responses } from '../constants/responses';
import { Roles } from '../constants/roles';

export const getAll = async(req: Request, res: Response) => {
	try {
		const listUsers = await admin.auth().listUsers();
		const users = listUsers.users.map(mapUser);

		return res.status(statusCodes.ok_200).send({ users });
	} catch (err) {
		return handleError(res, err);
	}
};

export const get = async(req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user = await admin.auth().getUser(id);

		return res.status(statusCodes.ok_200).send({ user: mapUser(user) });
	} catch (error) {
		return handleError(res, error);
	}
};

export const update = async(req: Request, res: Response) => {
	const { id } = req.params;
	const { displayName, password, email } = req.body;
	
	try {
		if (!displayName || !password || !email) {
			return res.status(statusCodes.badRequest_400).send({ message: responses.missingFields });
		}

		await admin.auth().updateUser(id, { displayName, password, email });
		const user = await admin.auth().getUser(id);

		return res.status(statusCodes.ok_200).send({ user: mapUser(user) });
	} catch (error) {
		return handleError(res, error);
	}
};

export const remove = async(req: Request, res: Response) => {
	const { id } = req.params;

	try {
		const { email } = await admin.auth().getUser(id);

		await admin.auth().deleteUser(id);

		return res.status(statusCodes.ok_200).send({ message: `${email} ${responses.userRemoved}` });
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
