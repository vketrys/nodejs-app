import { Response } from 'express';
import { statusCodes } from '../constants/codes.js';
import ErrorType from '../types/errorType.js';

export default function handleError(res: Response, err: ErrorType) {
	return res.status(statusCodes.internalServerError).send({ message: `${err.code} - ${err.message}` });
}
