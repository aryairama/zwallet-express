const Express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const userRouter = require('./src/routes/Users');
const mainRouter = require('./src/routes/Main');
const { responseError } = require('./src/helpers/helpers');

const app = Express();
const port = process.env.PORT;

app.use(cors());
app.use(Express.json());
app.use(fileUpload());
app.use('/public', Express.static(path.resolve('./public')));
app.use('/users', userRouter);
app.use('/main', mainRouter);

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
