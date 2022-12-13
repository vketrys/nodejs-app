import express from 'express';
import { signup, signin } from '../auth.js';
import { URL } from '../constants/URL.js';

const router = express.Router();

router.post(URL.AUTH.SIGNUP, signup);
router.post(URL.AUTH.SIGNIN, signin);

export default router;