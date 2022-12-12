import express from 'express';
import authRoutes from './routes/routes.js'
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use("/api", authRoutes);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
