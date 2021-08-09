import {response, responseError} from '../helpers/helpers.js';
import {v4 as uuidv4} from 'uuid';
import mainModels from '../models/Main.js';
import userModels from '../models/Users.js';
import path from 'path';

const topUp = async (req, res, next) => {
  try {
    const user_id = req.userLogin.user_id;
    const {amount} = req.body;
    const {image_topup} = req.files;
    const fileName = `${Date.now} - ${uuidv4} - ${image_topup.name}`;
    const dataTopUp = {
      invoice_number: uuidv4(),
      user_id,
      transaction_type: 'topup',
      status: 'pending',
      amount,
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
        if (status === 'approve') {
          userModels
            .updateSaldo(amount, user_id)
            .then(() => {
              userModels
                .checkExistUser(user_id, 'user_id')
                .then((result) => {
                  delete result[0].password;
                  response(res, 'Success update', 200, 'Succesfully update transaction top up', result[0]);
                })
                .catch((err) => {
                  responseError(res, 'Error get user', 500, 'There is an error when get data user', err);
                });
            })
            .catch((err) => {
              responseError(res, 'Error update saldo', 500, 'There is an error when updating user balance', err);
            });
        } else {
          response(res, 'Success', 200, 'Successfully canceled top up');
        }
      })
      .catch((err) => {
        responseError(res, 'Error', 500, 'Error during update data transaction', err);
      });
  } catch (err) {
    next(err);
  }
};

const transfer = async (req, res, next) => {
  try {
    const user_id = req.userLogin.user_id;
    const {user_reciever, amount, description} = req.body;
    const recipient = await userModels.checkExistUser(user_reciever, 'user_id');
    const user_data = await userModels.checkExistUser(user_id, 'user_id');
    if (recipient.length === 0) {
      responseError(res, 'User not found', 500, 'Recipient not found', err);
    } else {
      if (user_data[0].saldo < amount) {
        responseError(res, 'over nominal', 403, `your balance is not more than ${user_data[0].saldo}`);
      } else {
        const dataTrasfer = {
          user_id,
          user_reciever,
          invoice_number: uuidv4(),
          transaction_type: 'transfer',
          amount,
          description,
        };
        const senderBalance = user_data[0].saldo - amount;
        const recipientBalance = parseInt(recipient[0].saldo) + amount;
        const time = new Date();
        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        const transferResult = {
          amount,
          senderBalance,
          time_transfer:
            monthNames[time.getMonth()] +
            ' ' +
            time.getDate() +
            ',' +
            time.getFullYear() +
            ' - ' +
            time.getHours() +
            '.' +
            time.getMinutes(),
          description,
          recipient: {
            name: recipient[0].first_name + ' ' + recipient[0].last_name,
            phone_number: recipient[0].phone_number,
          },
        };
        const transfer = await mainModels.transfer(dataTrasfer, next);
        if (transfer.affectedRows) {
          userModels
            .updateSaldo(senderBalance, user_id)
            .then(() => {
              userModels
                .updateSaldo(recipientBalance, user_reciever)
                .then(() => {
                  response(
                    res,
                    'Transfer Success',
                    200,
                    'Money transfer success, the balance of both parties has been updated',
                    transferResult
                  );
                })
                .catch((err) => {
                  responseError(res, 'Error balance', 500, 'Error when changing reciever balance', err);
                });
            })
            .catch((err) => {
              responseError(res, 'Error balance', 500, 'Error when changing sender balance', err);
            });
        } else {
          response(
            res,
            'Transfer Failed',
            200,
            'Money transfer Failed, please try again later',
            transferResult
          );
        }
      }
    }
  } catch (err) {
    next(err);
  }
};

export default {
  topUp,
  updatetransaction,
  getAllTransaction,
  transfer,
};
