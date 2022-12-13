import { 
	getAuth, 
	createUserWithEmailAndPassword, 
	signInWithEmailAndPassword,
} from 'firebase/auth';
import { Request, Response } from 'express';
import app from './config/firebase.js';
import { responses } from './constants/responses.js';
import { errorCodes, statusCodes } from './constants/codes.js';

export const signup = async (req: Request, res: Response): Promise<Response> => {
	try {
		const { email, password } = req.body;
  
		if (!email || !password) {
			return res.status(statusCodes.unprocessableEntity).json({
				email: responses.emailRequired,
				password: responses.passwordRequired,
			});
		}
  
		const auth = getAuth(app);
  
		createUserWithEmailAndPassword(auth, email, password)
			.then((user) => {
				return res.status(statusCodes.created).json(user);
			});
	} catch (error) {
		if (error.code === errorCodes.weakPassword) {
			return res.status(statusCodes.badRequest).json({ error: error.message });
		} else {
			return res.status(statusCodes.internalServerError).json({ error: error.message });
		}
	}
};

export const signin = async (req: Request, res: Response): Promise<Response> => {
	try {
		const { email, password } = req.body;
  
		if (!email || !password) {
			return res.status(statusCodes.unprocessableEntity).json({
				email: responses.emailRequired,
				password: responses.passwordRequired,
			});
		}
  
		const auth = getAuth(app);
  
		signInWithEmailAndPassword(auth, email, password)
			.then((user) => {
				return res.status(statusCodes.OK).json(user);
			});
	} catch (error) {
		if (error.code === errorCodes.wrongPassword) {
			return res.status(statusCodes.badRequest).json({ error: error.message });
		} else {
			return res.status(statusCodes.unprocessableEntity).json({ error: error.message });
		}
	}
};
