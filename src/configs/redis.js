const Redis = require('ioredis');

const redis = new Redis({
  path: process.env.PATH_REDIS,
  port: process.env.PORT_REDIS,
  host: process.env.HOST_REDIS,
  password: process.env.AUTH_REDIS,
  db: 0,
});

module.exports = { redis };
