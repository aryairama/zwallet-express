import { body } from "express-validator";
import userModel from '../models/Users.js'

const registerFieldRules = () => [
  body("username")
    .notEmpty()
    .withMessage("Username cannot empty")
    .bail()
    .isLength({ min: 4, max: 40 })
    .withMessage("Username min 4 & max 40"),
  body("email")
    .notEmpty()
    .withMessage("Email cannot empty")
    .bail()
    .isEmail()
    .withMessage("Your email is invalid")
    .bail()
    .custom(async (value) => {
      const existingEmail = await userModel.checkExistUser(value, 'email');
      if (existingEmail.length > 0) {
        throw new Error('e-mail already registered');
      }
      return true;
    })
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password cannot empty")
    .bail()
    .isLength({ min: 4, max: 15 })
    .withMessage("Password min 4 & max 15"),
];

export {
    registerFieldRules
}