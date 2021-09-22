const midtransClient = require('midtrans-client');

const core = new midtransClient.CoreApi({
  isProduction: JSON.parse(process.env.MIDTRANS_PRODUCTION),
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = core;
