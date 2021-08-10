import { validationResult } from 'express-validator';
import { responseError } from '../helpers/helpers.js';

const resultOfValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return responseError(res, 'Error', 422, 'Invalid Input', errors.errors);
  }
  next();
};

export default resultOfValidation;
