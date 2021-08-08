/* eslint-disable import/prefer-default-export */
import Jwt from "jsonwebtoken";
import { redis } from "../configs/redis.js";

export const genAccessToken = (payload, option) =>
  new Promise((resolve, reject) => {
    Jwt.sign(
      payload,
      process.env.ACCESS_SECRET_KEY,
      { ...option },
      (err, token) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(token);
      }
    );
  });

export const genRefreshToken = (payload, option) =>
  new Promise((resolve, reject) => {
    Jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET_KEY,
      { ...option },
      (err, token) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        redis.set(
          `jwtRefToken-${payload.user_id}`,
          token,
          "EX",
          option.expiresIn
        );
        resolve(token);
      }
    );
  });

export const genVerifEmailToken = (payload, option) =>
  new Promise((resolve, reject) => {
    Jwt.sign(
      payload,
      process.env.VERIF_SECRET_KEY,
      { ...option },
      (err, token) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        redis.set(
          `jwtEmailVerToken-${payload.user_id}`,
          token,
          "EX",
          option.expiresIn
        );
        resolve(token);
      }
    );
  });
