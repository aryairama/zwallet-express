import { response, responseError } from "../helpers/helpers.js";
import userModel from "../models/Users.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import sendEmail from "../helpers/sendEmail.js";
import forgotPassword from "../helpers/forgotPassword.js";
import { redis } from "../configs/redis.js";

const register = async (req, res, next) => {
  try {
    const checkExistUser = await userModel.checkExistUser(
      req.body.email,
      "email"
    );
    if (checkExistUser.length === 0) {
      const salt = await bcrypt.genSalt(10);
      let form = {
        username: req.body.username,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
        image: "user.jpg",
      };
      const addDataUser = await userModel.register(form);
      if (addDataUser.affectedRows) {
        const user = await userModel.checkExistUser(form.email, "email");
        const dataUser = user[0];
        const id = dataUser["user_id"];
        delete dataUser["password"];
        Jwt.sign(
          { ...dataUser },
          process.env.VERIF_SECRET_KEY,
          { expiresIn: "24h" },
          (err, token) => {
            if (err) {
              responseError(
                res,
                "Error",
                500,
                "Failed create activation token",
                err
              );
            } else {
              sendEmail(dataUser.email, token, form.username);
              dataUser.token = token;
              response(
                res,
                "success",
                200,
                `successfully added user data, we send link activation to ${dataUser.email}`,
                dataUser
              );
              redis.set(`JWTACTIVATION-${id}`, token);
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
  const email = req.email;
  userModel
    .activateAccount(email)
    .then(() => {
      response(res, "Success", 200, "Successfully activate account");
    })
    .catch((err) => {
      responseError(res, "Error", 500, "Failed activate account", err);
    });
};

const createPIN = async (req, res, next) => {
  try {
    const { PIN, email } = req.body;
    const createUserPIN = await userModel.createPIN(PIN, email);
    if (createUserPIN.affectedRows) {
      response(res, "Success", 200, "Successfully created user PIN");
    } else {
      responseError(res, "Error", 500, "Failed created user PIN");
      console.log(createUserPIN);
    }
  } catch (err) {
    next(err);
  }
};

const forgotPW = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.checkExistUser(email, "email");
    const username = user[0].username;
    const id = user[0].user_id;

    Jwt.sign(
      { id, email, username },
      process.env.FORGOT_PW_SECRET_KEY,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) {
          responseError(
            res,
            "JWT Error",
            500,
            "Failed created forgot password token",
            err
          );
        } else {
          redis.set(`JWTFORGOT-${id}`, token);
          forgotPassword(email, token, username);
          response(
            res,
            "Success",
            200,
            "Successfully create token, check email for reset password"
          );
        }
      }
    );
  } catch (err) {
    next(err);
  }
};

const resetPW = (req, res) => {
  const id = req.id;
  const email = req.email;
  response(
    res,
    "Success!",
    200,
    "Now, you can change your password. Please use a strong and easy to remember your password",
    { id_user: id, email }
  );
};

const changePassword = async (req, res, next) => {
  try {
    const { password, password2, id } = req.body;
    if (password !== password2) {
      responseError(
        res,
        "Not Compare!",
        400,
        "Your password is not compare",
        {}
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const data = {
        password: await bcrypt.hash(req.body.password, salt),
      };
      await userModel
        .changePassword(data, id)
        .then((result) => {
          response(
            res,
            "Success change password",
            200,
            "your password has been changed successfully! Please login with your new password",
            result
          );
          redis.del(`JWTFORGOT-${id}`);
        })
        .catch((err) => {
          responseError(
            res,
            "Error change password",
            500,
            "Password failed to change, please try again later",
            err
          );
        });
    }
  } catch (err) {
    next(err);
  }
};

const showUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userModel
      .checkExistUser(id, "user_id")
      .then((result) => {
        response(res, "Success", 200, "Successfully get data user", result);
      })
      .catch((err) => {
        responseError(res, "Error get data", 500, "Error during get data", err);
      });
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  activateAccount,
  createPIN,
  forgotPW,
  resetPW,
  changePassword,
  showUser,
};
