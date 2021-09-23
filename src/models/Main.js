/* eslint-disable max-len */
const connection = require('../configs/db');
const { promiseResolveReject } = require('../helpers/helpers');

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
  let dataUserAs = '';
  const byUser = `(transactions.user_id = ${userId} or transactions_reciever.user_id = ${userId})`;
  const search = `(transactions.invoice_number like "%${keyword}%" or users.fullname like "%${keyword}%" or transactions.status like "%${keyword}%" or transactions.transaction_type like "%${keyword}%")`;
  if (userId === 0) {
    dataUserAs = search;
  } else {
    dataUserAs = `${byUser} AND ${search}`;
  }
  if (order === '' && field === '' && start === '' && limit === '') {
    connection.query(
      // eslint-disable-next-line max-len
      `select transactions.image_topup, transactions.transaction_id, transactions.invoice_number, left(transactions.created_at, 16) as timeTransaction, users.fullname, (select fullname from users where user_id = transactions_reciever.user_id) as recipient, (select image from users where user_id = transactions_reciever.user_id) as image_reciever,users.image, transactions.transaction_type, transactions.status, transactions.amount from transactions inner join users on transactions.user_id = users.user_id left join transactions_reciever on transactions.transaction_id = transactions_reciever.transaction_id where ${dataUserAs}`,
      (err, result) => {
        promiseResolveReject(resolve, reject, err, result);
      },
    );
  } else {
    connection.query(
      // eslint-disable-next-line max-len
      `select transactions.image_topup, transactions.transaction_id, transactions.invoice_number, left(transactions.created_at, 16) as timeTransaction, transactions.user_id as sender_id, users.fullname, transactions_reciever.user_id as id_recipient, (select fullname from users where user_id = transactions_reciever.user_id) as recipient, (select image from users where user_id = transactions_reciever.user_id) as image_reciever, users.image,transactions.transaction_type, transactions.status, transactions.amount from transactions inner join users on transactions.user_id = users.user_id left join transactions_reciever on transactions.transaction_id = transactions_reciever.transaction_id where ${dataUserAs} order by transactions.${field} ${order} limit ${start},${limit}`,
      (err, result) => {
        promiseResolveReject(resolve, reject, err, result);
      },
    );
  }
});

const showtransaction = (userId, transactionId) => new Promise((resolve, reject) => {
  let dataUserAs = `(transactions.user_id = ${userId} or transactions_reciever.user_id = ${userId}) and`;
  if (userId === 0) {
    dataUserAs = '';
  }
  // eslint-disable-next-line max-len
  connection.query(
    `select transactions.transaction_id,transactions.image_topup, transactions.invoice_number, transactions.user_id, left(transactions.created_at, 16) as timeTransaction, 
    users.fullname, transactions_reciever.user_id as id_recipient, (select fullname from users where user_id = transactions_reciever.user_id) as recipient,
     (select image from users where user_id = transactions_reciever.user_id) as image_reciever,
      (select phone_number from users where user_id = transactions_reciever.user_id) as phone_reciever,
       transactions.amount, transactions.transaction_type, transactions.status, transactions.description from
       transactions inner join users on transactions.user_id = users.user_id left join transactions_reciever on 
       transactions.transaction_id = transactions_reciever.transaction_id where ${dataUserAs} transactions.transaction_id = ${transactionId}`,
    (err, result) => {
      promiseResolveReject(resolve, reject, err, result);
    },
  );
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

const getDataTopup = (keyword, order = '', fieldOrder = '', start = '', limit = '') => new Promise((resolve, reject) => {
  if (order === '' && fieldOrder === '' && start === '' && limit === '') {
    connection.query(
      `select users.image as user_image, transactions.transaction_id, transactions.invoice_number, transactions.user_id, users.fullname, transactions.status, transactions.image_topup, transactions.amount, transactions.created_at from transactions inner join users on transactions.user_id = users.user_id where transactions.transaction_type = 'topup' and (invoice_number like '%${keyword}%' or users.fullname like '%${keyword}%' or transactions.status like '%${keyword}%')`,
      (err, result) => {
        promiseResolveReject(resolve, reject, err, result);
      },
    );
  } else {
    connection.query(
      `select users.image as user_image, transactions.transaction_id, transactions.invoice_number, transactions.user_id, users.fullname, transactions.status, transactions.image_topup, transactions.amount, transactions.created_at from transactions inner join users on transactions.user_id = users.user_id where transactions.transaction_type = 'topup' and (invoice_number like '%${keyword}%' or users.fullname like '%${keyword}%' or transactions.status like '%${keyword}%') order by ${fieldOrder} ${order} limit ${start}, ${limit}`,
      (err, result) => {
        promiseResolveReject(resolve, reject, err, result);
      },
    );
  }
});
const insertDataPayment = (data) => new Promise((resolve, reject) => {
  connection.query('INSERT INTO payments SET ?', data, (err, result) => {
    promiseResolveReject(resolve, reject, err, result);
  });
});

const checkExistTransaction = (fieldValue, field) => new Promise((resolve, reject) => {
  connection.query(`SELECT * FROM transactions where ${field} = ?`, fieldValue, (error, result) => {
    promiseResolveReject(resolve, reject, error, result);
  });
});

const checkExistPayment = (fieldValue, field) => new Promise((resolve, reject) => {
  connection.query(`SELECT * FROM payments where ${field} = ?`, fieldValue, (error, result) => {
    promiseResolveReject(resolve, reject, error, result);
  });
});

const updatePayment = (status, transactionId) => new Promise((resolve, reject) => {
  connection.query(
    'UPDATE payments SET status = ? WHERE transaction_id = ?',
    [status, transactionId],
    (err, result) => {
      promiseResolveReject(resolve, reject, err, result);
    },
  );
});

module.exports = {
  insertDataTopup,
  insertImageTopup,
  updatetransaction,
  getAllTransaction,
  transfer,
  showtransaction,
  getDataTopup,
  insertDataPayment,
  checkExistPayment,
  checkExistTransaction,
  updatePayment,
};
