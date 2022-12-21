import { Request, Response } from 'express';

import { statusCodes } from '../constants/codes.js';
import { responses } from '../constants/responses.js';

export const isAuthorized = (opts: { hasRole: Array<'admin' | 'user'>, allowSameUser?: boolean }) => 
	// eslint-disable-next-line @typescript-eslint/ban-types
	 (req: Request, res: Response, next: Function) => {
		const { role, uid } = res.locals;
		const { id } = req.params;

		if (opts.allowSameUser && id && uid === id)
			return next();

		if (!role)
			return res.status(statusCodes.forbidden).send({ message: responses.roleIssue });

		if (opts.hasRole.includes(role))
			return next();

		return res.status(statusCodes.forbidden).send({ message: responses.permissionIssue });
	}
;

