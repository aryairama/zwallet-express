const Jwt = require('jsonwebtoken');
const { redis } = require('../configs/redis');

const genAccessToken = (payload, option) => new Promise((resolve, reject) => {
  Jwt.sign(payload, process.env.ACCESS_SECRET_KEY, { ...option }, (err, token) => {
    if (err) {
      console.log(err);
      reject(err);
    }
    resolve(token);
  });
});

const genRefreshToken = (payload, option) => new Promise((resolve, reject) => {
  Jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, { ...option }, (err, token) => {
    if (err) {
      console.log(err);
      reject(err);
    }
    redis.set(`${process.env.PREFIX_REDIS}jwtRefToken-${payload.user_id}`, token, 'EX', option.expiresIn);
    resolve(token);
  });
});

const genVerifEmailToken = (payload, option) => new Promise((resolve, reject) => {
  Jwt.sign(payload, process.env.VERIF_SECRET_KEY, { ...option }, (err, token) => {
    if (err) {
      console.log(err);
      reject(err);
    }
    redis.set(`${process.env.PREFIX_REDIS}jwtEmailVerToken-${payload.user_id}`, token, 'EX', option.expiresIn);
    resolve(token);
  });
});

module.exports = { genAccessToken, genRefreshToken, genVerifEmailToken };
