import express, { Express } from 'express';
import admin from 'firebase-admin';
import authRoutes from './routes/userRoutes';
import memeRoutes from './routes/memeRoutes';
import bodyParser from 'body-parser';
import cors from 'cors';
import { URL } from './constants/URL';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase/storage';
import dotenv from 'dotenv';
dotenv.config();

admin.initializeApp();

export const db = getFirestore();
export const storage = getStorage();

export const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors({ origin: true }));

app.use(URL.ROOT, authRoutes, memeRoutes);

if (process.env.NODE_ENV !== 'test') {
	app.listen(port, () => {
		process.stdout.write(`app listening on port ${port}`);
	});
}
