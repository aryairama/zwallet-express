import { body } from 'express-validator';
import userModel from '../models/Users.js';

const registerFieldRules = () => [
  body('first_name')
    .notEmpty()
    .withMessage('first_name cannot empty')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Username min 3 & max 100'),
  body('last_name')
    .notEmpty()
    .withMessage('first_name cannot empty')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Username min 3 & max 100'),
  body('email')
    .notEmpty()
    .withMessage('Email cannot empty')
    .bail()
    .isEmail()
    .withMessage('Your email is invalid')
    .bail()
    .custom(async (value) => {
      const existingEmail = await userModel.checkExistUser(value, 'email');
      if (existingEmail.length > 0) {
        throw new Error('e-mail already registered');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password cannot empty')
    .bail()
    .isLength({ min: 4, max: 15 })
    .withMessage('Password min 4 & max 15'),
];

const PINRules = () => [
  body('PIN')
    .notEmpty()
    .withMessage("PIN can't empty")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage('PIN must consist of 6 digits'),
  body('email').notEmpty().withMessage('Email cannot empty').bail().isEmail().withMessage('Your email is invalid'),
];

const emailRules = () => [
  body('email')
    .notEmpty()
    .withMessage('Email cannot empty')
    .bail()
    .isEmail()
    .withMessage('Your email is invalid')
    .bail()
    .custom(async (value) => {
      const existingEmail = await userModel.checkExistUser(value, 'email');
      if (existingEmail.length <= 0) {
        throw new Error('e-mail not found');
      }
      return true;
    }),
];

const changePasswordRules = () => [
  body('password')
    .notEmpty()
    .withMessage('Please insert new password')
    .bail()
    .isLength({ min: 4, max: 15 })
    .withMessage('Password min 4 & max 15'),
  body('password2')
    .notEmpty()
    .withMessage('Please insert compare password')
    .bail()
    .isLength({ min: 4, max: 15 })
    .withMessage('Password min 4 & max 15'),
];

const loginFieldRules = () => [
  body('email')
    .notEmpty()
    .withMessage('Please enter your email')
    .bail()
    .isEmail()
    .withMessage('Your email is invalid')
    .bail()
    .custom(async (value) => {
      const existingEmail = await userModel.checkExistUser(value, 'email');
      if (existingEmail.length <= 0) {
        throw new Error('Your email not found');
      }
      return true;
    }),
  body('password').notEmpty().withMessage('Please enter your password'),
];

export { registerFieldRules, PINRules, emailRules, changePasswordRules, loginFieldRules };
