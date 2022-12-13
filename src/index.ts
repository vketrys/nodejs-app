import express, { Express } from 'express';
import authRoutes from './routes/routes.js';
import bodyParser from 'body-parser';
import { URL } from './constants/URL.js';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(URL.ROOT, authRoutes);


app.listen(port, () => {
	process.stdout.write(`app listening on port ${port}`);
});
