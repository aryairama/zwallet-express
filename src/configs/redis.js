/* eslint-disable import/prefer-default-export */
import Redis from 'ioredis';

export const redis = new Redis({
  port: process.env.PORT_REDIS,
  host: process.env.HOST_REDIS,
  password: process.env.AUTH_REDIS,
  db: 0,
});
