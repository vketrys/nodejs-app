import express from 'express';
import { isAuthenticated } from '../functions/isAutheticated';
import { isAuthorized } from '../functions/isAuthorized';
import { signup, signin } from '../controllers/authControllers';
import { URL } from '../constants/URL';
import { getUser, getAllUsers, removeUser, updateUser } from '../controllers/userControllers';

const router = express.Router();

router.post(URL.AUTH.SIGNUP, signup);

router.post(URL.AUTH.SIGNIN, signin);

router.get(URL.USERS.ROOT, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'] }),
	getAllUsers,
]);

router.get(URL.USERS.PARAMS, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'], allowSameUser: true }),
	getUser,
]);

router.patch(URL.USERS.PARAMS, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'], allowSameUser: true }),
	updateUser,
]);

router.delete(URL.USERS.PARAMS, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'] }),
	removeUser,
]);

export default router;
