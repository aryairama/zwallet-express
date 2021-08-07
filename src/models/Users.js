import connection from "../configs/db.js";
import { promiseResolveReject } from "../helpers/helpers.js";

const register = (data) =>
  new Promise((resolve, reject) => {
    connection.query("", data, (err, result) => {
      promiseResolveReject(resolve, reject, err, result);
    });
  });

export { register };
