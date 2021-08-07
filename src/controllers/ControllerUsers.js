import { response, responseError } from "../helpers/helpers.js";
import userModel from "../models/Users.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import sendEmail from "../helpers/sendEmail.js";

const register = async (req, res, next) => {
  try {
    const checkExistUser = await userModel.checkExistUser(
      req.body.email,
      "email"
    );
    if (checkExistUser.length === 0) {
      const salt = await bcrypt.genSalt(10);
      let dataUser = {
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
      };
      const addDataUser = await userModel.register(dataUser);
      if (addDataUser.affectedRows) {
        delete dataUser["password"];
        Jwt.sign(
          { username: dataUser.username, email: dataUser.email }, //semua data kecuali email pw
          process.env.VERIF_SECRET_KEY,
          { expiresIn: "24h" },
          (err, token) => {
            if (err) {
              responseError(
                res,
                "Error",
                500,
                "Failed create activation token",
                {}
              );
            } else {
              sendEmail(dataUser.email, token);
              dataUser.token = token;
              response(
                res,
                "success",
                200,
                `successfully added user data, we send link activation to ${dataUser.email}`,
                dataUser
              );
            }
          }
        );
      } else {
        responseError(res, "Error", 500, "Invalid input", {});
      }
    } else {
      responseError(res, "Error", 500, "e-mail already registered", {});
    }
  } catch (err) {
    next(err);
  }
};

const activateAccount = (req, res) => {
  const { token } = req.params;
  Jwt.verify(token, process.env.VERIF_SECRET_KEY, (err, decoded) => {
    userModel
      .activateAccount(decoded.email)
      .then(() => {
        response(res, "Success", 200, "Successfully activate account");
      })
      .catch((err) => {
        responseError(res, "Error", 500, "Failed activate account", err);
      });
  });
};

const createPIN = async (req, res, next) => {
  try {
    const { PIN, email } = req.body;
    const createUserPIN = await userModel.createPIN(PIN, email)
    if(createUserPIN.affectedRows){
      response(res, "Success", 200, "Successfully created user PIN")
    }else{
      responseError(res, "Error", 500, "Failed created user PIN")
      console.log(createUserPIN);
    }
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  activateAccount,
  createPIN
};
