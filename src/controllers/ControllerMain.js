/* eslint-disable radix */
/* eslint-disable camelcase */
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { response, responseError, responsePagination } from '../helpers/helpers.js';
import mainModels from '../models/Main.js';
import userModels from '../models/Users.js';

const topUp = async (req, res, next) => {
  try {
    const { user_id } = req.userLogin;
    const { amount } = req.body;
    let dataTopUp = {
      invoice_number: uuidv4(),
      user_id,
      transaction_type: 'topup',
      status: 'pending',
      amount,
    };
    if (req.files) {
      if (req.files.image_topup) {
        const filename = uuidv4() + path.extname(req.files.image_topup.name);
        const savePath = path.join(path.dirname(''), '/public/img/topups', filename);
        dataTopUp = { ...dataTopUp, image_topup: `public/img/topups/${filename}` };
        req.files.image_topup.mv(savePath);
      }
    }
    const insertTopup = await mainModels.insertDataTopup(dataTopUp);
    if (insertTopup.affectedRows) {
      console.log(dataTopUp);
      return response(res, 'sucess', 200, 'topup success', dataTopUp);
    }
    if (!insertTopup.affectedRows) {
      responseError(res, 'Error', 500, 'Error during insert data');
    }
  } catch (err) {
    next(err);
  }
};

const getAllTransaction = async (req, res, next) => {
  try {
    let userId = '';
    const { roles } = req.userLogin;
    if (roles === 'admin') {
      userId = 0;
    } else {
      userId = req.userLogin.user_id;
    }

    const keyword = req.query.keyword || '';
    const limit = req.query.limit || 5;
    let page = req.query.page || 1;
    let order = req.query.order || '';
    let { fieldOrder } = req.query;
    let nextPage = parseInt(page) + 1;
    let prevPage = page - 1;
    let start = 0;

    if (page > 1) {
      start = (page - 1) * limit;
    }

    if (order.toUpperCase() === 'ASC') {
      order = 'ASC';
    } else if (order.toUpperCase() === 'DESC') {
      order = 'DESC';
    } else {
      order = 'DESC';
    }

    if (fieldOrder) {
      if (fieldOrder.toLowerCase() === 'type') {
        fieldOrder = 'transaction_type';
      } else if (fieldOrder.toLowerCase() === 'amount') {
        fieldOrder = 'amount';
      } else {
        fieldOrder = 'transaction_id';
      }
    } else {
      fieldOrder = 'transaction_id';
    }

    await mainModels
      .getAllTransaction(keyword, userId)
      .then(async (result) => {
        const countData = result.length;
        const pages = countData / limit;
        if (nextPage > pages) {
          nextPage = Math.ceil(pages);
        }
        if (page > pages) {
          page = Math.ceil(pages);
          prevPage = page - 1;
          start = (page - 1) * limit;
        }
        if (countData > 0) {
          const data = await mainModels.getAllTransaction(keyword, userId, order, fieldOrder, start, limit);
          const dataTransaction = [];
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < data.length; i++) {
            if (data[i].id_recipient === userId) {
              data[i].transaction_type = 'transfer_in';
            }
            dataTransaction.push(data[i]);
          }
          const pagination = {
            countData,
            pages: Math.ceil(pages),
            limit,
            fieldOrder,
            order,
            currentPage: page,
            nextPage,
            prevPage,
          };
          responsePagination(res, 'success', 200, 'All data successfully loaded', dataTransaction, pagination);
        } else {
          response(res, 'Data Not Found', 200, 'Data not found');
        }
      })
      .catch((err) => {
        responseError(res, 'Error get dat', 500, 'Error during get data form database', err);
      });
  } catch (err) {
    next(err);
  }
};

const showtransaction = async (req, res, next) => {
  try {
    let userId = '';
    const { transactionId } = req.params;
    const { roles } = req.userLogin;
    if (roles === 'admin') {
      userId = 0;
    } else {
      userId = req.userLogin.user_id;
    }
    mainModels
      .showtransaction(transactionId)
      .then((result) => {
        if (result.length > 0) {
          const { timeTransaction } = result[0];
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
          const months = monthNames[parseInt(timeTransaction.substring(5, 7))];
          // eslint-disable-next-line max-len
          result[0].time = `${months} ${timeTransaction.substring(8, 10)}, ${timeTransaction.substring(
            0,
            4,
          )} - ${timeTransaction.substring(11)}`;
          delete result[0].timeTransaction;
          if (result[0].id_recipient === userId) {
            result[0].transaction_type = 'transfer_in';
          }
          response(res, 'Success', 200, 'Data successfully loaded', result[0]);
        } else {
          responseError(res, 'Error', 403, 'This is not your transaction');
        }
      })
      .catch((err) => {
        console.log(err);
        responseError(res, 'Error', 500, 'Error during get transaction', err);
      });
  } catch (err) {
    next(err);
  }
};

const updatetransaction = async (req, res, next) => {
  try {
    const {
      status, transaction_id, user_id, amount,
    } = req.body;
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
                  delete result[0].PIN;
                  delete result[0].first_name;
                  delete result[0].last_name;
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
    const { user_id } = req.userLogin;
    const { user_reciever, amount, description } = req.body;
    const recipient = await userModels.checkExistUser(user_reciever, 'user_id');
    const user_data = await userModels.checkExistUser(user_id, 'user_id');
    if (recipient.length === 0) {
      responseError(res, 'User not found', 500, 'Recipient not found');
    } else if (user_data[0].saldo < amount) {
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
        time_transfer: `${
          monthNames[time.getMonth()]
        } ${time.getDate()},${time.getFullYear()} - ${time.getHours()}.${time.getMinutes()}`,
        description,
        recipient: {
          name: `${recipient[0].first_name} ${recipient[0].last_name}`,
          phone_number: recipient[0].phone_number,
        },
      };
      const transferAmount = await mainModels.transfer(dataTrasfer, next);
      if (transferAmount.affectedRows) {
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
                  transferResult,
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
        response(res, 'Transfer Failed', 200, 'Money transfer Failed, please try again later', transferResult);
      }
    }
  } catch (err) {
    next(err);
  }
};

const checkPIN = async (req, res, next) => {
  try {
    const { user_id } = req.userLogin;
    const { PIN } = req.body;
    const user = await userModels.checkExistUser(user_id, 'user_id');
    if (user[0].PIN === PIN) {
      response(res, 'PIN accepted', 200, 'correct pin and accepted');
    } else {
      responseError(res, 'PIN rejected', 403, 'you entered the wrong pin', {});
    }
  } catch (err) {
    next(err);
  }
};

const getTopup = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || '';
    const limit = req.query.limit || 5;
    let page = req.query.page || 1;
    let order = req.query.order || '';
    let { fieldOrder } = req.query;
    let nextPage = parseInt(page) + 1;
    let prevPage = page - 1;
    let start = 0;

    if (page > 1) {
      start = (page - 1) * limit;
    }

    if (order.toUpperCase() === 'ASC') {
      order = 'ASC';
    } else if (order.toUpperCase() === 'DESC') {
      order = 'DESC';
    } else {
      order = 'DESC';
    }

    if (fieldOrder) {
      if (fieldOrder.toLowerCase() === 'status') {
        fieldOrder = 'status';
      } else if (fieldOrder.toLowerCase() === 'time') {
        fieldOrder = 'created_at';
      } else {
        fieldOrder = 'transaction_id';
      }
    } else {
      fieldOrder = 'transaction_id';
    }
    await mainModels.getDataTopup(keyword)
      .then(async (result) => {
        const countData = result.length;
        const pages = countData / limit;
        if (nextPage > pages) {
          nextPage = Math.ceil(pages);
        }
        if (page > pages) {
          page = Math.ceil(pages);
          prevPage = page - 1;
          start = (page - 1) * limit;
        }
        const pagination = {
          countData,
          pages: Math.ceil(pages),
          limit,
          fieldOrder,
          order,
          currentPage: page,
          nextPage,
          prevPage,
        };
        if (countData > 0) {
          const data = await mainModels.getDataTopup(keyword, order, fieldOrder, start, limit);
          responsePagination(res, 'success', 200, 'All data successfully loaded', data, pagination);
        } else {
          responseError(res, 'Not Found', 404, 'Data top up not found');
        }
      })
      .catch((err) => {
        responseError(res, 'Error', 500, 'Error during get data topup', err);
      });
  } catch (err) {
    next(err);
  }
};

export default {
  topUp,
  updatetransaction,
  getAllTransaction,
  transfer,
  checkPIN,
  showtransaction,
  getTopup,
};
