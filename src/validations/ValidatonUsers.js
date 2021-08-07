import { body } from "express-validator";

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
    .withMessage("Your email is invalid"),
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