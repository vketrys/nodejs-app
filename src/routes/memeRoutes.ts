import express from 'express';
import multer from 'multer';
import { isAuthenticated } from '../functions/isAutheticated';
import { isAuthorized } from '../functions/isAuthorized';
import { isYoursPost } from '../functions/isYoursPost';
import { URL } from '../constants/URL';
import { 
	createMeme, 
	deleteMeme, 
	getAllMemes, 
	getMeme, 
	likeMeme, 
	updateMeme,
} from '../controllers/memeControllers';

const router = express.Router();

const upload = multer({
	storage: multer.memoryStorage(),
}).single('file');


router.post(URL.MEMES.ROOT, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin', 'user'] }),
	upload,
	createMeme,
]);

router.get(URL.MEMES.ROOT, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin', 'user'], allowSameUser: true }),
	getAllMemes,
]);

router.put(URL.MEMES.PARAMS, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin', 'user']}),
	likeMeme,
]);

router.get(URL.MEMES.PARAMS, [
	isAuthenticated,
	isAuthorized({ hasRole: ['admin'], allowSameUser: true }),
	getMeme,
]);

router.patch(URL.MEMES.PARAMS, [
	isAuthenticated,
	isYoursPost,
	isAuthorized({ hasRole: [], allowSameUser: true }),
	upload,
	updateMeme,
]);

router.delete(URL.MEMES.PARAMS, [
	isAuthenticated,
	isYoursPost,
	isAuthorized({ hasRole: ['admin'], allowSameUser: true }),
	deleteMeme,
]);

export default router;
