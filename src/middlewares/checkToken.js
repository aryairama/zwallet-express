/* eslint-disable no-shadow */
const Jwt = require('jsonwebtoken');
const { redis } = require('../configs/redis');
const { responseError } = require('../helpers/helpers');

const checkTokenResetPassword = (req, res, next) => {
  const { token } = req.params;
  Jwt.verify(token, process.env.FORGOT_PW_SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        responseError(
          res,
          'Token Expired !',
          400,
          'Token is expired, please request forgot password again to generate a new token',
        );
      } else if (err.name === 'JsonWebTokenError') {
        responseError(
          res,
          'Token Invalid',
          400,
          'Token is invalid, please request forgot password again to generate a valid token',
        );
      } else {
        responseError(
          res,
          'Token Unactive',
          400,
          'Token is Unactive, please request forgot password again to generate a active token',
        );
      }
    } else {
      redis.get(`${process.env.PREFIX_REDIS}JWTFORGOT-${decoded.id}`, (err, redisToken) => {
        if (err) {
          responseError(res, 'Empty key redis', 400, "you didn't request to reset password", err);
        } else if (token === redisToken) {
          req.id = decoded.id;
          req.email = decoded.email;
          next();
        } else {
          responseError(res, 'Token is not compare', 400, 'Your token is invalid');
        }
      });
    }
  });
};

const checkTokenActivation = (req, res, next) => {
  const { token } = req.params;
  Jwt.verify(token, process.env.VERIF_SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        responseError(
          res,
          'Token Expired !',
          400,
          'Token is expired, please request activation again to generate a new token',
        );
      } else if (err.name === 'JsonWebTokenError') {
        responseError(
          res,
          'Token Invalid',
          400,
          'Token is invalid, please request activation again to generate a valid token',
        );
      } else {
        responseError(
          res,
          'Token Unactive',
          400,
          'Token is Unactive, please request activation again to generate a active token',
        );
      }
    } else {
      redis.get(`${process.env.PREFIX_REDIS}JWTACTIVATION-${decoded.user_id}`, (err, redisToken) => {
        if (err) {
          responseError(res, 'Empty key redis', 400, 'Your account activation is invalid', err);
        } else if (token === redisToken) {
          req.id = decoded.id;
          req.email = decoded.email;
          next();
        } else {
          responseError(res, 'Token is not compare', 400, 'Your token is invalid');
        }
      });
    }
  });
};

module.exports = { checkTokenResetPassword, checkTokenActivation };
