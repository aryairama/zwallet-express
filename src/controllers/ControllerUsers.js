/* eslint-disable no-shadow */
/* eslint-disable camelcase */
/* eslint-disable radix */
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const {
  response, responseError, responsePagination, createFolderImg,
} = require('../helpers/helpers');
const userModel = require('../models/Users');
const sendEmail = require('../helpers/sendEmail');
const forgotPassword = require('../helpers/forgotPassword');
const { redis } = require('../configs/redis');
const { genAccessToken, genRefreshToken } = require('../helpers/jwt');

const register = async (req, res, next) => {
  try {
    const checkExistUser = await userModel.checkExistUser(req.body.email, 'email');
    if (checkExistUser.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const form = {
        last_name: req.body.last_name,
        first_name: req.body.first_name,
        fullname: `${req.body.first_name} ${req.body.last_name}`,
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
            redis.set(`${process.env.PREFIX_REDIS}JWTACTIVATION-${id}`, token, 'EX', 60 * 60 * 24);
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

const activateAccount = async (req, res) => {
  const { email } = req;
  const user = await userModel.checkExistUser(email, 'email');
  userModel
    .activateAccount(email)
    .then(() => {
      redis.del(`${process.env.PREFIX_REDIS}JWTACTIVATION-${user[0].user_id}`);
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
        redis.set(`${process.env.PREFIX_REDIS}JWTFORGOT-${id}`, token, 'EX', 60 * 60 * 24);
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
      userModel
        .changePassword(data, id)
        .then((result) => {
          response(
            res,
            'Success change password',
            200,
            'your password has been changed successfully! Please login with your new password',
            result,
          );
          redis.del(`${process.env.PREFIX_REDIS}JWTFORGOT-${id}`);
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
    userModel
      .checkExistUser(id, 'user_id')
      .then((result) => {
        delete result[0].password;
        response(res, 'Success', 200, 'Successfully get data user', result[0]);
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
    redis.del(`${process.env.PREFIX_REDIS}jwtRefToken-${req.userLogin.user_id}`, (error, result) => {
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
      const cacheRefToken = redis.get(
        `${process.env.PREFIX_REDIS}jwtRefToken-${decode.user_id}`,
        async (error, cacheToken) => {
          if (cacheToken === refToken) {
            delete decode.iat;
            delete decode.exp;
            redis.del(`${process.env.PREFIX_REDIS}jwtRefToken-${decode.user_id}`);
            const accessToken = await genAccessToken(decode, { expiresIn: 60 * 60 });
            const newRefToken = await genRefreshToken(decode, { expiresIn: 60 * 60 * 2 });
            response(res, 'Success', 200, 'AccessToken', { accessToken, refreshToken: newRefToken });
          } else {
            responseError(res, 'Authorized failed', 403, 'Wrong refreshToken', []);
          }
        },
      );
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const existUser = await userModel.checkExistUser(req.userLogin.user_id, 'user_id');
    if (existUser.length > 0) {
      let data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        fullname: `${req.body.first_name} ${req.body.last_name}`,
      };
      if (req.body.email) {
        data = { ...data, email: req.body.email };
      }
      if (req.files) {
        createFolderImg('/public/img/profiles');
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

const readDataUser = async (req, res, next) => {
  const search = req.query.search || '';
  let order = req.query.order || '';
  if (order.toUpperCase() === 'ASC') {
    order = 'ASC';
  } else if (order.toUpperCase() === 'DESC') {
    order = 'DESC';
  } else {
    order = 'DESC';
  }
  let { fieldOrder } = req.query;
  if (fieldOrder) {
    if (fieldOrder.toLowerCase() === 'last_name') {
      fieldOrder = 'last_name';
    } else if (fieldOrder.toLowerCase() === 'first_name') {
      fieldOrder = 'first_name';
    } else {
      fieldOrder = 'user_id';
    }
  } else {
    fieldOrder = 'user_id';
  }
  let dataUsers;
  let pagination;
  try {
    const lengthRecord = await userModel.readUser(search, order, fieldOrder, req.userLogin.user_id, req.userLogin.roles);
    if (lengthRecord.length > 0) {
      const limit = req.query.limit || 5;
      const pages = Math.ceil(lengthRecord.length / limit);
      let page = req.query.page || 1;
      let nextPage = parseInt(page, 10) + 1;
      let prevPage = parseInt(page, 10) - 1;
      if (nextPage > pages) {
        nextPage = pages;
      }
      if (prevPage < 1) {
        prevPage = 1;
      }
      if (page > pages) {
        page = pages;
      } else if (page < 1) {
        page = 1;
      }
      const start = (page - 1) * limit;
      pagination = {
        countData: lengthRecord.length,
        pages,
        limit: parseInt(limit, 10),
        curentPage: parseInt(page, 10),
        nextPage,
        prevPage,
      };
      dataUsers = await userModel.readUser(
        search,
        order,
        fieldOrder,
        req.userLogin.user_id,
        req.userLogin.roles,
        start,
        limit,
      );
      responsePagination(res, 'success', 200, 'data users', dataUsers, pagination);
    } else {
      response(res, 'success', 200, 'data users', lengthRecord);
    }
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const getDataUser = await userModel.checkExistUser(req.userLogin.user_id, 'user_id');
    if (getDataUser.length > 0) {
      const comparePassword = await bcrypt.compare(req.body.old_password, getDataUser[0].password);
      if (comparePassword) {
        const salt = await bcrypt.genSalt(10);
        const changePassword = await userModel.changePassword(
          { password: await bcrypt.hash(req.body.new_password, salt) },
          req.userLogin.user_id,
        );
        if (changePassword.affectedRows) {
          return response(res, 'success', 200, 'successfully updated user data');
        }
      } else {
        return response(res, 'failed', 403, "passwords isn't match", []);
      }
    } else {
      return response(res, 'failed', 404, 'the data you want to update does not exist', []);
    }
  } catch (error) {
    next(error);
  }
};

const updatePin = async (req, res, next) => {
  try {
    const getDataUser = await userModel.checkExistUser(req.userLogin.user_id, 'user_id');
    if (getDataUser.length > 0) {
      const data = {
        PIN: req.body.PIN,
      };
      const updatePin = await userModel.changePassword(data, req.userLogin.user_id);
      if (updatePin.affectedRows) {
        return response(res, 'success', 200, 'successfully updated pin', data);
      }
      if (!updatePin.affectedRows) {
        return responseError(res, 'failed', 400, 'Failed change pin');
      }
    } else {
      return response(res, 'failed', 404, 'the data you want to update does not exist', []);
    }
  } catch (error) {
    next(error);
  }
};

const addPhoneNumber = async (req, res, next) => {
  try {
    const { user_id } = req.userLogin;
    const { phoneNumber } = req.body;
    let phoneNumberUpdate = null;
    if (phoneNumber && phoneNumber !== '+62') {
      phoneNumberUpdate = phoneNumber.toString();
    }
    userModel.updatePhoneNumber(phoneNumberUpdate, user_id)
      .then(() => {
        if (phoneNumberUpdate === null) {
          response(res, 'Success', 200, 'Successfully deleted phone number', phoneNumber);
        } else {
          response(res, 'Success', 200, 'Successfully update phone number', phoneNumber);
        }
      })
      .catch((err) => {
        responseError(res, 'Error', 500, 'Failed update phone number, please try again later', err);
      });
  } catch (err) {
    next(err);
  }
};

const deletePhoneNumber = async (req, res, next) => {
  try {
    const { user_id } = req.userLogin;
    userModel.deletePhoneNumber(user_id)
      .then(() => {
        response(res, 'Success', 200, 'Successfully delete phone number');
      })
      .catch((err) => {
        responseError(res, 'Error', 500, 'Failed delete phone number', err);
      });
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
  readDataUser,
  updatePassword,
  updatePin,
  addPhoneNumber,
  deletePhoneNumber,
};
