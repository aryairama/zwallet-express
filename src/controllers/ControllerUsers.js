/* eslint-disable camelcase */
/* eslint-disable radix */
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { response, responseError } from '../helpers/helpers.js';
import userModel from '../models/Users.js';
import sendEmail from '../helpers/sendEmail.js';
import forgotPassword from '../helpers/forgotPassword.js';
import { redis } from '../configs/redis.js';
import { genAccessToken, genRefreshToken } from '../helpers/jwt.js';

const register = async (req, res, next) => {
  try {
    const checkExistUser = await userModel.checkExistUser(req.body.email, 'email');
    if (checkExistUser.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const form = {
        last_name: req.body.last_name,
        first_name: req.body.first_name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
      };
      const addDataUser = await userModel.register(form);
      if (addDataUser.affectedRows) {
        const user = await userModel.checkExistUser(form.email, 'email');
        const dataUser = user[0];
        const id = dataUser.user_id;
        delete dataUser.password;
        Jwt.sign({ ...dataUser }, process.env.VERIF_SECRET_KEY, { expiresIn: '24h' }, (err, token) => {
          if (err) {
            responseError(res, 'Error', 500, 'Failed create activation token', err);
          } else {
            sendEmail(dataUser.email, token, `${form.first_name} ${form.last_name}`);
            dataUser.token = token;
            response(
              res,
              'success',
              200,
              `successfully added user data, we send link activation to ${dataUser.email}`,
              dataUser,
            );
            redis.set(`JWTACTIVATION-${id}`, token);
          }
        });
      } else {
        responseError(res, 'Error', 500, 'Invalid input', {});
      }
    } else {
      responseError(res, 'Error', 500, 'e-mail already registered', {});
    }
  } catch (err) {
    next(err);
  }
};

const activateAccount = (req, res) => {
  const { email } = req;
  userModel
    .activateAccount(email)
    .then(() => {
      response(res, 'Success', 200, 'Successfully activate account');
    })
    .catch((err) => {
      responseError(res, 'Error', 500, 'Failed activate account', err);
    });
};

const createPIN = async (req, res, next) => {
  try {
    const { PIN } = req.body;
    const createUserPIN = await userModel.createPIN(PIN, req.userLogin.email);
    if (createUserPIN.affectedRows) {
      response(res, 'Success', 200, 'Successfully created user PIN');
    } else {
      responseError(res, 'Error', 500, 'Failed created user PIN');
    }
  } catch (err) {
    next(err);
  }
};

const forgotPW = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.checkExistUser(email, 'email');
    const { first_name } = user[0];
    const { last_name } = user[0];
    const id = user[0].user_id;

    Jwt.sign({ id, email }, process.env.FORGOT_PW_SECRET_KEY, { expiresIn: '24h' }, (err, token) => {
      if (err) {
        responseError(res, 'JWT Error', 500, 'Failed created forgot password token', err);
      } else {
        redis.set(`JWTFORGOT-${id}`, token);
        forgotPassword(email, token, `${first_name} ${last_name}`);
        response(res, 'Success', 200, 'Successfully create token, check email for reset password');
      }
    });
  } catch (err) {
    next(err);
  }
};

const resetPW = (req, res) => {
  const { id } = req;
  const { email } = req;
  response(
    res,
    'Success!',
    200,
    'Now, you can change your password. Please use a strong and easy to remember your password',
    { id_user: id, email },
  );
};

const changePassword = async (req, res, next) => {
  try {
    const { password, password2, id } = req.body;
    if (password !== password2) {
      responseError(res, 'Not Compare!', 400, 'Your password is not compare', {});
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
            'Success change password',
            200,
            'your password has been changed successfully! Please login with your new password',
            result,
          );
          redis.del(`JWTFORGOT-${id}`);
        })
        .catch((err) => {
          responseError(res, 'Error change password', 500, 'Password failed to change, please try again later', err);
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
      .checkExistUser(id, 'user_id')
      .then((result) => {
        response(res, 'Success', 200, 'Successfully get data user', result);
      })
      .catch((err) => {
        responseError(res, 'Error get data', 500, 'Error during get data', err);
      });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const dataUser = await userModel.checkExistUser(email, 'email');
    const pw = dataUser[0].password;
    if (dataUser[0].email_verified === 0) {
      responseError(res, 'Email not verified', 400, 'Your email has not been verified, please verify first!');
    } else {
      bcrypt.compare(password, pw, async (err, resCompare) => {
        if (!err) {
          if (resCompare) {
            delete dataUser[0].password;
            const accessToken = await genAccessToken({ ...dataUser[0] }, { expiresIn: 60 * 60 });
            const refreshToken = await genRefreshToken({ ...dataUser[0] }, { expiresIn: parseInt(60 * 60 * 2) });
            // const refreshToken = await genRefreshToken(user, { expiresIn: 60 * 60 * 2 });
            response(res, 'Login Success', 200, 'Login successfull', {
              ...dataUser[0],
              accessToken,
              refreshToken,
            });
          } else {
            responseError(res, 'Password wrong', 400, 'Your password is wrong');
          }
        } else {
          responseError(res, 'Bcrypt Error', 500, 'Error during matching data', err);
        }
      });
    }
  } catch (err) {
    next(err);
  }
};

const logout = (req, res, next) => {
  try {
    // eslint-disable-next-line no-unused-vars
    redis.del(`jwtRefToken-${req.userLogin.user_id}`, (error, result) => {
      if (error) {
        next(error);
      } else {
        response(res, 'Logout', 200, 'Logout success', []);
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refToken = req.body.refreshToken;
    if (!refToken) {
      return responseError(res, 'Authorized failed', 401, 'Server need refreshToken', []);
    }
    Jwt.verify(refToken, process.env.REFRESH_TOKEN_SECRET_KEY, (err, decode) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          responseError(res, 'Authorized failed', 401, 'token expired', []);
        } else if (err.name === 'JsonWebTokenError') {
          responseError(res, 'Authorized failed', 401, 'token invalid', []);
        } else {
          responseError(res, 'Authorized failed', 401, 'token not active', []);
        }
      }
      // eslint-disable-next-line no-unused-vars
      const cacheRefToken = redis.get(`jwtRefToken-${decode.user_id}`, async (error, cacheToken) => {
        if (cacheToken === refToken) {
          delete decode.iat;
          delete decode.exp;
          redis.del(`jwtRefToken-${decode.user_id}`);
          const accessToken = await genAccessToken(decode, { expiresIn: 60 * 60 });
          const newRefToken = await genRefreshToken(decode, { expiresIn: 60 * 60 * 2 });
          response(res, 'Success', 200, 'AccessToken', { accessToken, refreshToken: newRefToken });
        } else {
          responseError(res, 'Authorized failed', 403, 'Wrong refreshToken', []);
        }
      });
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const existUser = await userModel.checkExistUser(req.userLogin.user_id, 'user_id');
    console.log(existUser.length);
    if (existUser.length > 0) {
      let data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
      };
      if (req.body.email) {
        data = { ...data, email: req.body.email };
      }
      if (req.files) {
        if (req.files.image) {
          if (existUser[0].image && existUser[0].image.length > 10) {
            fs.unlink(path.join(path.dirname(''), `/${existUser[0].image}`));
          }
          const filename = uuidv4() + path.extname(req.files.image.name);
          const savePath = path.join(path.dirname(''), '/public/img/profiles', filename);
          data = { ...data, image: `public/img/profiles/${filename}` };
          req.files.image.mv(savePath);
        }
      }
      const changeDataUser = await userModel.changePassword(data, req.userLogin.user_id);
      console.log(data);
      if (changeDataUser.affectedRows) {
        return response(res, 'success', 200, 'successfully updated user data', data);
      }
      return responseError(res, 'error', 500, 'Update failed', {});
    }
    return responseError(res, 'Failed', 404, 'User not found', {});
  } catch (error) {
    next(error);
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
  login,
  logout,
  refreshToken,
  updateProfile,
};
