import express from 'express';

import { isAuthenticated } from '../functions/isAutheticated.js';
import { isAuthorized } from '../functions/isAuthorized.js';
import { signup, signin } from '../auth.js';
import { URL } from '../constants/URL.js';
import { get, getAll, remove, update } from '../controllers.js';

const router = express.Router();

//creating new user
router.post(URL.AUTH.SIGNUP, signup);

//signing in user with email and password
router.post(URL.AUTH.SIGNIN, signin);

//getting list of all users
router.get(URL.USERS.GET, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin']}),
	getAll,
]);

//getting user with uid
router.get(URL.USERS.PARAMS, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'], allowSameUser: true }),
	get,
]);

//update user information
router.patch(URL.USERS.PARAMS, [
	isAuthenticated,
	isAuthorized({hasRole: ['admin'], allowSameUser: true}),
	update,
]);

//delete user with uid 
router.delete(URL.USERS.PARAMS, [
	isAuthenticated,
	isAuthorized({hasRole: ['admin'], allowSameUser: true}),
	remove,
]);

export default router;
