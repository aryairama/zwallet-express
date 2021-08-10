import express from 'express';
import {
  registerFieldRules,
  PINRules,
  emailRules,
  changePasswordRules,
  loginFieldRules,
  rulesUpdateImageProfile,
  rulesFileUploud,
  rulesPassword,
  updateEmail,
  registerEmail,
  rulesRead,
} from '../validations/ValidatonUsers.js';
import resultOfValidation from '../validations/ValidationResult.js';
import constrollerUsers from '../controllers/ControllerUsers.js';
import { checkTokenResetPassword, checkTokenActivation } from '../middlewares/checkToken.js';
import { Auth, Role } from '../middlewares/Auth.js';

const router = express.Router();

router
  .get('/', Auth, Role('member', 'admin'), rulesRead(), resultOfValidation, constrollerUsers.readDataUser)
  .post('/', registerFieldRules(), rulesPassword(), registerEmail(), resultOfValidation, constrollerUsers.register)
  .put(
    '/',
    Auth,
    Role('member'),
    rulesFileUploud,
    updateEmail(),
    rulesUpdateImageProfile(),
    registerFieldRules(),
    resultOfValidation,
    constrollerUsers.updateProfile,
  )
  .post('/login', loginFieldRules(), resultOfValidation, constrollerUsers.login)
  .delete('/logout', Auth, Role('member', 'admin'), constrollerUsers.logout)
  .post('/refreshtoken', constrollerUsers.refreshToken)
  .get('/activation/:token', checkTokenActivation, constrollerUsers.activateAccount)
  .get('/show/:id', Auth, Role('member', 'admin'), constrollerUsers.showUser)
  // Forgot password
  .post('/forgotpassword', emailRules(), resultOfValidation, constrollerUsers.forgotPW)
  .get('/forgotpassword/:token', checkTokenResetPassword, constrollerUsers.resetPW)
  .post('/changepassword', changePasswordRules(), resultOfValidation, constrollerUsers.changePassword)

  // main feature
  .post('/createpin', Auth, Role('member'), PINRules(), resultOfValidation, constrollerUsers.createPIN);

export default router;
