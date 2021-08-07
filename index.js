import Express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import 'dotenv/config';
import userRouter from './src/routes/Users.js';
import cors from 'cors'
import { responseError } from './src/helpers/helpers.js';
const app = Express();
const port = process.env.PORT;

app.use(cors());
app.use(Express.json());
app.use(fileUpload())
app.use('/file', Express.static(path.resolve('./src/assets/img/')))

app.use('/users', userRouter);

app.use('*', (req, res, next) => {
  next(new Error('Endpoint Not Found'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  responseError(res, 'Error', 500, err.message, []);
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
