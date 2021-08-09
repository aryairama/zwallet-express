import connection from "../configs/db.js";
import { promiseResolveReject } from "../helpers/helpers.js";

const register = (data) =>
  new Promise((resolve, reject) => {
    connection.query("INSERT INTO users SET ?", data, (err, result) => {
      promiseResolveReject(resolve, reject, err, result);
    });
  });

const checkExistUser = (fieldValue, field) =>
  new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM users where ${field} = ?`,
      fieldValue,
      (error, result) => {
        promiseResolveReject(resolve, reject, error, result);
      }
    );
  });

const activateAccount = (email) =>
  new Promise((resolve, reject) => {
    connection.query(
      "UPDATE users SET email_verified = 1 WHERE email = ?",
      email,
      (err, result) => {
        promiseResolveReject(resolve, reject, err, result);
      }
    );
  });

const createPIN = (pin, email) =>
  new Promise((resolve, reject) => {
    connection.query(
      "UPDATE users SET PIN = ? WHERE email = ?",
      [pin, email],
      (err, result) => {
        promiseResolveReject(resolve, reject, err, result);
      }
    );
  });

const changePassword = (data, id) =>
  new Promise((resolve, reject) => {
    connection.query(
      "UPDATE users SET ? WHERE user_id = ?",
      [data, id],
      (err, result) => {
        promiseResolveReject(resolve, reject, err, result);
      }
    );
  });

const getUser = () =>
  new Promise((resolve, reject) => {
    connection.query("SELECT * FROM users", (error, result) => {
      promiseResolveReject(resolve, reject, error, result);
    });
  });
  
  const updateSaldo = (saldo, user_id) => new Promise((resolve, reject) => {
    connection.query("UPDATE users SET saldo = ? WHERE user_id = ?", [saldo, user_id], (err, result) => {
      promiseResolveReject(resolve, reject, err, result)
    })
  })

export default {
  register,
  checkExistUser,
  activateAccount,
  createPIN,
  changePassword,
  getUser,
  updateSaldo
};
