import express, { Express } from 'express';
import admin from 'firebase-admin';
import authRoutes from './routes/userRoutes.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import { URL } from './constants/URL.js';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

admin.initializeApp();
export const db = getFirestore();
export const storage = getStorage();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors({ origin: true }));

app.use(URL.ROOT, authRoutes);


app.listen(port, () => {
	process.stdout.write(`app listening on port ${port}`);
});
