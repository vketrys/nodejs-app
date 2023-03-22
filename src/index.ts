import express, { Express } from 'express';
import admin from 'firebase-admin';
import authRoutes from './routes/userRoutes';
import memeRoutes from './routes/memeRoutes';
import bodyParser from 'body-parser';
import cors from 'cors';
import { URL } from './constants/URL';
import { getFirestore } from 'firebase-admin/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import dotenv from 'dotenv';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import firebaseApp from './config/firebase';

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

admin.initializeApp();

export const db = getFirestore();
export const storage = getStorage();
export const auth = getAuth(firebaseApp);

if (process.env.NODE_ENV === 'test') {	
	connectAuthEmulator(auth, process.env.APP_AUTH_EMULATOR_HOST, { disableWarnings: true });
	connectStorageEmulator(storage, process.env.APP_STORAGE_EMULATOR_HOST, 9199);
}

export const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors({ origin: true }));

app.use(URL.ROOT, authRoutes, memeRoutes);

if (process.env.NODE_ENV !== 'test') {
	app.listen(PORT, () => {
		process.stdout.write(`app listening on port ${PORT}`);
	});
}
