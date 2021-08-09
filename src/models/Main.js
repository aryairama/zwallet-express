import connection from "../configs/db.js";
import { promiseResolveReject } from "../helpers/helpers.js";

const insertDataTopup = (data) =>
  new Promise((resolve, reject) => {
    connection.query("INSERT INTO transactions SET ?", data, (err, result) => {
      promiseResolveReject(resolve, reject, err, result);
    });
  });

const insertImageTopup = (filename, invoice_number) =>
  new Promise((resolve, reject) => {
    connection.query("UPDATE transaction SET image_topup = ? WHERE invoice_number = ?", [filename, invoice_number], (err, result) => {
      promiseResolveReject(resolve, reject, err, result);
    });
  });

export default {
  insertDataTopup,
  insertImageTopup
};
