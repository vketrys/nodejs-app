import { Request, Response, NextFunction } from 'express';
import { statusCodes } from '../constants/codes.js';
import { responses } from '../constants/responses.js';

export const isAuthorized = (opts: { hasRole: Array<'admin' | 'user'>, allowSameUser?: boolean }) => 
	 (req: Request, res: Response, next: NextFunction) => {
		const { role, uid, userId } = res.locals;
		const { id } = req.params;

		if (opts.allowSameUser && uid === id)
			return next();

		if (opts.allowSameUser && uid === userId)
			return next();

		if (!role)
			return res.status(statusCodes.forbidden_403).send({ message: responses.roleIssue });

		if (opts.hasRole.includes(role))
			return next();

		return res.status(statusCodes.forbidden_403).send({ message: responses.permissionIssue });
	}
;

