import {response, responseError} from '../helpers/helpers.js';
import {v4 as uuidv4} from 'uuid';
import mainModels from '../models/Main.js';
import userModels from '../models/Users.js';
import path from 'path';

const topUp = async (req, res, next) => {
  try {
    const {user_id, amount, description} = req.body;
    const {image_topup} = req.files;
    const fileName = `${Date.now} - ${uuidv4} - ${image_topup.name}`;
    const dataTopUp = {
      invoice_number: uuidv4(),
      user_id,
      transaction_type: 'topup',
      status: 'pending',
      amount,
      description,
    };
    await mainModels
      .insertDataTopup(dataTopUp)
      .then(() => {
        console.log('masuk then');
        response(res, 'sucess', 200, 'sukses masuk then dan insert data');
        const savePath = path.join(path.dirname(''), '/public', fileName);
        image_topup.mv(savePath);
      })
      .catch((err) => {
        responseError(res, 'Error', 500, 'Error during insert data', err);
      });
  } catch (err) {
    next(err);
  }
};

const getAllTransaction = async (req, res, next) => {
  try {
    await mainModels
      .getAllTransaction()
      .then((result) => {
        response(res, 'Sucess', 200, 'Successfully get all data transaction', result);
      })
      .catch((err) => {
        responseError(res, 'Error get dat', 500, 'Error during get data form database', err);
      });
  } catch (err) {
    next(err);
  }
};

const updatetransaction = async (req, res, next) => {
  try {
    const {status, transaction_id, user_id, amount} = req.body;
    await mainModels
      .updatetransaction(status, transaction_id)
      .then(() => {
        userModels
          .updateSaldo(amount, user_id)
          .then(() => {
            userModels
              .checkExistUser(user_id, 'user_id')
              .then((result) => {
                delete result[0].password
                response(res, 'Success update', 200, 'Succesfully update transaction', result[0]);
              })
              .catch((err) => {
                responseError(res, 'Error get user', 500, 'There is an error when get data user', err);
              });
          })
          .catch((err) => {
            responseError(res, 'Error update saldo', 500, 'There is an error when updating user balance', err);
          });
      })
      .catch((err) => {
        responseError(res, 'Error', 500, 'Error during update data transaction', err);
      });
  } catch (err) {
    next(err);
  }
};

export default {
  topUp,
  updatetransaction,
  getAllTransaction,
};
