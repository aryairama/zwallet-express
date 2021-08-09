import express from 'express';
import {
  registerFieldRules,
  PINRules,
  emailRules,
  changePasswordRules,
  loginFieldRules,
} from '../validations/ValidatonUsers.js';
import resultOfValidation from '../validations/ValidationResult.js';
import constrollerUsers from '../controllers/ControllerUsers.js';
import { checkTokenResetPassword, checkTokenActivation } from '../middlewares/checkToken.js';
import { Auth, Role } from '../middlewares/Auth.js';
const router = express.Router();

router
  .post('/', registerFieldRules(), resultOfValidation, constrollerUsers.register)
  .post('/login', loginFieldRules(), resultOfValidation, constrollerUsers.login)
  .get('/activation/:token', checkTokenActivation, constrollerUsers.activateAccount)
  .get('/show/:id', Auth, Role('member', 'admin'), constrollerUsers.showUser)

  // Forgot password
  .post('/forgotpassword', emailRules(), resultOfValidation, constrollerUsers.forgotPW)
  .get('/forgotpassword/:token', checkTokenResetPassword, constrollerUsers.resetPW)
  .post('/changepassword', changePasswordRules(), resultOfValidation, constrollerUsers.changePassword)

  // main feature
  .post('/createpin', Auth, Role('member'), PINRules(), resultOfValidation, constrollerUsers.createPIN)

export default router;
