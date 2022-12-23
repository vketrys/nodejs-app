import { Roles } from 'constants/roles.js';
import { Request, Response } from 'express';
import admin from 'firebase-admin';
import { statusCodes } from './constants/codes.js';
import { responses } from './constants/responses.js';

export const getAll = async(req: Request, res: Response) => {
	try {
		const listUsers = await admin.auth().listUsers();
		const users = listUsers.users.map(mapUser);

		return res.status(statusCodes.ok).send({ users });
	} catch (err) {
		return handleError(res, err);
	}
};

export const get = async(req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user = await admin.auth().getUser(id);

		return res.status(statusCodes.ok).send({ user: mapUser(user) });
	} catch (error) {
		return handleError(res, error);
	}
};

export const update = async(req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { displayName, password, email, role } = req.body;

		if (!id || !displayName || !password || !email || !role) {
			return res.status(statusCodes.badRequest).send({ message: responses.missingFields });
		}

		await admin.auth().updateUser(id, { displayName, password, email });
		await admin.auth().setCustomUserClaims(id, { role });
		const user = await admin.auth().getUser(id);

		return res.status(statusCodes.ok).send({ user: mapUser(user) });
	} catch (error) {
		return handleError(res, error);
	}
};

export const remove = async(req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const { email } = await admin.auth().getUser(id);

		await admin.auth().deleteUser(id);

		return res.status(statusCodes.ok).send({ message: `${email} ${responses.userRemoved}` });
	} catch (err) {
		return handleError(res, err);
	}
};

interface ErrorType {
  code: string;
  message: string;
}

function handleError(res: Response, err: ErrorType) {
	return res.status(statusCodes.internalServerError).send({ message: `${err.code} - ${err.message}` });
}

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
