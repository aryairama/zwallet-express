const connection = require('../configs/db');
const { promiseResolveReject } = require('../helpers/helpers');

const register = (data) => new Promise((resolve, reject) => {
  connection.query('INSERT INTO users SET ?', data, (err, result) => {
    promiseResolveReject(resolve, reject, err, result);
  });
});

const checkExistUser = (fieldValue, field) => new Promise((resolve, reject) => {
  connection.query(`SELECT * FROM users where ${field} = ?`, fieldValue, (error, result) => {
    promiseResolveReject(resolve, reject, error, result);
  });
});

const activateAccount = (email) => new Promise((resolve, reject) => {
  connection.query('UPDATE users SET email_verified = 1 WHERE email = ?', email, (err, result) => {
    promiseResolveReject(resolve, reject, err, result);
  });
});

const createPIN = (pin, email) => new Promise((resolve, reject) => {
  connection.query('UPDATE users SET PIN = ? WHERE email = ?', [pin, email], (err, result) => {
    promiseResolveReject(resolve, reject, err, result);
  });
});

const changePassword = (data, id) => new Promise((resolve, reject) => {
  connection.query('UPDATE users SET ? WHERE user_id = ?', [data, id], (err, result) => {
    promiseResolveReject(resolve, reject, err, result);
  });
});

const getUser = () => new Promise((resolve, reject) => {
  connection.query('SELECT * FROM users', (error, result) => {
    promiseResolveReject(resolve, reject, error, result);
  });
});

const updateSaldo = (saldo, userId) => new Promise((resolve, reject) => {
  connection.query('UPDATE users SET saldo = ? WHERE user_id = ?', [saldo, userId], (err, result) => {
    promiseResolveReject(resolve, reject, err, result);
  });
});

const readUser = (search, order, fieldOrder, userLogin, roles, start = '', limit = '') => new Promise((resolve, reject) => {
  let othersql = '';
  if (roles === 'member') {
    othersql = 'AND roles != "admin"';
  } else if (roles === 'admin') {
    othersql = '';
  }
  if (limit !== '' && start !== '') {
    connection.query(
      `SELECT * FROM users WHERE 
      (first_name LIKE "%${search}%" OR last_name LIKE "%${search}%" OR phone_number LIKE "%${search}%" OR email LIKE "%${search}%"
      OR fullname LIKE "%${search}%") AND user_id != ${userLogin} ${othersql}
      ORDER BY ${fieldOrder} ${order} LIMIT ${start} , ${limit}`,
      (error, result) => {
        promiseResolveReject(resolve, reject, error, result);
      },
    );
  } else {
    connection.query(
      `SELECT * FROM users WHERE 
      (first_name LIKE "%${search}%" OR last_name LIKE "%${search}%" OR phone_number LIKE "%${search}%" OR email LIKE "%${search}%"
      OR fullname LIKE "%${search}%") AND user_id != ${userLogin} ${othersql}
      ORDER BY ${fieldOrder} ${order}`,
      (error, result) => {
        promiseResolveReject(resolve, reject, error, result);
      },
    );
  }
});

const updatePhoneNumber = (phoneNumber, userId) => new Promise((resolve, reject) => {
  connection.query(`UPDATE users SET phone_number = '${phoneNumber}' WHERE user_id = ${userId}`, (err, result) => {
    promiseResolveReject(resolve, reject, err, result);
  });
});

const deletePhoneNumber = (userId) => new Promise((resolve, reject) => {
  connection.query(`UPDATE users SET phone_number = '' WHERE user_id = ${userId}`, (err, result) => {
    promiseResolveReject(resolve, reject, err, result);
  });
});

module.exports = {
  register,
  checkExistUser,
  activateAccount,
  createPIN,
  changePassword,
  getUser,
  updateSaldo,
  readUser,
  updatePhoneNumber,
  deletePhoneNumber,
};
