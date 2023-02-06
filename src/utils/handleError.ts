import { Response } from 'express';
import { statusCodes } from '../constants/codes';
import ErrorType from '../types/errorType';

export default function handleError(res: Response, err: ErrorType) {
	return res.status(statusCodes.internalServerError_500).send({ message: `${err.code} - ${err.message}` });
}
