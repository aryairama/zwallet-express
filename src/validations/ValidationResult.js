const { validationResult } = require('express-validator');
const { responseError } = require('../helpers/helpers');

const resultOfValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseError(res, 'Error', 422, 'Invalid Input', errors.errors);
  }
  next();
};

module.exports = resultOfValidation;
