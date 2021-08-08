import express from "express";
import {
  registerFieldRules,
  PINRules,
  emailRules,
  changePasswordRules,
  loginFieldRules,
} from "../validations/ValidatonUsers.js";
import resultOfValidation from "../validations/ValidationResult.js";
import constrollerUsers from "../controllers/ControllerUsers.js";
import {
  checkTokenResetPassword,
  checkTokenActivationPassword,
} from "../middlewares/checkToken.js";
const router = express.Router();

router
  .post(
    "/",
    registerFieldRules(),
    resultOfValidation,
    constrollerUsers.register
  )
  .post("/login", loginFieldRules(), resultOfValidation, constrollerUsers.login)
  .get(
    "/activation/:token",
    checkTokenActivationPassword,
    constrollerUsers.activateAccount
  )
  .get("/show/:id", constrollerUsers.showUser)

  // Forgot password
  .post(
    "/forgotpassword",
    emailRules(),
    resultOfValidation,
    constrollerUsers.forgotPW
  )
  .get(
    "/forgotpassword/:token",
    checkTokenResetPassword,
    constrollerUsers.resetPW
  )
  .post(
    "/changepassword",
    changePasswordRules(),
    resultOfValidation,
    constrollerUsers.changePassword
  )

  .post(
    "/createpin",
    PINRules(),
    resultOfValidation,
    constrollerUsers.createPIN
  );

export default router;
