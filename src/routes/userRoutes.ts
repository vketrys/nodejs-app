import express from 'express';
import { isAuthenticated } from '../functions/isAutheticated';
import { isAuthorized } from '../functions/isAuthorized';
import { signup, signin } from '../controllers/authControllers';
import { URL } from '../constants/URL';
import { get, getAll, remove, update } from '../controllers/userControllers';

const router = express.Router();

router.post(URL.AUTH.SIGNUP, signup);

router.post(URL.AUTH.SIGNIN, signin);

router.get(URL.USERS.ROOT, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'] }),
	getAll,
]);

router.get(URL.USERS.PARAMS, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'], allowSameUser: true }),
	get,
]);

router.patch(URL.USERS.PARAMS, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'], allowSameUser: true }),
	update,
]);

router.delete(URL.USERS.PARAMS, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'], allowSameUser: false }),
	remove,
]);

export default router;
