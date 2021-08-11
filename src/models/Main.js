import connection from '../configs/db.js';
import { promiseResolveReject } from '../helpers/helpers.js';

const insertDataTopup = (data) => new Promise((resolve, reject) => {
  connection.query('INSERT INTO transactions SET ?', data, (err, result) => {
    promiseResolveReject(resolve, reject, err, result);
  });
});

const insertImageTopup = (filename, invoiceNumber) => new Promise((resolve, reject) => {
  connection.query(
    'UPDATE transaction SET image_topup = ? WHERE invoice_number = ?',
    [filename, invoiceNumber],
    (err, result) => {
      promiseResolveReject(resolve, reject, err, result);
    },
  );
});

const getAllTransaction = (keyword, userId, order = '', field = '', start = '', limit = '') => new Promise((resolve, reject) => {
  // let dataLengthAs = `user_id = ${userId} and`;
  let dataUserAs = `transactions.user_id = ${userId} and`;
  if (userId === 0) {
    // dataLengthAs = '';
    dataUserAs = '';
  }
  if (order === '' && field === '' && start === '' && limit === '') {
    connection.query(
      // eslint-disable-next-line max-len
      `select transactions.transaction_id, transactions.invoice_number, users.fullname, (select fullname from users where user_id = transactions_reciever.user_id) as recipient, transactions.transaction_type, transactions.status from transactions inner join users on transactions.user_id = users.user_id left join transactions_reciever on transactions.transaction_id = transactions_reciever.transaction_id where ${dataUserAs} transactions.invoice_number like '%${keyword}%' or users.fullname like '%${keyword}%' or transactions.status like '%${keyword}%' or transactions.transaction_type like '%${keyword}%'`,
      (err, result) => {
        promiseResolveReject(resolve, reject, err, result);
      },
    );
  } else {
    connection.query(
      // eslint-disable-next-line max-len
      `select transactions.transaction_id, transactions.invoice_number, users.fullname, (select fullname from users where user_id = transactions_reciever.user_id) as recipient, (select image from users where user_id = transactions_reciever.user_id) as image_reciever, transactions.transaction_type, transactions.status, transactions.amount from transactions inner join users on transactions.user_id = users.user_id left join transactions_reciever on transactions.transaction_id = transactions_reciever.transaction_id where ${dataUserAs} transactions.invoice_number like '%${keyword}%' or users.fullname like '%${keyword}%'  or transactions.status like '%${keyword}%' or transactions.transaction_type like '%${keyword}%' order by transactions.${field} ${order} limit ${start},${limit}`,
      (err, result) => {
        promiseResolveReject(resolve, reject, err, result);
      },
    );
  }
});

const updatetransaction = (status, transactionId) => new Promise((resolve, reject) => {
  connection.query(
    'UPDATE transactions SET status = ? WHERE transaction_id = ?',
    [status, transactionId],
    (err, result) => {
      promiseResolveReject(resolve, reject, err, result);
    },
  );
});

const transfer = (dataTransfer, next) => new Promise((resolve, reject) => {
  // Transaction
  const dataTransaction = {
    invoice_number: dataTransfer.invoice_number,
    user_id: dataTransfer.user_id,
    transaction_type: dataTransfer.transaction_type,
    status: 'approve',
    amount: dataTransfer.amount,
    description: dataTransfer.description,
  };
  connection.query('INSERT INTO transactions SET ?', dataTransaction, (err) => {
    if (err) {
      next(err);
    } else {
      // Transaction reciever
      connection.query(
        'SELECT * FROM transactions WHERE invoice_number = ?',
        dataTransfer.invoice_number,
        // eslint-disable-next-line no-shadow
        (err, result) => {
          if (err) {
            next(err);
          } else {
            connection.query(
              'INSERT INTO transactions_reciever SET transaction_id = ?, user_id = ?',
              [result[0].transaction_id, dataTransfer.user_reciever],
              // eslint-disable-next-line no-shadow
              (err, result) => {
                promiseResolveReject(resolve, reject, err, result);
              },
            );
          }
        },
      );
    }
  });
});
export default {
  insertDataTopup,
  insertImageTopup,
  updatetransaction,
  getAllTransaction,
  transfer,
};
