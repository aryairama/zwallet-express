import { body } from "express-validator";
import userModel from "../models/Users.js";

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
      const existingEmail = await userModel.checkExistUser(value, "email");
      if (existingEmail.length > 0) {
        throw new Error("e-mail already registered");
      }
      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password cannot empty")
    .bail()
    .isLength({ min: 4, max: 15 })
    .withMessage("Password min 4 & max 15"),
];

const PINRules = () => [
  body("PIN")
    .notEmpty()
    .withMessage("PIN can't empty")
    .bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("PIN must consist of 6 digits"),
  body("email")
    .notEmpty()
    .withMessage("Email cannot empty")
    .bail()
    .isEmail()
    .withMessage("Your email is invalid"),
];

export { registerFieldRules, PINRules };
